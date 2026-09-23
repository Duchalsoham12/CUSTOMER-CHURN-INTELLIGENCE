import React, { useState } from "react";
import { Check, Copy, Flame, MessageSquare, RefreshCw, Send, ShieldAlert, Sparkles, X } from "lucide-react";
import { api } from "../../services/api";

interface AiCopilotModalProps {
  customerId: string;
  onClose: () => void;
}

export function AiCopilotModal({ customerId, onClose }: AiCopilotModalProps) {
  const [tone, setTone] = useState("empathetic");
  const [customNotes, setCustomNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [outreach, setOutreach] = useState<any>(null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"email" | "memo">("email");

  const handleGenerate = async () => {
    setLoading(true);
    setAlertStatus(null);
    try {
      const res = await api.generateRetentionOutreach(customerId, tone, customNotes || undefined);
      setOutreach(res);
    } catch (e) {
      alert("Failed to generate outreach package.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWebhook = async (channel: "slack" | "discord") => {
    try {
      const res = await api.triggerWebhookAlert(customerId, channel);
      setAlertStatus(`Alert sent via ${channel} (${res.delivery_status})`);
      await api.logAction({
        customer_id: customerId,
        action_type: "webhook_alert",
        channel,
        notes: `Dispatched ${channel} alert from AI Copilot`,
        performed_by: "CS Representative",
      });
    } catch {
      setAlertStatus("Failed to send webhook alert.");
    }
  };

  const handleCopy = (text: string, type: "subject" | "body") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
      <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "16px", width: "100%", maxWidth: "720px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" }}>
        
        {/* Modal Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "var(--text-primary, #0f172a)" }}>
                AI Retention Copilot · {customerId}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                Generate personalized customer retention communications & escalation memos
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "6px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Controls */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
              Select Communication Tone:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                { id: "empathetic", label: "Empathetic", desc: "Warm & Supportive" },
                { id: "executive", label: "Executive", desc: "Peer-to-Peer Partner" },
                { id: "urgent", label: "Urgent", desc: "Escalated Priority" },
                { id: "incentive_focused", label: "VIP Offer", desc: "Discount & Concession" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: `1.5px solid ${tone === t.id ? "#6366f1" : "#e2e8f0"}`,
                    background: tone === t.id ? "#eef2ff" : "#f8fafc",
                    color: tone === t.id ? "#4338ca" : "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{t.label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
              Custom Context / Notes (Optional):
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Discussed billing issue on phone; offering 20% discount on renewal."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: "11px 16px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
            }}
          >
            {loading ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
            {outreach ? "Regenerate Retention Package" : "Generate Retention Outreach Package"}
          </button>

          {/* Generated Result */}
          {outreach && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Concession Callout */}
              <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                <Flame size={20} color="#16a34a" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#166534" }}>
                    Recommended Concession Strategy
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#14532d" }}>
                    {outreach.recommended_concession}
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", gap: "16px" }}>
                <button
                  onClick={() => setActiveTab("email")}
                  style={{
                    padding: "8px 4px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${activeTab === "email" ? "#6366f1" : "transparent"}`,
                    fontWeight: 700,
                    fontSize: "13px",
                    color: activeTab === "email" ? "#6366f1" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Customer Outreach Email
                </button>
                <button
                  onClick={() => setActiveTab("memo")}
                  style={{
                    padding: "8px 4px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${activeTab === "memo" ? "#6366f1" : "transparent"}`,
                    fontWeight: 700,
                    fontSize: "13px",
                    color: activeTab === "memo" ? "#6366f1" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Internal Executive Memo
                </button>
              </div>

              {activeTab === "email" ? (
                <>
                  {/* Subject Line */}
                  <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>SUBJECT LINE:</span>
                      <button
                        onClick={() => handleCopy(outreach.subject_line, "subject")}
                        style={{ background: "none", border: "none", color: "#6366f1", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {copiedSubject ? <Check size={13} /> : <Copy size={13} />}
                        {copiedSubject ? "Copied" : "Copy Subject"}
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{outreach.subject_line}</div>
                  </div>

                  {/* Body */}
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>EMAIL BODY:</span>
                      <button
                        onClick={() => handleCopy(outreach.email_body, "body")}
                        style={{ background: "none", border: "none", color: "#6366f1", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {copiedBody ? <Check size={13} /> : <Copy size={13} />}
                        {copiedBody ? "Copied" : "Copy Body"}
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>
                      {outreach.email_body}
                    </pre>
                  </div>
                </>
              ) : (
                <div style={{ background: "#0f172a", padding: "14px", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {outreach.executive_escalation_memo}
                </div>
              )}

              {/* Webhook Dispatch Buttons */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingTop: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>Dispatch Alert:</span>
                <button
                  onClick={() => handleSendWebhook("slack")}
                  style={{ padding: "6px 12px", background: "#4a154b", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Send size={12} /> Send to Slack
                </button>
                <button
                  onClick={() => handleSendWebhook("discord")}
                  style={{ padding: "6px 12px", background: "#5865f2", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Send size={12} /> Send to Discord
                </button>
                {alertStatus && <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>{alertStatus}</span>}
              </div>

              <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>
                Synthesized by: {outreach.generated_by}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
