const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
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

export interface CustomerResponse { items: ApiCustomer[]; page: number; page_size: number; total: number; pages: number; }

export const api = {
  getDashboard: () => request("/dashboard"),
  getCustomers: (query = "") => request<CustomerResponse>(`/customers${query ? `?${query}` : ""}`),
  getCustomer: (id: string) => request<ApiCustomer>(`/customers/${encodeURIComponent(id)}`),
  getChurnAnalytics: () => request<Record<string, unknown>>("/analytics/churn"),
  getSegments: () => request<Record<string, unknown>>("/analytics/rfm"),
  getCohorts: () => request<Record<string, unknown>>("/analytics/cohorts"),
  getRevenueRisk: () => request<Record<string, unknown>>("/analytics/revenue"),
  getAnalyticsOverview: () => request("/analytics/overview"),
  getExecutiveAnalytics: () => request("/analytics/executive"),
  getMonthlyAnalytics: () => request("/analytics/monthly"),
  getModelPerformance: () => request("/model-performance"),
  predict: (customerId: string) => request("/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer_id: customerId }) }),
  getRetentionOverview: () => request("/retention/overview"),
  getRetentionQueue: (query = "") => request(`/retention/queue${query ? `?${query}` : ""}`),
  updateRetentionAction: (id: string, body: unknown) => request(`/retention/actions/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  uploadDataset: (file: File) => { const form = new FormData(); form.append("file", file); return request("/upload", { method: "POST", body: form }); },
};