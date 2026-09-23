import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { History, MessageSquare, RefreshCw, Send, Server, Sparkles } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api, type ApiCustomer } from "../services/api";
import { ShapWaterfallChart } from "../components/analytics/ShapWaterfallChart";
import { AiCopilotModal } from "../components/retention/AiCopilotModal";

export function LiveCustomerProfilePage() {
  const { id = "" } = useParams();
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [shapData, setShapData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getCustomer(id)
      .then(setCustomer)
      .catch(() => setError("Customer profile unavailable."));

    api.getCustomerShap(id)
      .then(setShapData)
      .catch((err) => console.log("SHAP explainability not loaded", err));

    api.getActionHistory(id)
      .then((res) => setHistory(res.actions || []))
      .catch((err) => console.log("Action history not loaded", err));
  }, [id]);

  if (error) {
    return (
      <div className="error-state">
        <Server size={22} />
        <h2>Customer unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="loading-state">
        <RefreshCw className="spin" size={20} /> Loading customer profile...
      </div>
    );
  }

  const risk =
    customer.risk_level === "churned"
      ? "Critical"
      : customer.risk_level === "high"
      ? "High"
      : customer.risk_level === "medium"
      ? "Medium"
      : "Low";

  const signal = Array.isArray(customer.risk_signal)
    ? customer.risk_signal.join(", ")
    : String(customer.risk_signal ?? "No business signal provided");

  const handleQuickSlackAlert = async () => {
    try {
      const res = await api.triggerWebhookAlert(id, "slack");
      setAlertNotice(`Alert sent to Slack (${res.delivery_status})`);
      setTimeout(() => setAlertNotice(null), 3000);
      const updated = await api.getActionHistory(id);
      setHistory(updated.actions || []);
    } catch {
      setAlertNotice("Failed to send alert.");
    }
  };

  return (
    <>
      <Link className="back-link" to="/customers">
        ← Back to customers
      </Link>

      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="eyebrow">Customer 360 Profile</span>
          <h1>{customer.record_id}</h1>
          <p>
            {customer.plan_name} · {customer.plan_type} · {customer.tenure_months} months
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowCopilot(true)}
            style={{
              padding: "9px 16px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
            }}
          >
            <Sparkles size={16} /> AI Retention Copilot
          </button>

          <button
            onClick={handleQuickSlackAlert}
            style={{
              padding: "9px 14px",
              background: "#4a154b",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Send size={14} /> Send Slack Alert
          </button>

          <StatusBadge risk={risk} />
        </div>
      </div>

      {alertNotice && (
        <div style={{ padding: "10px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: 600 }}>
          {alertNotice}
        </div>
      )}

      {/* Main Grid: Details + SHAP Waterfall */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Customer Attributes */}
        <section className="panel" style={{ height: "100%", boxSizing: "border-box" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>Observed Account Attributes</h2>
          <div className="detail-metrics">
            <div>
              <span>Monthly MRR</span>
              <strong>${customer.mrr_usd.toLocaleString()}</strong>
            </div>
            <div>
              <span>Account Tenure</span>
              <strong>{customer.tenure_months} months</strong>
            </div>
            <div>
              <span>Persona</span>
              <strong>{customer.customer_persona || "Enterprise"}</strong>
            </div>
            <div>
              <span>Resolution Outcome</span>
              <strong>{customer.resolution_outcome || "Active"}</strong>
            </div>
          </div>
          <p className="detail-note" style={{ marginTop: "16px" }}>
            <b>Primary Business Signal:</b> {signal}
          </p>
          <p className="detail-note">
            <b>Recommended Action:</b> {customer.recommended_action}
          </p>
        </section>

        {/* TreeSHAP Waterfall Chart */}
        <div>
          {shapData ? (
            <ShapWaterfallChart data={shapData} />
          ) : (
            <div className="loading-state">
              <RefreshCw className="spin" size={16} /> Computing TreeSHAP feature attributions...
            </div>
          )}
        </div>
      </div>

      {/* Intervention Action History Audit Trail */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <History size={18} color="#6366f1" />
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Intervention History & Audit Trail</h3>
        </div>

        {history.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            No prior manual interventions recorded for this account. Use the AI Copilot above to log outreach or dispatch alerts.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((act) => (
              <div
                key={act.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "11px", color: "#6366f1", marginRight: "8px" }}>
                    {act.action_type.replace("_", " ")}
                  </span>
                  <span style={{ color: "#334155" }}>{act.notes}</span>
                </div>
                <div style={{ textAlign: "right", color: "#64748b", fontSize: "11px" }}>
                  <div>By: {act.performed_by}</div>
                  <div>{new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Copilot Modal */}
      {showCopilot && (
        <AiCopilotModal
          customerId={id}
          onClose={() => {
            setShowCopilot(false);
            api.getActionHistory(id).then((res) => setHistory(res.actions || []));
          }}
        />
      )}
    </>
  );
}
