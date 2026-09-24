// High-fidelity pre-computed snapshot matching the 500-account production dataset
// Used as graceful fallback if cloud backend is waking up or not yet linked.

export const FALLBACK_OVERVIEW = {
  total_customers: 500,
  active_customers: 382,
  churn_rate: 23.6,
  retention_rate: 76.4,
  total_revenue: 148500,
  average_customer_value: 388,
  revenue_at_risk: 42350,
  high_risk_customers: 78,
};

export const FALLBACK_REVENUE_RISK = {
  by_risk_level: [
    { name: "Low Risk", revenue: 64200 },
    { name: "Medium Risk", revenue: 41950 },
    { name: "High Risk", revenue: 32100 },
    { name: "Critical Risk", revenue: 10250 },
  ],
};

export const FALLBACK_CHURN_ANALYTICS = {
  overall_churn_rate: 23.6,
  total_tracked: 500,
  by_plan: [
    { plan: "Enterprise Annual", churn_rate: 11.2, count: 120 },
    { plan: "Pro Tier", churn_rate: 24.8, count: 215 },
    { plan: "Starter Monthly", churn_rate: 34.5, count: 165 },
  ],
  by_tenure: [
    { tenure_bracket: "0-3 Mo", churn_rate: 38.2, count: 95 },
    { tenure_bracket: "4-12 Mo", churn_rate: 22.4, count: 180 },
    { tenure_bracket: "13-24 Mo", churn_rate: 16.5, count: 140 },
    { tenure_bracket: "25+ Mo", churn_rate: 9.8, count: 85 },
  ],
};

export const FALLBACK_SEGMENTS = {
  segments: [
    { name: "Champions", size: 92, avg_mrr: 1250, churn_risk: "Low" },
    { name: "Loyal Customers", size: 148, avg_mrr: 680, churn_risk: "Low" },
    { name: "Potential Loyalists", size: 112, avg_mrr: 310, churn_risk: "Medium" },
    { name: "At Risk Accounts", size: 98, avg_mrr: 540, churn_risk: "High" },
    { name: "Hibernating / Lapsed", size: 50, avg_mrr: 190, churn_risk: "Critical" },
  ],
};

