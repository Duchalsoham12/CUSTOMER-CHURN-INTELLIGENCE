from pydantic import BaseModel, Field


class DashboardResponse(BaseModel):
    total_customers: int = Field(ge=0)
    active_customers: int = Field(ge=0)
    churn_rate: float = Field(ge=0, le=1)
    retention_rate: float = Field(ge=0, le=1)
    total_revenue: float = Field(ge=0)
    average_customer_value: float = Field(ge=0)
    revenue_at_risk: float = Field(ge=0)
    high_risk_customers: int = Field(ge=0)


class AnalyticsPoint(BaseModel):
    name: str
    value: float


class AnalyticsResponse(BaseModel):
    source: str
    points: list[AnalyticsPoint]
    note: str