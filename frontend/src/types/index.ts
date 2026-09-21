export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Customer {
  id: string;
  name: string;
  segment: string;
  risk: RiskLevel;
  churnProbability: number;
  customerValue: number;
  revenueAtRisk: number;
  reason: string;
  action: string;
  plan: string;
  tenure: string;
  engagement: string;
  tickets: number;
}

export interface Kpi {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "negative" | "neutral";
}

export interface ChartPoint {
  name: string;
  value: number;
  secondary?: number;
}