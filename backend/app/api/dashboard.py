from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.dashboard import build_dashboard_summary
from app.services.analytics_service import dashboard_from_database

router = APIRouter(tags=["analytics"])


@router.get("/dashboard")
def dashboard_summary(session: Session = Depends(get_db)) -> dict[str, object]:
    return {**build_dashboard_summary(), **dashboard_from_database(session)}