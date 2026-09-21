from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: UUID
    external_customer_id: str = Field(min_length=1, max_length=200)
    customer_persona: str | None = None
    company_size: str | None = None
    created_at: datetime | None = None


class CustomerPage(BaseModel):
    items: list[CustomerResponse]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    pages: int = Field(ge=0)