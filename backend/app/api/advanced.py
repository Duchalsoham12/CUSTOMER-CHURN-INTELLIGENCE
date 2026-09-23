from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.explainability import explain_customer
from app.services.llm_copilot import generate_retention_outreach
from app.services.simulator import run_scenario_simulation
from app.services.uplift import compute_uplift_segmentation
from app.services.webhooks import dispatch_retention_alert

router = APIRouter(tags=["advanced enterprise intelligence"])

# In-memory action audit trail store (persisted for session)
AUDIT_LOGS: list[dict[str, Any]] = [
    {
        "id": "log-001",
        "customer_id": "CCC-06123",
        "action_type": "email_sent",
        "channel": "email",
        "tone": "empathetic",
        "notes": "Sent proactive renewal outreach offering 15% credit.",
        "performed_by": "CS Director",
        "timestamp": "2026-09-22T10:14:00Z",
    },
    {
        "id": "log-002",
        "customer_id": "CCC-06124",
        "action_type": "webhook_alert",
        "channel": "slack",
        "tone": "urgent",
        "notes": "Triggered urgent Slack alert to Enterprise CS squad.",
        "performed_by": "Automated Alert Rule",
        "timestamp": "2026-09-22T11:30:00Z",
    },
]


# Pydantic Request Models
class OutreachRequest(BaseModel):
    customer_id: str
    tone: str = Field(default="empathetic", description="empathetic | executive | urgent | incentive_focused")
    custom_notes: str | None = None


class SimulationRequest(BaseModel):
    discount_pct: float = Field(default=10.0, ge=0.0, le=40.0)
    support_sla_reduction_pct: float = Field(default=20.0, ge=0.0, le=60.0)
    feature_adoption_boost: float = Field(default=15.0, ge=0.0, le=50.0)
    target_tier: str = Field(default="high_risk", description="all | high_risk | medium_and_high | enterprise")


class WebhookAlertRequest(BaseModel):
    customer_id: str
    channel: str = Field(default="slack", description="slack | discord")
    webhook_url: str | None = None
    note: str | None = None


class ActionLogRequest(BaseModel):
    customer_id: str
    action_type: str = Field(description="email_sent | call_scheduled | offer_made | webhook_alert")
    channel: str = Field(default="email")
    tone: str | None = None
    notes: str
    performed_by: str = Field(default="CS Manager")


# 1. Real-Time TreeSHAP Waterfall Explainability
@router.get("/customers/{customer_id}/shap", summary="Get TreeSHAP feature attributions")
def get_customer_shap_explainability(customer_id: str) -> dict[str, Any]:
    result = explain_customer(customer_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} was not found.")
    return result


# 2. Generative AI Retention Copilot
@router.post("/retention/generate-outreach", summary="Generate AI retention outreach package")
def create_retention_outreach(request: OutreachRequest) -> dict[str, Any]:
    result = generate_retention_outreach(
        customer_id=request.customer_id,
        tone=request.tone,
        custom_notes=request.custom_notes,
    )
    if not result:
        raise HTTPException(status_code=404, detail=f"Customer {request.customer_id} was not found.")
    return result


# 3. Interactive What-If Scenario Simulator
@router.post("/analytics/simulate", summary="Run portfolio What-If scenario simulation")
def simulate_retention_scenario(request: SimulationRequest) -> dict[str, Any]:
    return run_scenario_simulation(
        discount_pct=request.discount_pct,
        support_sla_reduction_pct=request.support_sla_reduction_pct,
        feature_adoption_boost=request.feature_adoption_boost,
        target_tier=request.target_tier,
    )


# 4. Causal ML & Uplift Modeling Segmentation
@router.get("/analytics/uplift", summary="Get Causal Uplift quadrant segmentation")
def get_uplift_segmentation() -> dict[str, Any]:
    return compute_uplift_segmentation()


# 5. Real-Time Webhook Alerting
@router.post("/webhooks/alert", summary="Dispatch real-time customer churn alert")
def trigger_retention_alert(request: WebhookAlertRequest) -> dict[str, Any]:
    return dispatch_retention_alert(
        customer_id=request.customer_id,
        channel=request.channel,
        webhook_url=request.webhook_url,
        note=request.note,
    )


# 6. Action Audit Trail & Outreach History
@router.get("/retention/history/{customer_id}", summary="Get customer retention action history")
def get_customer_action_history(customer_id: str) -> dict[str, Any]:
    customer_logs = [log for log in AUDIT_LOGS if log["customer_id"] == customer_id]
    return {
        "customer_id": customer_id,
        "total_actions": len(customer_logs),
        "actions": sorted(customer_logs, key=lambda x: x["timestamp"], reverse=True),
    }


@router.post("/retention/log-action", summary="Record a retention intervention in audit log")
def log_customer_action(request: ActionLogRequest) -> dict[str, Any]:
    new_log = {
        "id": f"log-{uuid.uuid4().hex[:6]}",
        "customer_id": request.customer_id,
        "action_type": request.action_type,
        "channel": request.channel,
        "tone": request.tone or "standard",
        "notes": request.notes,
        "performed_by": request.performed_by,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    AUDIT_LOGS.insert(0, new_log)
    return {"status": "recorded", "entry": new_log}
