from collections import Counter, defaultdict
from typing import Any

from app.data.pipeline import run_pipeline


def overview() -> dict[str, Any]:
    rows = run_pipeline()["rows"]
    total = len(rows)
    churned = sum(row.get("churn_risk_level") == "churned" for row in rows)
    revenue = sum(float(row.get("mrr_usd") or 0) for row in rows)
    high_risk = sum(row.get("churn_risk_level") == "high" for row in rows)
    return {"total_customers": total, "active_customers": total - churned, "churn_rate": round(churned / total * 100, 2) if total else 0, "retention_rate": round((total - churned) / total * 100, 2) if total else 0, "total_revenue": round(revenue, 2), "average_customer_value": round(revenue / total, 2) if total else 0, "revenue_at_risk": round(sum(float(row.get("mrr_usd") or 0) for row in rows if row.get("churn_risk_level") in {"high", "churned"}), 2), "high_risk_customers": high_risk}


def churn() -> dict[str, Any]:
    rows = run_pipeline()["rows"]
    by_plan: dict[str, list[int]] = defaultdict(list)
    by_tenure: dict[str, list[int]] = defaultdict(list)
    for row in rows:
        churned = int(row.get("churn_risk_level") == "churned")
        by_plan[str(row.get("plan_type"))].append(churned)
        tenure = int(row.get("tenure_months") or 0)
        band = "0-3" if tenure <= 3 else "4-12" if tenure <= 12 else "13+"
        by_tenure[band].append(churned)
    rate = lambda values: round(sum(values) / len(values) * 100, 2) if values else 0
    return {"total_customers": len(rows), "churned_customers": sum(row.get("churn_risk_level") == "churned" for row in rows), "by_subscription": [{"name": key, "churn_rate": rate(value)} for key, value in by_plan.items()], "by_tenure": [{"name": key, "churn_rate": rate(value)} for key, value in sorted(by_tenure.items())], "note": "Associations in observed labels; not causal effects."}


def rfm() -> dict[str, Any]:
    rows = run_pipeline()["rows"]
    segments = Counter()
    items = []
    for row in rows:
        value = float(row.get("customer_value_proxy_usd") or 0)
        utilization = float(row.get("engagement_score_proxy") or 0)
        risk = str(row.get("churn_risk_level"))
        segment = "At Risk" if risk in {"high", "churned"} else "Champions" if value >= 10000 and utilization >= 50 else "Loyal Customers" if utilization >= 50 else "Potential Loyalists"
        segments[segment] += 1
        items.append({"customer_id": row.get("conversation_id"), "segment": segment, "monetary_proxy": value, "engagement_proxy": utilization})
    return {"source": "full.jsonl", "method": "RFM proxy: MRR x tenure for monetary value; seat utilization for engagement; no transaction dates available.", "segments": [{"name": key, "customers": value} for key, value in segments.items()], "items": items}


def revenue() -> dict[str, Any]:
    rows = run_pipeline()["rows"]
    grouped: dict[str, float] = defaultdict(float)
    for row in rows:
        grouped[str(row.get("churn_risk_level"))] += float(row.get("mrr_usd") or 0)
    return {"currency": "USD MRR", "by_risk_level": [{"name": key, "revenue": round(value, 2)} for key, value in grouped.items()], "total_revenue_at_risk": round(sum(value for key, value in grouped.items() if key in {"high", "churned"}), 2), "note": "Observed MRR grouped by source labels, not expected loss."}


def unavailable_time_analytics(kind: str) -> dict[str, Any]:
    return {"source": "full.jsonl", "data": [], "status": "unavailable", "note": f"{kind} requires source dates and transaction events; the supplied dataset contains neither."}