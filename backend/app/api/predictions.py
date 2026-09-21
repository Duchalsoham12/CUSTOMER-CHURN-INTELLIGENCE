import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import predict

router = APIRouter(tags=["predictions"])
METRICS_PATH = Path(__file__).resolve().parents[3] / "ml" / "artifacts" / "model_comparison.json"


@router.post("/predict", response_model=PredictionResponse, summary="Request a churn prediction")
def create_prediction(request: PredictionRequest, session: Session = Depends(get_db)) -> PredictionResponse:
    try:
        payload = predict(request.customer_id, session)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Customer {request.customer_id} was not found.") from exc
    except (FileNotFoundError, ImportError, OSError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="The trained churn model is unavailable in this environment.") from exc
    return PredictionResponse(**payload)


@router.post("/predict/batch", summary="Score a batch of customers")
def create_batch_prediction(requests: list[PredictionRequest], session: Session = Depends(get_db)) -> dict[str, object]:
    if not requests:
        raise HTTPException(status_code=422, detail="At least one customer_id is required.")
    if len(requests) > 100:
        raise HTTPException(status_code=413, detail="Batch size cannot exceed 100 customers.")
    results = []
    for request in requests:
        try:
            results.append(predict(request.customer_id, session))
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"Customer {request.customer_id} was not found.") from exc
        except (FileNotFoundError, ImportError, OSError, RuntimeError) as exc:
            raise HTTPException(status_code=503, detail="The trained churn model is unavailable in this environment.") from exc
    return {"items": results, "count": len(results), "note": "Predictions are probabilistic risk estimates, not causal findings."}


@router.get("/model-performance", summary="Read model performance")
def model_performance() -> dict[str, object]:
    if not METRICS_PATH.exists():
        return {"status": "not_configured", "metrics": {}, "note": "No trained model metadata is available yet."}
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))