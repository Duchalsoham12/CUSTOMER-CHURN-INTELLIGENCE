import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.retention_action import RetentionAction
from app.schemas.retention import RetentionActionCreate, RetentionActionResponse, RetentionActionUpdate, RetentionQueueResponse, STATUSES
from app.services.recommendations import recommendation_for
from app.services.retention import retention_priority
from app.services.risk_signals import build_business_signals

router = APIRouter(prefix="/retention", tags=["retention intelligence"])
DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def source_records() -> dict[str, dict[str, object]]:
    return {str(item["conversation_id"]): item for item in (json.loads(line) for line in DATA_PATH.read_text(encoding="utf-8").splitlines() if line.strip())}


def action_response(action: RetentionAction, customer: Customer, prediction: Prediction, record: dict[str, object]) -> RetentionActionResponse:
    value = float(record.get("mrr_usd") or 0)
    probability = float(prediction.churn_probability or 0)
    revenue = float(prediction.revenue_at_risk_usd or value * probability)
    engagement = None
    seats = record.get("seats")
    if seats not in (None, 0) and record.get("active_seats") is not None:
        engagement = float(record["active_seats"]) / float(seats) * 100
    priority = retention_priority(probability, value, revenue, engagement)
    signals = build_business_signals(record)
    return RetentionActionResponse(
        action_id=action.action_id,
        customer_id=customer.external_customer_id,
        risk_level=str(prediction.risk_level),
        priority=action.priority,
        recommended_action=action.recommended_action,
        status=action.status,
        assigned_to=action.assigned_to,
        notes=action.notes,
        created_at=action.created_at,
        updated_at=action.updated_at,
        reviewed_at=action.reviewed_at,
        resolved_at=action.resolved_at,
        business_signals=signals,
        priority_reasons=priority.reasons,
    )


@router.get("/overview")
def retention_overview(session: Session = Depends(get_db)) -> dict[str, object]:
    actions = list(session.scalars(select(RetentionAction)))
    return {
        "high_risk_customers": sum(action.risk_level in {"high", "churned"} for action in actions),
        "high_priority_customers": sum(action.priority in {"critical", "high"} for action in actions),
        "revenue_at_risk": 0.0,
        "customers_requiring_review": sum(action.status in {"new", "reviewed", "in_progress"} for action in actions),
        "prediction_backed_actions": len(actions),
        "note": "Counts use persisted model predictions only; no observed risk labels are treated as model predictions.",
    }


@router.get("/queue", response_model=RetentionQueueResponse)
def retention_queue(
    risk_level: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_db),
) -> RetentionQueueResponse:
    if status and status not in STATUSES:
        raise HTTPException(status_code=422, detail="Invalid retention action status.")
    records = source_records()
    query = select(RetentionAction, Customer, Prediction).join(Customer, RetentionAction.customer_id == Customer.customer_id).join(Prediction, RetentionAction.prediction_id == Prediction.prediction_id)
    rows = list(session.execute(query))
    filtered = [(action, customer, prediction) for action, customer, prediction in rows if (not risk_level or prediction.risk_level == risk_level) and (not priority or action.priority == priority) and (not status or action.status == status)]
    total = len(filtered)
    page_rows = filtered[(page - 1) * page_size : page * page_size]
    items = [action_response(action, customer, prediction, records.get(customer.external_customer_id, {})) for action, customer, prediction in page_rows]
    return RetentionQueueResponse(items=items, page=page, page_size=page_size, total=total, pages=(total + page_size - 1) // page_size, note="Model explanations and business signals are distinct; recommendations are rule-based suggestions.")


@router.post("/actions", response_model=RetentionActionResponse, status_code=201)
def create_retention_action(payload: RetentionActionCreate, session: Session = Depends(get_db)) -> RetentionActionResponse:
    customer = session.scalar(select(Customer).where(Customer.external_customer_id == payload.customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found.")
    prediction = session.scalar(select(Prediction).where(Prediction.prediction_id == payload.prediction_id)) if payload.prediction_id else None
    if prediction is None:
        raise HTTPException(status_code=409, detail="A persisted model prediction is required to create a retention action.")
    record = source_records().get(payload.customer_id, {})
    priority_result = retention_priority(float(prediction.churn_probability or 0), float(record.get("mrr_usd") or 0), float(prediction.revenue_at_risk_usd or 0))
    recommendation = recommendation_for(build_business_signals(record), priority_result.priority)
    action = RetentionAction(customer_id=customer.customer_id, prediction_id=prediction.prediction_id, priority=priority_result.priority, risk_level=str(prediction.risk_level), recommended_action=recommendation["recommended_action"], assigned_to=payload.assigned_to, notes=payload.notes)
    session.add(action)
    session.commit()
    session.refresh(action)
    return action_response(action, customer, prediction, record)


@router.patch("/actions/{action_id}", response_model=RetentionActionResponse)
def update_retention_action(action_id: UUID, payload: RetentionActionUpdate, session: Session = Depends(get_db)) -> RetentionActionResponse:
    if payload.status and payload.status not in STATUSES:
        raise HTTPException(status_code=422, detail="Invalid retention action status.")
    action = session.get(RetentionAction, action_id)
    if action is None:
        raise HTTPException(status_code=404, detail="Retention action not found.")
    if payload.status:
        action.status = payload.status
        now = datetime.now(timezone.utc)
        if payload.status == "reviewed":
            action.reviewed_at = now
        if payload.status == "resolved":
            action.resolved_at = now
    if payload.assigned_to is not None:
        action.assigned_to = payload.assigned_to
    if payload.notes is not None:
        action.notes = payload.notes
    action.updated_at = datetime.now(timezone.utc)
    session.commit()
    prediction = session.get(Prediction, action.prediction_id)
    customer = session.get(Customer, action.customer_id)
    if prediction is None or customer is None:
        raise HTTPException(status_code=500, detail="Retention action relationships are inconsistent.")
    return action_response(action, customer, prediction, source_records().get(customer.external_customer_id, {}))
