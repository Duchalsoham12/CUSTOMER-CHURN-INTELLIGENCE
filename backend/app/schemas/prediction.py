from datetime import datetime

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    customer_id: str


class PredictionResponse(BaseModel):
    prediction_id: str | None = None
    customer_id: str
    churn_probability: float = Field(ge=0, le=1)
    risk_level: str
    customer_value: float = Field(ge=0)
    revenue_at_risk: float = Field(ge=0)
    model_version: str
    created_at: datetime