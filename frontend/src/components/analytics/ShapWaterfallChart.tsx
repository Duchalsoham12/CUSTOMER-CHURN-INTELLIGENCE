import React from "react";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

export interface ShapFeature {
  feature_key: string;
  feature_name: string;
  observed_value: string;
  shap_value: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface ShapData {
  customer_id: string;
  base_expected_probability: number;
  predicted_churn_probability: number;
  net_model_delta: number;
  features: ShapFeature[];
  top_risk_drivers: ShapFeature[];
  top_mitigating_factors: ShapFeature[];
  causal_warning: string;
}

export function ShapWaterfallChart({ data }: { data: ShapData }) {
  const maxAbs = Math.max(...data.features.map((f) => Math.abs(f.shap_value)), 0.05);

  return (
    <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
            Model Explainability (TreeSHAP)
          </span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
            Local Feature Attribution Waterfall
          </h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Model Prediction:</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: data.predicted_churn_probability >= 0.4 ? "#dc2626" : "#16a34a" }}>
            {(data.predicted_churn_probability * 100).toFixed(1)}% Churn Risk
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Base Expected Churn E[f(x)]</div>
          <strong style={{ fontSize: "16px", color: "#334155" }}>{(data.base_expected_probability * 100).toFixed(1)}%</strong>
        </div>
        <div style={{ flex: 1, padding: "10px 14px", background: data.net_model_delta >= 0 ? "#fef2f2" : "#f0fdf4", borderRadius: "8px", border: `1px solid ${data.net_model_delta >= 0 ? "#fecaca" : "#bbf7d0"}` }}>
          <div style={{ fontSize: "11px", color: data.net_model_delta >= 0 ? "#991b1b" : "#166534" }}>Total Feature Delta</div>
          <strong style={{ fontSize: "16px", color: data.net_model_delta >= 0 ? "#dc2626" : "#16a34a" }}>
            {data.net_model_delta >= 0 ? `+${(data.net_model_delta * 100).toFixed(1)}%` : `${(data.net_model_delta * 100).toFixed(1)}%`}
          </strong>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {data.features.map((feat) => {
          const isRisk = feat.shap_value > 0;
          const barWidth = `${Math.min(100, (Math.abs(feat.shap_value) / maxAbs) * 100)}%`;

          return (
            <div key={feat.feature_key} style={{ display: "grid", gridTemplateColumns: "190px 1fr 90px", alignItems: "center", gap: "12px", fontSize: "13px" }}>
              <div style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary, #1e293b)" }}>{feat.feature_name}</span>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{feat.observed_value}</span>
              </div>

              {/* Centered zero-line relative bar chart */}
              <div style={{ display: "flex", alignItems: "center", height: "16px", background: "#f1f5f9", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "2px", background: "#cbd5e1", zIndex: 2 }} />
                {isRisk ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      width: `calc(${barWidth} / 2)`,
                      height: "100%",
                      background: "linear-gradient(90deg, #f87171, #ef4444)",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      right: "50%",
                      width: `calc(${barWidth} / 2)`,
                      height: "100%",
                      background: "linear-gradient(270deg, #4ade80, #22c55e)",
                      borderRadius: "4px 0 0 4px",
                    }}
                  />
                )}
              </div>

              <div style={{ textAlign: "right", fontWeight: 700, color: isRisk ? "#dc2626" : "#16a34a" }}>
                {isRisk ? `+${(feat.shap_value * 100).toFixed(1)}%` : `${(feat.shap_value * 100).toFixed(1)}%`}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#dc2626", marginBottom: "6px" }}>
            <TrendingUp size={14} /> Primary Churn Drivers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.top_risk_drivers.map((d) => (
              <span key={d.feature_key} style={{ fontSize: "11px", padding: "3px 8px", background: "#fef2f2", color: "#991b1b", borderRadius: "6px", border: "1px solid #fecaca" }}>
                {d.feature_name} (+{(d.shap_value * 100).toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#16a34a", marginBottom: "6px" }}>
            <TrendingDown size={14} /> Mitigating / Protective Factors
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {data.top_mitigating_factors.map((m) => (
              <span key={m.feature_key} style={{ fontSize: "11px", padding: "3px 8px", background: "#f0fdf4", color: "#166534", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                {m.feature_name} ({(m.shap_value * 100).toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      <p style={{ marginTop: "14px", fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginBottom: 0 }}>
        Note: {data.causal_warning}
      </p>
    </div>
  );
}