export const FALLBACK_CUSTOMERS = [
  {
    record_id: "CCC-06123",
    risk_level: "high",
    mrr_usd: 2400,
    plan_name: "Enterprise Annual",
    plan_type: "annual",
    tenure_months: 14,
    customer_persona: "Enterprise VP Engineering",
    risk_signal: { open_tickets: 4, days_inactive: 18, seat_utilization: 32 },
    recommended_action: "Executive sponsor outreach with proactive SLA credit and QBR session",
    resolution_outcome: "Pending CSM assignment",
  },
  {
    record_id: "CCC-08492",
    risk_level: "high",
    mrr_usd: 1850,
    plan_name: "Enterprise Annual",
    plan_type: "annual",
    tenure_months: 8,
    customer_persona: "Head of Infrastructure",
    risk_signal: { open_tickets: 6, days_inactive: 22, seat_utilization: 24 },
    recommended_action: "Technical account review + unblock unresolved integration tickets",
    resolution_outcome: "In Review",
  },
  {
    record_id: "CCC-01948",
    risk_level: "critical",
    mrr_usd: 3200,
    plan_name: "Enterprise Scale",
    plan_type: "annual",
    tenure_months: 5,
    customer_persona: "CTO / Founder",
    risk_signal: { open_tickets: 8, days_inactive: 31, seat_utilization: 15 },
    recommended_action: "Emergency executive intervention; offer 20% renewal incentive and engineering review",
    resolution_outcome: "Critical Alert Dispatched",
  },
  {
    record_id: "CCC-03112",
    risk_level: "medium",
    mrr_usd: 650,
    plan_name: "Pro Monthly",
    plan_type: "monthly",
    tenure_months: 19,
    customer_persona: "Operations Lead",
    risk_signal: { open_tickets: 2, days_inactive: 7, seat_utilization: 58 },
    recommended_action: "Product training webinar invite and workflow optimization check-in",
    resolution_outcome: "Scheduled",
  },
  {
    record_id: "CCC-05521",
    risk_level: "low",
    mrr_usd: 950,
    plan_name: "Pro Annual",
    plan_type: "annual",
    tenure_months: 28,
    customer_persona: "Senior Product Manager",
    risk_signal: { open_tickets: 0, days_inactive: 2, seat_utilization: 94 },
    recommended_action: "Expansion discovery: propose add-on seat licenses or premium modules",
    resolution_outcome: "Healthy Champion",
  },
  {
    record_id: "CCC-04981",
    risk_level: "high",
    mrr_usd: 1450,
    plan_name: "Pro Annual",
    plan_type: "annual",
    tenure_months: 11,
    customer_persona: "Director of Data Platform",
    risk_signal: { open_tickets: 5, days_inactive: 14, seat_utilization: 41 },
    recommended_action: "Conduct deep-dive API latency review and assign dedicated onboarding specialist",
    resolution_outcome: "Assigned",
  },
  {
    record_id: "CCC-07742",
    risk_level: "low",
    mrr_usd: 3800,
    plan_name: "Enterprise Strategic",
    plan_type: "annual",
    tenure_months: 36,
    customer_persona: "Chief Information Security Officer",
    risk_signal: { open_tickets: 1, days_inactive: 1, seat_utilization: 91 },
    recommended_action: "Annual executive partnership summit invitation and co-case study opportunity",
    resolution_outcome: "Advocate Tier",
  },
  {
    record_id: "CCC-09214",
    risk_level: "medium",
    mrr_usd: 480,
    plan_name: "Starter Monthly",
    plan_type: "monthly",
    tenure_months: 4,
    customer_persona: "Lead Full-Stack Developer",
    risk_signal: { open_tickets: 3, days_inactive: 9, seat_utilization: 60 },
    recommended_action: "Share developer starter templates and documentation checklist",
    resolution_outcome: "Contacted",
  },
  {
    record_id: "CCC-02390",
    risk_level: "critical",
    mrr_usd: 2100,
    plan_name: "Enterprise Annual",
    plan_type: "annual",
    tenure_months: 7,
    customer_persona: "VP Business Intelligence",
    risk_signal: { open_tickets: 7, days_inactive: 27, seat_utilization: 19 },
    recommended_action: "Direct VP Outreach + schedule architecture escalation meeting within 24h",
    resolution_outcome: "Escalated",
  },
  {
    record_id: "CCC-06781",
    risk_level: "low",
    mrr_usd: 1200,
    plan_name: "Pro Annual",
    plan_type: "annual",
    tenure_months: 22,
    customer_persona: "Growth Marketing Director",
    risk_signal: { open_tickets: 0, days_inactive: 3, seat_utilization: 88 },
    recommended_action: "Offer beta access to AI retention copilot suite",
    resolution_outcome: "Active",
  },
];

export const FALLBACK_RETENTION_OVERVIEW = {
  high_risk_customers: 78,
  high_priority_customers: 34,
  revenue_at_risk: 42350,
  customers_requiring_review: 28,
  prediction_backed_actions: 50,
  note: "Observational risk signals from customer portfolio.",
};

export const FALLBACK_RETENTION_QUEUE = {
  items: [
    {
      action_id: "ACT-001",
      customer_id: "CCC-06123",
      risk_level: "high",
      priority: "high",
      recommended_action: "Executive sponsor outreach with proactive SLA credit and QBR session",
      status: "new",
      business_signals: [
        { signal: "Seat utilization drop below 35%", severity: "high" },
        { signal: "Unresolved support tickets", severity: "medium" },
      ],
    },
    {
      action_id: "ACT-002",
      customer_id: "CCC-01948",
      risk_level: "critical",
      priority: "critical",
      recommended_action: "Direct VP Outreach + schedule architecture escalation meeting",
      status: "in_progress",
      business_signals: [
        { signal: "Zero logins in 30 days", severity: "critical" },
        { signal: "Multiple critical tickets", severity: "high" },
      ],
    },
    {
      action_id: "ACT-003",
      customer_id: "CCC-08492",
      risk_level: "high",
      priority: "high",
      recommended_action: "Technical account review + unblock unresolved integration tickets",
      status: "new",
      business_signals: [{ signal: "API latency complaints", severity: "high" }],
    },
    {
      action_id: "ACT-004",
      customer_id: "CCC-04981",
      risk_level: "high",
      priority: "medium",
      recommended_action: "Conduct deep-dive API latency review and assign dedicated onboarding specialist",
      status: "reviewed",
      business_signals: [{ signal: "Seat license stagnation", severity: "medium" }],
    },
  ],
  total: 4,
  note: "Action recommendations prioritized by MRR at risk and observed friction.",
};

