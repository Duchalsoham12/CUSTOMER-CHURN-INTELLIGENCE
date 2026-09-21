from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import check_database_connection, get_db
from app.core.metrics import system_metrics
from app.data.pipeline import run_pipeline
from app.models.prediction import Prediction

router = APIRouter(prefix="/monitoring", tags=["monitoring"])
MODEL_PATH = Path(__file__).resolve().parents[3] / "ml" / "artifacts" / "churn_rf_v1.joblib"


@router.get("/system")
def system_monitoring() -> dict[str, Any]:
    metrics = system_metrics.snapshot()
    pipeline_quality = run_pipeline()["quality"]

    db_ok = False
    try:
        db_ok = check_database_connection()
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok and MODEL_PATH.exists() else "degraded",
        "system_metrics": metrics,
        "database_connected": db_ok,
        "model_artifact_ready": MODEL_PATH.exists(),
        "data_quality_snapshot": {
            "total_rows": pipeline_quality.get("rows", 0),
            "missing_values": pipeline_quality.get("missing_values", 0),
            "duplicates_detected": pipeline_quality.get("duplicate_rows", 0),
            "quality_status": pipeline_quality.get("quality_status", "unknown"),
        },
        "monitoring_mode": "operational_telemetry",
        "note": "Metrics reflect real collected HTTP requests and pipeline validation runs.",
    }


@router.get("/model")
def model_monitoring(session: Session = Depends(get_db)) -> dict[str, Any]:
    count = int(session.scalar(select(func.count()).select_from(Prediction)) or 0)
    average = session.scalar(select(func.avg(Prediction.churn_probability)))
    high_risk = int(
        session.scalar(
            select(func.count())
            .select_from(Prediction)
            .where(Prediction.risk_level.in_(["high", "churned"]))
        )
        or 0
    )
    return {
        "prediction_count": count,
        "average_churn_probability": round(float(average), 6) if average is not None else None,
        "high_risk_percentage": round(high_risk / count * 100, 2) if count else None,
        "model_version": "churn_rf_v1" if count else None,
        "status": "available" if count else "no_predictions",
        "offline_evaluation_vs_production": "Offline validation metrics (ROC-AUC 0.9536) measure historical holdout accuracy; production monitoring requires prospective ground-truth outcome labels.",
    }


@router.get("/overview")
def monitoring_overview(session: Session = Depends(get_db)) -> dict[str, Any]:
    return {
        "system": system_monitoring(),
        "model": model_monitoring(session),
    }
