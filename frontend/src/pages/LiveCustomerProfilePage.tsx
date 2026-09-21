import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RefreshCw, Server } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { api, type ApiCustomer } from "../services/api";

export function LiveCustomerProfilePage() {
  const { id = "" } = useParams(); const [customer, setCustomer] = useState<ApiCustomer | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getCustomer(id).then(setCustomer).catch(() => setError("Customer profile unavailable.")); }, [id]);
  if (error) return <div className="error-state"><Server size={22} /><h2>Customer unavailable</h2><p>{error}</p></div>;
  if (!customer) return <div className="loading-state"><RefreshCw className="spin" size={20} /> Loading customer profile...</div>;
  const risk = customer.risk_level === "churned" ? "Critical" : customer.risk_level === "high" ? "High" : customer.risk_level === "medium" ? "Medium" : "Low";
  const signal = Array.isArray(customer.risk_signal) ? customer.risk_signal.join(", ") : String(customer.risk_signal ?? "No business signal provided");
  return <><Link className="back-link" to="/customers">← Back to customers</Link><div className="page-header"><div><span className="eyebrow">Customer profile</span><h1>{customer.record_id}</h1><p>{customer.plan_name} · {customer.plan_type} · {customer.tenure_months} months</p></div><StatusBadge risk={risk} /></div><div className="profile-grid"><section className="panel"><h2>Observed customer details</h2><div className="detail-metrics"><div><span>MRR</span><strong>${customer.mrr_usd.toLocaleString()}</strong></div><div><span>Tenure</span><strong>{customer.tenure_months} months</strong></div><div><span>Persona</span><strong>{customer.customer_persona || "Unavailable"}</strong></div><div><span>Outcome</span><strong>{customer.resolution_outcome || "Unavailable"}</strong></div></div><p className="detail-note"><b>Business signal</b>{signal}</p><p className="detail-note"><b>Rule-based recommendation</b>{customer.recommended_action}</p></section><aside className="risk-card"><span className="eyebrow">Model prediction</span><h2>Unavailable</h2><p>No persisted prediction was returned for this customer. Observed source risk is not presented as an ML probability.</p></aside></div></>;
}
