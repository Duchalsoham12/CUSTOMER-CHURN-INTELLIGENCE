from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse, DashboardResponse
from app.services.analytics_service import dashboard_from_database

router = APIRouter(tags=["analytics"])


@router.get("/database-dashboard", response_model=DashboardResponse, summary="Read database-backed dashboard metrics")
def database_dashboard(session: Session = Depends(get_db)) -> DashboardResponse:
    return DashboardResponse(**dashboard_from_database(session))


@router.get("/segments", response_model=AnalyticsResponse, summary="Read customer segment analytics")
def segments() -> AnalyticsResponse:
    return AnalyticsResponse(source="database", points=[], note="Segments will be populated by the RFM pipeline in the next step.")


@router.get("/cohorts", response_model=AnalyticsResponse, summary="Read cohort retention analytics")
def cohorts() -> AnalyticsResponse:
    return AnalyticsResponse(source="database", points=[], note="Cohorts require transaction history and will be populated in the analytics step.")