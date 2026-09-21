from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


STATUSES = {"new", "reviewed", "in_progress", "contacted", "resolved", "dismissed"}


class RetentionActionCreate(BaseModel):
    customer_id: str
    prediction_id: UUID | None = None
    assigned_to: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)


class RetentionActionUpdate(BaseModel):
    status: str | None = None
    assigned_to: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)


class RetentionActionResponse(BaseModel):
    action_id: UUID
    customer_id: str
    risk_level: str
    priority: str
    recommended_action: str
    status: str
    assigned_to: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    reviewed_at: datetime | None
    resolved_at: datetime | None
    business_signals: list[dict[str, str]]
    priority_reasons: list[str]


class RetentionQueueResponse(BaseModel):
    items: list[RetentionActionResponse]
    page: int
    page_size: int
    total: int
    pages: int
    note: str
