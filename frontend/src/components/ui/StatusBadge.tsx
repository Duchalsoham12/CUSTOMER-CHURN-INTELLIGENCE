import type { RiskLevel } from "../../types";

export function StatusBadge({ risk }: { risk: RiskLevel | string }) {
  return <span className={`status-badge status-${risk.toLowerCase().replace(" ", "-")}`}>{risk}</span>;
}