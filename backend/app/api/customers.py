from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.services.dashboard import load_records, recommended_action

router = APIRouter(tags=["customers"])


def format_customer(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "record_id": record.get("conversation_id"),
        "risk_level": record.get("churn_risk_level"),
        "mrr_usd": record.get("mrr_usd"),
        "plan_name": record.get("plan_name"),
        "plan_type": record.get("plan_type"),
        "tenure_months": record.get("tenure_months"),
        "customer_persona": record.get("customer_persona"),
        "risk_signal": record.get("churn_signals"),
        "recommended_action": recommended_action(str(record.get("churn_risk_level", "")), str(record.get("churn_signals", ""))),
        "resolution_outcome": record.get("resolution_outcome"),
    }


@router.get("/customers")
def customers(
    search: str | None = Query(default=None, min_length=1, max_length=100),
    risk_level: str | None = Query(default=None, pattern="^(low|medium|high|churned)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
) -> dict[str, Any]:
    records = load_records()
    normalized_search = search.casefold() if search else None
    filtered_records = []

    for record in records:
        if risk_level and record.get("churn_risk_level") != risk_level:
            continue
        searchable = " ".join(
            str(record.get(field, ""))
            for field in ("conversation_id", "plan_name", "plan_type", "customer_persona", "churn_signals")
        ).casefold()
        if normalized_search and normalized_search not in searchable:
            continue
        filtered_records.append(record)

    total = len(filtered_records)
    start = (page - 1) * page_size
    page_records = filtered_records[start : start + page_size]
    items = [format_customer(record) for record in page_records]
    return {"items": items, "page": page, "page_size": page_size, "total": total, "pages": (total + page_size - 1) // page_size}


@router.get("/customers/{record_id}")
def customer_detail(record_id: str) -> dict[str, Any]:
    record = next((item for item in load_records() if item.get("conversation_id") == record_id), None)
    if record is None:
        raise HTTPException(status_code=404, detail="Customer record not found.")
    return format_customer(record)