import json
from collections import Counter
from pathlib import Path
from typing import Any


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def recommended_action(risk_level: str, signal: str) -> str:
    normalized_signal = signal.casefold()
    if "billing" in normalized_signal or "payment" in normalized_signal:
        return "Review billing issue with customer success."
    if "support" in normalized_signal:
        return "Schedule a support follow-up and review open issues."
    if "feature" in normalized_signal:
        return "Share product roadmap and collect feature feedback."
    if "competitor" in normalized_signal or "pricing" in normalized_signal:
        return "Offer a value review with plan and pricing options."
    if risk_level in {"high", "churned"}:
        return "Prioritize proactive customer-success outreach."
    return "Continue regular engagement monitoring."


def load_records() -> list[dict[str, Any]]:
    if not DATA_PATH.exists():
        return []
    return [
        json.loads(line)
        for line in DATA_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def build_dashboard_summary() -> dict[str, Any]:
    records = load_records()
    risk_distribution = Counter(record.get("churn_risk_level", "unknown") for record in records)
    plan_distribution = Counter(record.get("plan_type", "unknown") for record in records)
    mrr_values = [float(record["mrr_usd"]) for record in records if record.get("mrr_usd") is not None]
    churned_count = risk_distribution.get("churned", 0)

    return {
        "source": DATA_PATH.name if records else None,
        "total_records": len(records),
        "churned_records": churned_count,
        "churned_record_rate": round(churned_count / len(records), 4) if records else None,
        "high_risk_records": risk_distribution.get("high", 0),
        "total_mrr_usd": round(sum(mrr_values), 2),
        "average_mrr_usd": round(sum(mrr_values) / len(mrr_values), 2) if mrr_values else None,
        "risk_distribution": dict(risk_distribution),
        "plan_distribution": dict(plan_distribution),
    }