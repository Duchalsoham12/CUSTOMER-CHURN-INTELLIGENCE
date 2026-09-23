import React, { useEffect, useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, DollarSign, Flame, RefreshCw, Sliders, TrendingUp, Users } from "lucide-react";
import { api } from "../services/api";

export function LiveSimulatorPage() {
  const [discountPct, setDiscountPct] = useState(15);
  const [supportSlaPct, setSupportSlaPct] = useState(25);
  const [adoptionBoostPct, setAdoptionBoostPct] = useState(20);
  const [targetTier, setTargetTier] = useState("high_risk");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.simulateScenario({
        discount_pct: Number(discountPct),
        support_sla_reduction_pct: Number(supportSlaPct),
        feature_adoption_boost: Number(adoptionBoostPct),
        target_tier: targetTier,
      });
      setResult(data);
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSimulation();
    }, 200);
    return () => clearTimeout(timer);
  }, [discountPct, supportSlaPct, adoptionBoostPct, targetTier]);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Strategic Financial Planning</span>
          <h1>What-If Revenue & Retention Simulator</h1>
          <p>Model the net financial ROI of discounts, support SLA improvements, and feature adoption interventions.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="demo-pill" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" }}>
            <Sliders size={14} /> Vectorized Policy Engine
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", marginTop: "20px" }}>
        
        {/* Controls Panel */}
        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "12px" }}>
            <Sliders size={18} color="#6366f1" />
            <h2 style={{ fontSize: "16px", margin: 0 }}>Policy Levers</h2>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Target Segment</span>
            </div>
            <select
              value={targetTier}
              onChange={(e) => setTargetTier(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="high_risk">High Churn Risk Only (Highest Priority)</option>
              <option value="medium_and_high">Medium & High Risk Accounts</option>
              <option value="enterprise">Enterprise Tier Only ($800+ MRR)</option>
              <option value="all">Entire Portfolio (All Accounts)</option>
            </select>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Renewal Discount / Concession</span>
              <strong style={{ color: "#6366f1", fontSize: "14px" }}>{discountPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
            <small style={{ color: "#64748b", fontSize: "11px" }}>Applied to contract renewals for targeted accounts.</small>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Support SLA Speedup</span>
              <strong style={{ color: "#16a34a", fontSize: "14px" }}>{supportSlaPct}% faster</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={supportSlaPct}
              onChange={(e) => setSupportSlaPct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#16a34a" }}
            />
            <small style={{ color: "#64748b", fontSize: "11px" }}>Faster resolution time on high-friction tickets.</small>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Feature Adoption Boost</span>
              <strong style={{ color: "#0284c7", fontSize: "14px" }}>+{adoptionBoostPct}% seats</strong>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={adoptionBoostPct}
              onChange={(e) => setAdoptionBoostPct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#0284c7" }}
            />
            <small style={{ color: "#64748b", fontSize: "11px" }}>Incentivized onboarding & seat utilization.</small>
          </div>

          <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b" }}>
            Vectorized elasticities derived from the Random Forest model's feature importance matrix.
          </div>
        </section>

        {/* Results Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Main KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div className="panel" style={{ padding: "18px" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Portfolio Churn Rate</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
                <span style={{ fontSize: "16px", color: "#94a3b8", textDecoration: "line-through" }}>
                  {result?.baseline.churn_rate_pct}%
                </span>
                <strong style={{ fontSize: "24px", color: "#16a34a" }}>
                  {result?.simulated.churn_rate_pct}%
                </strong>
              </div>
              <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, marginTop: "4px" }}>
                ↓ {result?.impact.churn_rate_reduction_points} percentage points
              </div>
            </div>

            <div className="panel" style={{ padding: "18px" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Accounts Preserved</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#4f46e5", marginTop: "6px" }}>
                +{result?.impact.saved_accounts_count} Accounts
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                At-risk down from {result?.baseline.at_risk_accounts} to {result?.simulated.at_risk_accounts}
              </div>
            </div>

            <div className="panel" style={{ padding: "18px", border: `2px solid ${result?.impact.net_monthly_mrr_benefit_usd >= 0 ? "#86efac" : "#fca5a5"}` }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Net Monthly MRR Benefit</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: result?.impact.net_monthly_mrr_benefit_usd >= 0 ? "#16a34a" : "#dc2626", marginTop: "6px" }}>
                +${result?.impact.net_monthly_mrr_benefit_usd.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Annualized: +${result?.impact.annualized_net_benefit_usd.toLocaleString()}/yr
              </div>
            </div>
          </div>

          {/* ROI Waterfall Breakdown */}
          <section className="panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Financial Impact Waterfall</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>Gross MRR Preserved</div>
                  <small style={{ color: "#64748b" }}>Revenue retained from prevented churn</small>
                </div>
                <strong style={{ fontSize: "16px", color: "#16a34a" }}>
                  +${result?.impact.gross_mrr_preserved_usd.toLocaleString()}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>Campaign Concession Cost</div>
                  <small style={{ color: "#64748b" }}>Total discounts granted to targeted cohort</small>
                </div>
                <strong style={{ fontSize: "16px", color: "#dc2626" }}>
                  -${result?.impact.campaign_discount_cost_usd.toLocaleString()}
                </strong>
              </div>

              <div style={{ height: "1px", background: "#e2e8f0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>Net Monthly Profitability</div>
                  <small style={{ color: "#64748b" }}>Gross MRR Preserved minus Campaign Cost</small>
                </div>
                <strong style={{ fontSize: "20px", color: result?.impact.net_monthly_mrr_benefit_usd >= 0 ? "#16a34a" : "#dc2626" }}>
                  +${result?.impact.net_monthly_mrr_benefit_usd.toLocaleString()}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontWeight: 700, fontSize: "14px" }}>Campaign Return on Investment (ROI)</span>
                <strong style={{ fontSize: "18px", color: "#4f46e5" }}>
                  {result?.impact.campaign_roi_pct}% ROI
                </strong>
              </div>
            </div>

            <div style={{ marginTop: "20px", padding: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 color="#16a34a" size={20} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>
                {result?.recommendation}
              </span>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
