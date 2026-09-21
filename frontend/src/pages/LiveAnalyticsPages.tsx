import { useEffect, useState, type ReactNode } from "react";
import { Download, RefreshCw, Server, Info, AlertTriangle } from "lucide-react";
import { TrendChart } from "../components/charts/AnalyticsCharts";
import { api, type ApiCustomer } from "../services/api";
import { downloadCsv } from "../lib/csv";

function useApi<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    load()
      .then(setData)
      .catch(() => setError("Analytics API could not be reached."))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);
  return { data, loading, error, refresh };
}

function State({
  loading,
  error,
  refresh,
  children,
}: {
  loading: boolean;
  error: string | null;
  refresh: () => void;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div className="loading-state">
        <RefreshCw className="spin" size={20} /> Loading live analytics...
      </div>
    );
  if (error)
    return (
      <div className="error-state">
        <Server size={22} />
        <h2>Analytics unavailable</h2>
        <p>{error}</p>
        <button className="button primary" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  return <>{children}</>;
}

export function LiveChurnPage() {
  const state = useApi(() => api.getChurnAnalytics());
  const [exporting, setExporting] = useState(false);
  const data = state.data as {
    by_subscription?: { name: string; churn_rate: number }[];
    by_tenure?: { name: string; churn_rate: number }[];
    churned_customers?: number;
    total_customers?: number;
    note?: string;
  } | null;

  const handleExportChurnRiskCustomers = async () => {
    setExporting(true);
    try {
      const response = await api.getCustomers("page=1&page_size=100");
      const highRisk = response.items.filter(
        (c) => c.risk_level === "high" || c.risk_level === "churned"
      );
      const rows = highRisk.map((c) => ({
        customer_id: c.record_id,
        risk_level: c.risk_level,
        mrr_usd: c.mrr_usd,
        plan_name: c.plan_name,
        plan_type: c.plan_type,
        tenure_months: c.tenure_months,
        churn_signals: Array.isArray(c.risk_signal) ? c.risk_signal.join("; ") : String(c.risk_signal ?? ""),
        recommended_action: c.recommended_action,
      }));
      downloadCsv("churn-risk-customers.csv", rows, {
        customer_id: "Customer ID",
        risk_level: "Risk Level",
        mrr_usd: "MRR (USD)",
        plan_name: "Plan Name",
        plan_type: "Billing Cycle",
        tenure_months: "Tenure (Months)",
        churn_signals: "Observed Signals",
        recommended_action: "Recommended Action",
      });
    } catch {
      alert("Failed to export churn-risk customers.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <State {...state}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Churn analytics</span>
          <h1>Observed churn patterns</h1>
          <p>{data?.note ?? "Source-label associations only; no causal interpretation."}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            onClick={handleExportChurnRiskCustomers}
            disabled={exporting}
          >
            <Download size={15} /> {exporting ? "Exporting..." : "Export Churn-Risk Customers"}
          </button>
          <button className="button secondary" onClick={state.refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Subscription breakdown</span>
              <h2>Churn by subscription plan</h2>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                downloadCsv("churn-by-subscription.csv", data?.by_subscription ?? [], {
                  name: "Subscription Plan",
                  churn_rate: "Observed Churn Rate (%)",
                })
              }
              disabled={!data?.by_subscription?.length}
            >
              <Download size={15} /> Export rates
            </button>
          </div>
          {data?.by_subscription && data.by_subscription.length > 0 ? (
            <TrendChart
              data={data.by_subscription.map((item) => ({
                name: item.name,
                value: item.churn_rate,
              }))}
              type="bar"
              suffix="%"
            />
          ) : (
            <div className="empty-state">No subscription churn data returned.</div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Tenure breakdown</span>
              <h2>Churn by customer tenure (months)</h2>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                downloadCsv("churn-by-tenure.csv", data?.by_tenure ?? [], {
                  name: "Tenure Band (Months)",
                  churn_rate: "Observed Churn Rate (%)",
                })
              }
              disabled={!data?.by_tenure?.length}
            >
              <Download size={15} /> Export rates
            </button>
          </div>
          {data?.by_tenure && data.by_tenure.length > 0 ? (
            <TrendChart
              data={data.by_tenure.map((item) => ({
                name: item.name,
                value: item.churn_rate,
              }))}
              type="bar"
              suffix="%"
            />
          ) : (
            <div className="empty-state">No tenure churn data returned.</div>
          )}
        </section>
      </div>
    </State>
  );
}

export function LiveSegmentsPage() {
  const state = useApi(() => api.getSegments());
  const data = state.data as {
    segments?: { name: string; customers: number }[];
    items?: { customer_id: string; segment: string; monetary_proxy: number; engagement_proxy: number }[];
    method?: string;
  } | null;

  const handleExportSegmentCustomers = () => {
    if (!data?.items || !data.items.length) {
      if (data?.segments) {
        downloadCsv("rfm-segments-summary.csv", data.segments, {
          name: "Segment Name",
          customers: "Customer Count",
        });
      }
      return;
    }
    downloadCsv("rfm-segments.csv", data.items, {
      customer_id: "Customer ID",
      segment: "Assigned Segment",
      monetary_proxy: "Monetary Value Proxy (USD)",
      engagement_proxy: "Engagement Score Proxy (%)",
    });
  };

  return (
    <State {...state}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Segmentation</span>
          <h1>RFM proxy segments</h1>
          <p>{data?.method ?? "Proxy segmentation: MRR x tenure for monetary value; seat utilization for engagement."}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            onClick={handleExportSegmentCustomers}
            disabled={!data?.items?.length && !data?.segments?.length}
          >
            <Download size={15} /> Export RFM Segments CSV
          </button>
          <button className="button secondary" onClick={state.refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Portfolio distribution</span>
            <h2>Customer count by segment</h2>
          </div>
        </div>
        {data?.segments && data.segments.length > 0 ? (
          <TrendChart
            data={data.segments.map((item) => ({
              name: item.name,
              value: item.customers,
            }))}
            type="bar"
          />
        ) : (
          <div className="empty-state">No RFM segment data returned.</div>
        )}
      </section>
    </State>
  );
}

export function LiveRevenuePage() {
  const state = useApi(() => api.getRevenueRisk());
  const [exporting, setExporting] = useState(false);
  const data = state.data as {
    by_risk_level?: { name: string; revenue: number }[];
    total_revenue_at_risk?: number;
    note?: string;
  } | null;

  const handleExportRevenueRiskCustomers = async () => {
    setExporting(true);
    try {
      const response = await api.getCustomers("page=1&page_size=100");
      const highExposure = response.items.filter(
        (c) => c.risk_level === "high" || c.risk_level === "churned"
      );
      const totalExposure = data?.total_revenue_at_risk || 1;
      const rows = highExposure.map((c) => ({
        customer_id: c.record_id,
        risk_level: c.risk_level,
        mrr_usd: c.mrr_usd,
        exposure_share_pct: Math.round((c.mrr_usd / totalExposure) * 1000) / 10,
        plan_name: c.plan_name,
        tenure_months: c.tenure_months,
        recommended_action: c.recommended_action,
      }));
      downloadCsv("revenue-risk-customers.csv", rows, {
        customer_id: "Customer ID",
        risk_level: "Risk Level",
        mrr_usd: "MRR at Risk (USD)",
        exposure_share_pct: "Share of Total Exposed MRR (%)",
        plan_name: "Plan Name",
        tenure_months: "Tenure (Months)",
        recommended_action: "Recommended Action",
      });
    } catch {
      alert("Failed to export revenue-risk customers.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <State {...state}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Revenue analytics</span>
          <h1>Observed revenue exposure</h1>
          <p>{data?.note ?? "Observed MRR grouped by source labels, not expected loss."}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            onClick={handleExportRevenueRiskCustomers}
            disabled={exporting}
          >
            <Download size={15} /> {exporting ? "Exporting..." : "Export Revenue-Risk Customers"}
          </button>
          <button
            className="button secondary"
            onClick={() =>
              downloadCsv("revenue-risk-by-tier.csv", data?.by_risk_level ?? [], {
                name: "Risk Level",
                revenue: "Total MRR (USD)",
              })
            }
            disabled={!data?.by_risk_level?.length}
          >
            <Download size={15} /> Export Tier Breakdown
          </button>
          <button className="button secondary" onClick={state.refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="highlight-card">
        <div>
          <span className="eyebrow">Observed revenue at risk</span>
          <strong>${(data?.total_revenue_at_risk ?? 0).toLocaleString()}</strong>
          <p>Analytical prioritization metric summing MRR of accounts labeled high-risk or churned.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Distribution by tier</span>
            <h2>MRR exposure by risk tier</h2>
          </div>
        </div>
        {data?.by_risk_level && data.by_risk_level.length > 0 ? (
          <TrendChart
            data={data.by_risk_level.map((item) => ({
              name: item.name,
              value: item.revenue,
            }))}
            type="bar"
          />
        ) : (
          <div className="empty-state">No revenue risk distribution available.</div>
        )}
      </section>
    </State>
  );
}

export function UnavailableAnalyticsPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state" style={{ padding: "48px 24px", textAlign: "center" }}>
      <Info size={36} color="#6b7280" style={{ margin: "0 auto 16px" }} />
      <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>{title}</h2>
      <p style={{ color: "#4b5563", maxWidth: "540px", margin: "0 auto 12px", lineHeight: "1.6" }}>
        {description}
      </p>
      <span
        className="status-badge status-medium"
        style={{ display: "inline-block", padding: "4px 12px", fontSize: "12px" }}
      >
        Not available with current dataset
      </span>
    </div>
  );
}
