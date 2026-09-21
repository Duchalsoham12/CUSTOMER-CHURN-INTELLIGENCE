import { useEffect, useState } from "react";
import { Download, RefreshCw, Server, TrendingDown, TrendingUp, Info } from "lucide-react";
import { KpiCard } from "../components/ui/KpiCard";
import { TrendChart } from "../components/charts/AnalyticsCharts";
import { api } from "../services/api";
import { downloadCsv } from "../lib/csv";
import type { Kpi } from "../types";

type Overview = {
  total_customers: number;
  active_customers: number;
  churn_rate: number;
  retention_rate: number;
  total_revenue: number;
  average_customer_value: number;
  revenue_at_risk: number;
  high_risk_customers: number;
};

type Revenue = { by_risk_level: { name: string; revenue: number }[] };

export function RealDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getAnalyticsOverview() as Promise<Overview>,
      api.getRevenueRisk() as Promise<Revenue>,
    ])
      .then(([overviewResponse, revenueResponse]) => {
        setOverview(overviewResponse);
        setRevenue(revenueResponse);
      })
      .catch(() =>
        setError("The analytics API could not be reached. Check that FastAPI and PostgreSQL are running.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExportSummary = () => {
    if (!overview) return;
    const summaryRows = [
      { metric: "Total Customers", value: overview.total_customers, unit: "Accounts" },
      { metric: "Active Customers", value: overview.active_customers, unit: "Accounts" },
      { metric: "Churn Rate", value: `${overview.churn_rate}%`, unit: "Percent" },
      { metric: "Retention Rate", value: `${overview.retention_rate}%`, unit: "Percent" },
      { metric: "Total Revenue (MRR)", value: `$${overview.total_revenue.toLocaleString()}`, unit: "USD" },
      { metric: "Average Customer Value", value: `$${overview.average_customer_value.toLocaleString()}`, unit: "USD MRR" },
      { metric: "Observed Revenue at Risk", value: `$${overview.revenue_at_risk.toLocaleString()}`, unit: "USD MRR" },
      { metric: "Observed High-Risk Customers", value: overview.high_risk_customers, unit: "Accounts" },
      ...(revenue?.by_risk_level.map((item) => ({
        metric: `MRR by Risk (${item.name})`,
        value: `$${item.revenue.toLocaleString()}`,
        unit: "USD MRR",
      })) ?? []),
    ];
    downloadCsv("executive-summary.csv", summaryRows, {
      metric: "Metric",
      value: "Observed Value",
      unit: "Unit / Dimension",
    });
  };

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
        <button className="button primary" onClick={load}>
          Retry
        </button>
      </div>
    );
  if (!overview) return <div className="empty-state">No analytics data returned.</div>;

  const cards: Kpi[] = [
    { label: "Total customers", value: overview.total_customers.toLocaleString(), change: "Live database", tone: "neutral" },
    { label: "Active customers", value: overview.active_customers.toLocaleString(), change: "Observed source labels", tone: "neutral" },
    { label: "Churn rate", value: `${overview.churn_rate}%`, change: "Observed label rate", tone: "neutral" },
    { label: "Retention rate", value: `${overview.retention_rate}%`, change: "Observed label rate", tone: "neutral" },
    { label: "Revenue", value: `$${overview.total_revenue.toLocaleString()}`, change: "Database MRR", tone: "neutral" },
    { label: "Avg. customer value", value: `$${overview.average_customer_value.toLocaleString()}`, change: "MRR per record", tone: "neutral" },
    { label: "Revenue at risk", value: `$${overview.revenue_at_risk.toLocaleString()}`, change: "Observed high/churned", tone: "neutral" },
    { label: "High-risk customers", value: overview.high_risk_customers.toLocaleString(), change: "Observed labels", tone: "neutral" },
  ];

  const revenueChart =
    revenue?.by_risk_level.map((item) => ({ name: item.name, value: item.revenue })) ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Executive overview</span>
          <h1>Executive Dashboard</h1>
          <p>Real-time metrics sourced from the PostgreSQL-backed analytics API.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="button secondary" onClick={handleExportSummary}>
            <Download size={15} /> Export summary CSV
          </button>
          <button className="button secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="demo-notice" style={{ background: "rgba(33, 124, 108, 0.08)", borderColor: "rgba(33, 124, 108, 0.25)" }}>
        <TrendingUp size={16} color="#217c6c" />
        <span>
          <b>Database connected.</b> Metrics reflect real records imported from <code>full.jsonl</code>. Churn probabilities are displayed only when persisted model predictions exist.
        </span>
      </div>

      <div className="kpi-grid">
        {cards.map((item) => (
          <KpiCard item={item} key={item.label} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Observed revenue</span>
              <h2>Revenue by risk label</h2>
            </div>
            <span className="panel-meta">
              <TrendingDown size={14} /> Observed MRR distribution
            </span>
          </div>
          {revenueChart.length > 0 ? (
            <TrendChart data={revenueChart} type="bar" />
          ) : (
            <div className="empty-state">No revenue breakdown available.</div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Historical trends</span>
              <h2>Monthly growth & cohort trends</h2>
            </div>
          </div>
          <div className="empty-state" style={{ padding: "30px 20px", textAlign: "left" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <Info size={20} color="#6b7280" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ display: "block", marginBottom: "6px", color: "#1f2937" }}>
                  Not available with current dataset
                </strong>
                <p style={{ margin: 0, color: "#4b5563", fontSize: "13px", lineHeight: "1.5" }}>
                  The source dataset provides customer snapshot attributes but contains no signup timestamps, transaction dates, or event history. In accordance with data integrity policies, monthly growth and time-series cohorts are not fabricated.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
