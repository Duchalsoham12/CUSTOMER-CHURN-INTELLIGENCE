from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.data.statistics import association_report
from app.services.advanced_analytics import churn, overview, rfm, revenue, unavailable_time_analytics
from app.core.database import get_db
from app.models.retention_action import RetentionAction
from sqlalchemy import func, select

router = APIRouter(prefix="/analytics", tags=["advanced analytics"])


@router.get("/executive")
def executive_analytics(session: Session = Depends(get_db)) -> dict[str, object]:
    overview_data = overview()
    retention_actions = int(session.scalar(select(func.count()).select_from(RetentionAction).where(RetentionAction.priority.in_(["critical", "high"]))) or 0)
    return {
        "kpis": {**overview_data, "high_priority_customers": retention_actions},
        "churn": churn(),
        "revenue": revenue(),
        "segments": rfm(),
        "retention": {"high_priority_customers": retention_actions},
        "monthly": unavailable_time_analytics("Monthly executive trends"),
        "cohorts": unavailable_time_analytics("Executive cohort analysis"),
        "limitations": ["The source has no event dates or transaction history, so monthly and cohort sections are unavailable.", "Revenue at risk is an analytical prioritization metric, not guaranteed loss."],
    }


@router.get("/overview")
def analytics_overview() -> dict[str, object]:
    return overview()


@router.get("/churn")
def analytics_churn() -> dict[str, object]:
    return churn()


@router.get("/monthly")
def analytics_monthly() -> dict[str, object]:
    return unavailable_time_analytics("Monthly time-series analytics")


@router.get("/rfm")
def analytics_rfm() -> dict[str, object]:
    return rfm()


@router.get("/cohorts")
def analytics_cohorts() -> dict[str, object]:
    return unavailable_time_analytics("Cohort analysis")


@router.get("/revenue")
def analytics_revenue() -> dict[str, object]:
    return revenue()


@router.get("/statistics")
def analytics_statistics() -> dict[str, object]:
    return association_report()