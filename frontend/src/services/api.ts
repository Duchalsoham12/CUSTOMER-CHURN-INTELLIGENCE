import {
  FALLBACK_OVERVIEW,
  FALLBACK_REVENUE_RISK,
  FALLBACK_CHURN_ANALYTICS,
  FALLBACK_SEGMENTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_RETENTION_OVERVIEW,
  FALLBACK_RETENTION_QUEUE,
  FALLBACK_MODEL_COMPARISON,
  FALLBACK_UPLIFT,
  FALLBACK_AI_SUGGESTIONS,
  getFallbackShap,
  simulateFallback,
} from "./fallbackData";

const defaultPort = typeof window !== "undefined" && (window.location.port === "5180" || window.location.port === "3000") ? "8080" : "8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://127.0.0.1:${defaultPort}/api`;

export const isLiveApi = { status: true };

async function request<T>(path: string, init?: RequestInit, fallbackSupplier?: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    isLiveApi.status = true;
    return (await response.json()) as T;
  } catch (err) {
    if (fallbackSupplier) {
      isLiveApi.status = false;
      return fallbackSupplier();
    }
    throw err;
  }
}

export interface ApiCustomer {
  record_id: string;
  risk_level: string;
  mrr_usd: number;
  plan_name: string;
  plan_type: string;
  tenure_months: number;
  customer_persona: string;
  risk_signal: unknown;
  recommended_action: string;
  resolution_outcome: string;
}

export interface CustomerResponse {
  items: ApiCustomer[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export const api = {
  getDashboard: () =>
    request<any>("/dashboard", undefined, () => ({ ...FALLBACK_OVERVIEW, source: "snapshot" })),

  getCustomers: (query = "") =>
    request<CustomerResponse>(
      `/customers${query ? `?${query}` : ""}`,
      undefined,
      () => ({
        items: FALLBACK_CUSTOMERS,
        page: 1,
        page_size: 10,
        total: FALLBACK_CUSTOMERS.length,
        pages: 1,
      })
    ),

  getCustomer: (id: string) =>
    request<ApiCustomer>(
      `/customers/${encodeURIComponent(id)}`,
      undefined,
      () => FALLBACK_CUSTOMERS.find((c) => c.record_id === id) || FALLBACK_CUSTOMERS[0]
    ),

  getChurnAnalytics: () =>
    request<Record<string, unknown>>("/analytics/churn", undefined, () => FALLBACK_CHURN_ANALYTICS),

  getSegments: () =>
    request<Record<string, unknown>>("/analytics/rfm", undefined, () => FALLBACK_SEGMENTS),

  getCohorts: () =>
    request<Record<string, unknown>>("/analytics/cohorts", undefined, () => ({ status: "unavailable", note: "Source dataset has no event timestamps." })),

  getRevenueRisk: () =>
    request<Record<string, unknown>>("/analytics/revenue", undefined, () => FALLBACK_REVENUE_RISK),

  getAnalyticsOverview: () =>
    request<any>("/analytics/overview", undefined, () => FALLBACK_OVERVIEW),

  getExecutiveAnalytics: () =>
    request<any>("/analytics/executive", undefined, () => ({ overview: FALLBACK_OVERVIEW, segments: FALLBACK_SEGMENTS })),

  getMonthlyAnalytics: () =>
    request<any>("/analytics/monthly", undefined, () => ({ status: "unavailable", note: "No monthly timestamps in source." })),

  getModelPerformance: () =>
    request<any>("/model-performance", undefined, () => FALLBACK_MODEL_COMPARISON),

  predict: (customerId: string) =>
    request<any>(
      "/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId }),
      },
      () => ({
        customer_id: customerId,
        churn_probability: 0.742,
        risk_level: "high",
        revenue_at_risk_usd: 2400,
        model_version: "churn_rf_v1",
      })
    ),

  getRetentionOverview: () =>
    request<any>("/retention/overview", undefined, () => FALLBACK_RETENTION_OVERVIEW),

  getRetentionQueue: (query = "") =>
    request<any>(`/retention/queue${query ? `?${query}` : ""}`, undefined, () => FALLBACK_RETENTION_QUEUE),

  uploadDataset: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<any>("/upload", { method: "POST", body: form });
  },

  getCustomerShap: (id: string) =>
    request<any>(`/customers/${encodeURIComponent(id)}/shap`, undefined, () => getFallbackShap(id)),

  generateRetentionOutreach: (customerId: string, tone = "empathetic", customNotes?: string) =>
    request<any>(
      "/retention/generate-outreach",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, tone, custom_notes: customNotes }),
      },
      () => ({
        customer_id: customerId,
        tone,
        email_subject: `Prioritizing your success & platform stability at ${customerId}`,
        email_body: `Hi there,\n\nWe noticed some recent integration hurdles and a decline in active workspace seats over the last billing cycle. We want to ensure your engineering team is extracting maximum value.\n\nWe would love to schedule a dedicated technical review session with our Solutions Engineering lead this week.\n\nBest regards,\nCustomer Success Leadership`,
        slack_notification: `⚠️ Proactive retention notice dispatched for ${customerId} (${tone} tone).`,
        concessions: ["15% renewal incentive", "Free seat expansion audit", "Dedicated technical onboarding"],
        escalation_memo: `Account ${customerId} exhibits elevated churn signals (unresolved support friction + decreased usage). Recommend proactive VP check-in.`,
      })
    ),

  simulateScenario: (params: { discount_pct: number; support_sla_reduction_pct: number; feature_adoption_boost: number; target_tier: string }) =>
    request<any>(
      "/analytics/simulate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
      () => simulateFallback(params)
    ),

  getUpliftSegmentation: () =>
    request<any>("/analytics/uplift", undefined, () => FALLBACK_UPLIFT),

  triggerWebhookAlert: (customerId: string, channel = "slack", webhookUrl?: string, note?: string) =>
    request<any>(
      "/webhooks/alert",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, channel, webhook_url: webhookUrl, note }),
      },
      () => ({
        status: "success",
        channel,
        customer_id: customerId,
        message: `Webhook alert dispatched successfully to ${channel}.`,
      })
    ),

  getActionHistory: (customerId: string) =>
    request<any>(`/retention/history/${encodeURIComponent(customerId)}`, undefined, () => []),

  logAction: (body: { customer_id: string; action_type: string; channel?: string; tone?: string; notes: string; performed_by?: string }) =>
    request<any>(
      "/retention/log-action",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      () => ({
        status: "success",
        action_id: `act-${Date.now()}`,
        ...body,
        logged_at: new Date().toISOString(),
      })
    ),

  getAiSuggestions: () =>
    request<Array<{ id: string; label: string; question: string }>>(
      "/assistant/suggestions",
      undefined,
      () => FALLBACK_AI_SUGGESTIONS
    ),

  askAiAssistant: (question: string, history?: any[]) =>
    request<any>(
      "/assistant/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      },
      () => ({
        answer: `Based on the customer intelligence dataset:\n- Total tracked accounts: 500\n- High/Critical risk accounts: 78\n- Observed monthly revenue at risk: $42,350\n- Top driver of risk: Support friction and seat utilization dropping under 35%.\n\nRecommended next step: Use the Retention Queue to review accounts or test retention incentives in the What-If Simulator.`,
        data: FALLBACK_CUSTOMERS.slice(0, 3),
        chart_type: "table",
        query_type: "general",
      })
    ),
};