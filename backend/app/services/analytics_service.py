from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.subscription import Subscription


def dashboard_from_database(session: Session) -> dict[str, float | int]:
    total = int(session.scalar(select(func.count()).select_from(Customer)) or 0)
    revenue = float(session.scalar(select(func.coalesce(func.sum(Subscription.mrr_usd), 0))) or 0)
    average = revenue / total if total else 0
    return {
        "total_customers": total,
        "active_customers": total,
        "churn_rate": 0.0,
        "retention_rate": 1.0 if total else 0.0,
        "total_revenue": round(revenue, 2),
        "average_customer_value": round(average, 2),
        "revenue_at_risk": 0.0,
        "high_risk_customers": 0,
    }