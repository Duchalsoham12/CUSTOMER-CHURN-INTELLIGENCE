import { useEffect, useState } from "react";
import { Download, RefreshCw, Server } from "lucide-react";
import { api } from "../services/api";
import { downloadCsv } from "../lib/csv";

interface Overview {
  high_risk_customers: number;
  high_priority_customers: number;
  revenue_at_risk: number;
  customers_requiring_review: number;
  prediction_backed_actions: number;
  note: string;
}

interface RetentionActionItem {
  action_id: string;
  customer_id: string;
  risk_level: string;
  priority: string;
  recommended_action: string;
  status: string;
  business_signals: { signal: string; severity: string }[];
}

interface Queue {
  items: RetentionActionItem[];
  total: number;
  note: string;
}

export function LiveRetentionPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getRetentionOverview() as Promise<Overview>,
      api.getRetentionQueue("page_size=100") as Promise<Queue>,
    ])
      .then(([overviewResponse, queueResponse]) => {
        setOverview(overviewResponse);
        setQueue(queueResponse);
      })
      .catch(() =>
        setError("Retention intelligence is unavailable. Check that PostgreSQL and FastAPI are running.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExport = () => {
    if (!queue?.items.length) return;
    const exportRows = queue.items.map((item) => ({
      action_id: item.action_id,
      customer_id: item.customer_id,
      risk_level: item.risk_level,
      priority: item.priority,
      recommended_action: item.recommended_action,
      status: item.status,
      business_signals: item.business_signals.map((s) => s.signal).join("; "),
    }));
    downloadCsv("retention-actions.csv", exportRows, {
      action_id: "Action ID",
      customer_id: "Customer ID",
      risk_level: "Model Risk Level",
      priority: "Retention Priority",
      recommended_action: "Recommended Action",
      status: "Workflow Status",
      business_signals: "Triggering Business Signals",
    });
  };

  if (loading)
    return (
      <div className="loading-state">
        <RefreshCw className="spin" size={20} /> Loading retention intelligence...
      </div>
    );
  if (error)
    return (
      <div className="error-state">
        <Server size={22} />
        <h2>Retention data unavailable</h2>
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
          <span className="eyebrow">Retention intelligence</span>
          <h1>Retention Action Center</h1>
          <p>
            Prediction-backed operational actions separated from business signals and rule-based suggestions.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="button secondary"
            onClick={handleExport}
            disabled={!queue?.items.length}
          >
            <Download size={15} /> Export retention actions CSV
          </button>
          <button className="button secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="demo-notice">
        <span>
          <b>Model boundary.</b> {overview?.note}
        </span>
      </div>

      <div className="action-summary">
        <span>
          <b>{overview?.high_risk_customers ?? 0}</b> high-risk customers
        </span>
        <span>
          <b>{overview?.high_priority_customers ?? 0}</b> high-priority actions
        </span>
        <span>
          <b>${(overview?.revenue_at_risk ?? 0).toLocaleString()}</b> revenue at risk
        </span>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Priority queue</span>
            <h2>Prediction-backed retention actions</h2>
          </div>
        </div>
        {queue?.items.length ? (
          <div className="action-list">
            {queue.items.map((item) => (
              <div className="action-row" key={item.action_id}>
                <div>
                  <b>{item.customer_id}</b>
                  <small>
                    {item.risk_level} risk · {item.priority} priority
                  </small>
                </div>
                <span className="status-badge status-medium">{item.status}</span>
                <p>{item.recommended_action}</p>
                <span className="action-text">
                  {item.business_signals.map((signal) => signal.signal).join(", ") ||
                    "No business signals"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No persisted prediction actions</h3>
            <p>
              Generate and persist model predictions before the retention queue can contain action items.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
