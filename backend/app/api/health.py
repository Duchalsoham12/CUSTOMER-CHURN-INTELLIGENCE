from fastapi import APIRouter, HTTPException
from pathlib import Path

from app.core.database import check_database_connection

router = APIRouter(tags=["system"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "customer-intelligence-api"}


@router.get("/health/db")
def database_health_alias() -> dict[str, str]:
    try:
        check_database_connection()
    except Exception as error:
        raise HTTPException(status_code=503, detail="Database is unavailable.") from error
    return {"status": "ok", "service": "postgresql"}


@router.get("/health/ml")
def ml_health() -> dict[str, str]:
    artifact = Path(__file__).resolve().parents[3] / "ml" / "artifacts" / "churn_rf_v1.joblib"
    if not artifact.exists():
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Required ML artifact is unavailable.")
    return {"status": "ok", "service": "churn-model", "model_version": "churn_rf_v1"}