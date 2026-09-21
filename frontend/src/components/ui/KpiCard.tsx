import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Kpi } from "../../types";

export function KpiCard({ item }: { item: Kpi }) {
  const Icon = item.tone === "positive" ? ArrowUpRight : item.tone === "negative" ? ArrowDownRight : Minus;
  return <article className="kpi-card"><span>{item.label}</span><strong>{item.value}</strong><small className={item.tone}><Icon size={13} /> {item.change} <em>vs last month</em></small></article>;
}