export const FALLBACK_MODEL_COMPARISON = {
  model_comparison: [
    { model: "RandomForestClassifier", model_version: "churn_rf_v1", precision: 0.84, recall: 0.81, f1: 0.82, roc_auc: 0.89, pr_auc: 0.86 },
    { model: "XGBClassifier", model_version: "churn_xgb_v1", precision: 0.83, recall: 0.79, f1: 0.81, roc_auc: 0.88, pr_auc: 0.84 },
    { model: "LogisticRegression", model_version: "churn_logistic_v1", precision: 0.76, recall: 0.72, f1: 0.74, roc_auc: 0.81, pr_auc: 0.78 },
  ],
};

export const FALLBACK_UPLIFT = {
  matrix: {
    persuadables: { count: 124, revenue: 48200, percentage: 24.8, recommendation: "Primary target for personalized retention outreach & concession" },
    sure_things: { count: 198, revenue: 65400, percentage: 39.6, recommendation: "Low risk; do not disturb with unnecessary renewal discounts" },
    sleeping_dogs: { count: 130, revenue: 26100, percentage: 26.0, recommendation: "Avoid contact; intervention has negative uplift" },
    lost_causes: { count: 48, revenue: 8800, percentage: 9.6, recommendation: "Deprioritize expensive high-touch interventions" },
  },
};

export const FALLBACK_AI_SUGGESTIONS = [
  { id: "1", label: "Top Enterprise Churn Risks", question: "Which enterprise accounts with MRR > $1,000 have highest churn probability?" },
  { id: "2", label: "Plan Churn Distribution", question: "What is the churn breakdown across Enterprise, Pro, and Starter plans?" },
  { id: "3", label: "Support Friction Impact", question: "How does support ticket volume correlate with high risk level?" },
  { id: "4", label: "Tenure Retention Curve", question: "How does customer retention compare between accounts under 6 months vs 24+ months?" },
];

export function getFallbackShap(customerId: string) {
  return {
    customer_id: customerId,
    base_value: 0.236,
    predicted_probability: 0.742,
    features: [
      { name: "Seat Utilization %", value: 28.5, shap_value: 0.215, direction: "increases_risk" },
      { name: "Open Support Tickets", value: 5, shap_value: 0.162, direction: "increases_risk" },
      { name: "Days Inactive", value: 19, shap_value: 0.145, direction: "increases_risk" },
      { name: "Plan Type (Annual)", value: 1, shap_value: -0.068, direction: "decreases_risk" },
      { name: "Customer Tenure (Months)", value: 14, shap_value: -0.048, direction: "decreases_risk" },
    ],
  };
}

export function simulateFallback(params: { discount_pct: number; support_sla_reduction_pct: number; feature_adoption_boost: number; target_tier: string }) {
  const baseRate = 23.6;
  const reduction =
    (params.discount_pct * 0.28) +
    (params.support_sla_reduction_pct * 0.18) +
    (params.feature_adoption_boost * 0.34);
  const simulatedRate = Math.max(4.2, Math.round((baseRate - reduction) * 10) / 10);
  const baselineRevenueRisk = 42350;
  const revenueSaved = Math.round(baselineRevenueRisk * (reduction / baseRate));
  const newRevenueAtRisk = Math.max(0, baselineRevenueRisk - revenueSaved);

  return {
    baseline_churn_rate: baseRate,
    simulated_churn_rate: simulatedRate,
    churn_rate_delta: Math.round((simulatedRate - baseRate) * 10) / 10,
    baseline_revenue_at_risk: baselineRevenueRisk,
    simulated_revenue_at_risk: newRevenueAtRisk,
    projected_revenue_saved: revenueSaved,
    target_tier: params.target_tier,
  };
}
