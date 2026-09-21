import { useEffect, useState } from "react";
import { Download, RefreshCw, Server } from "lucide-react";
import { CustomerTable } from "../components/customers/CustomerTable";
import { api, type ApiCustomer } from "../services/api";
import { downloadCsv } from "../lib/csv";
import type { Customer } from "../types";

function mapCustomer(row: ApiCustomer): Customer {
  const risk =
    row.risk_level === "churned"
      ? "Critical"
      : row.risk_level === "high"
      ? "High"
      : row.risk_level === "medium"
      ? "Medium"
      : "Low";
  const signal = Array.isArray(row.risk_signal)
    ? row.risk_signal.join(", ")
    : String(row.risk_signal ?? "No signal provided");
  return {
    id: row.record_id,
    name: row.record_id,
    segment: "Source segment unavailable",
    risk,
    churnProbability: 0,
    customerValue: row.mrr_usd,
    revenueAtRisk: 0,
    reason: signal,
    action: row.recommended_action,
    plan: row.plan_name,
    tenure: `${row.tenure_months} months`,
    engagement: "Source metric unavailable",
    tickets: 0,
  };
}

export function LiveCustomersPage() {
  const [rows, setRows] = useState<ApiCustomer[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getCustomers("page=1&page_size=100")
      .then((response) => {
        setRows(response.items);
        setTotalCount(response.total);
      })
      .catch(() => setError("Customer API unavailable."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      let allItems: ApiCustomer[] = [...rows];
      const page1 = await api.getCustomers("page=1&page_size=100");
      allItems = [...page1.items];
      for (let p = 2; p <= page1.pages; p++) {
        const nextPage = await api.getCustomers(`page=${p}&page_size=100`);
        allItems.push(...nextPage.items);
      }
      const exportRows = allItems.map((row) => ({
        customer_id: row.record_id,
        risk_level: row.risk_level,
        plan_name: row.plan_name,
        plan_type: row.plan_type,
        tenure_months: row.tenure_months,
        mrr_usd: row.mrr_usd,
        persona: row.customer_persona || "N/A",
        churn_signals: Array.isArray(row.risk_signal)
          ? row.risk_signal.join("; ")
          : String(row.risk_signal ?? ""),
        recommended_action: row.recommended_action,
        outcome: row.resolution_outcome || "N/A",
      }));
      downloadCsv("customers.csv", exportRows, {
        customer_id: "Customer ID",
        risk_level: "Risk Level",
        plan_name: "Plan Name",
        plan_type: "Billing Cycle",
        tenure_months: "Tenure (Months)",
        mrr_usd: "MRR (USD)",
        persona: "Customer Persona",
        churn_signals: "Risk Signals",
        recommended_action: "Recommended Action",
        outcome: "Resolution Outcome",
      });
    } catch {
      alert("Failed to export customers.");
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (
      <div className="loading-state">
        <RefreshCw className="spin" size={20} /> Loading customers...
      </div>
    );
  if (error)
    return (
      <div className="error-state">
        <Server size={22} />
        <h2>Customers unavailable</h2>
        <p>{error}</p>
        <button className="button primary" onClick={load}>
          Retry
        </button>
      </div>
    );

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Customer intelligence</span>
          <h1>Customers</h1>
          <p>
            Real customer records loaded from the analytics API. Risk probabilities appear only when persisted model predictions exist.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            onClick={handleExport}
            disabled={exporting || !rows.length}
          >
            <Download size={15} /> {exporting ? "Exporting all..." : "Export CSV"}
          </button>
          <button className="button secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>
      <div className="customer-summary">
        <div>
          <b>{totalCount || rows.length}</b> total portfolio records
        </div>
        <div>
          <b>{rows.filter((row) => row.risk_level === "high").length}</b> observed high-risk in current batch
        </div>
        <div>
          <b>{rows.filter((row) => row.risk_level === "churned").length}</b> observed churned accounts
        </div>
      </div>
      <CustomerTable rows={rows.map(mapCustomer)} />
    </>
  );
}
