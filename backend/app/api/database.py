from fastapi import APIRouter, HTTPException

from app.core.database import check_database_connection

router = APIRouter(prefix="/database", tags=["system"])


@router.get("/health")
def database_health() -> dict[str, str]:
    try:
        check_database_connection()
    except Exception as error:
        raise HTTPException(status_code=503, detail="Database is unavailable.") from error
    return {"status": "ok", "service": "postgresql"}