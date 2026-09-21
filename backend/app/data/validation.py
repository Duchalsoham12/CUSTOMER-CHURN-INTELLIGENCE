from collections import Counter
from typing import Any

REQUIRED_COLUMNS = {"conversation_id", "churn_risk_level", "tenure_months", "mrr_usd", "plan_type"}
ALLOWED_RISK = {"low", "medium", "high", "churned"}
ALLOWED_PLAN_TYPES = {"monthly", "annual"}


def validate_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    columns = set(records[0]) if records else set()
    missing_columns = sorted(REQUIRED_COLUMNS - columns)
    ids = [str(record.get("conversation_id", "")) for record in records]
    duplicate_rows = len(ids) - len(set(ids))
    invalid_values = 0
    invalid_customer_ids = 0
    invalid_risk = 0
    invalid_plan = 0
    negative_spend = 0
    for record in records:
        customer_id = str(record.get("conversation_id", ""))
        if not customer_id.startswith("CCC-"):
            invalid_customer_ids += 1
        if record.get("churn_risk_level") not in ALLOWED_RISK:
            invalid_risk += 1
        if record.get("plan_type") not in ALLOWED_PLAN_TYPES:
            invalid_plan += 1
        try:
            if float(record.get("mrr_usd", 0)) < 0:
                negative_spend += 1
        except (TypeError, ValueError):
            invalid_values += 1
    invalid_values += invalid_customer_ids + invalid_risk + invalid_plan + negative_spend
    missing_values = sum(value in (None, "") for record in records for value in record.values())
    return {
        "rows": len(records),
        "columns": len(columns),
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "invalid_values": invalid_values,
        "invalid_customer_ids": invalid_customer_ids,
        "invalid_risk_values": invalid_risk,
        "invalid_plan_values": invalid_plan,
        "negative_spend": negative_spend,
        "missing_required_columns": missing_columns,
        "quality_status": "error" if missing_columns or invalid_values else ("warning" if missing_values or duplicate_rows else "ready"),
    }