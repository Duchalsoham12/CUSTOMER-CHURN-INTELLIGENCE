from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.prediction import Prediction

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/model")
def model_monitoring(session: Session = Depends(get_db)) -> dict[str, object]:
    count = int(session.scalar(select(func.count()).select_from(Prediction)) or 0)
    average = session.scalar(select(func.avg(Prediction.churn_probability)))
    high_risk = int(session.scalar(select(func.count()).select_from(Prediction).where(Prediction.risk_level.in_(["high", "churned"]))) or 0)
    return {
        "prediction_count": count,
        "average_churn_probability": round(float(average), 6) if average is not None else None,
        "high_risk_percentage": round(high_risk / count * 100, 2) if count else None,
        "model_version": "churn_rf_v1" if count else None,
        "status": "available" if count else "no_predictions",
        "note": "Prediction drift and real-world performance require a defined baseline and future outcome labels.",
    }
