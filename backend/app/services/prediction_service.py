import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.prediction import Prediction

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def _load_customer_record(customer_id: str) -> dict[str, object]:
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        if str(record.get("conversation_id")) == customer_id:
            return record
    raise KeyError(f"Customer {customer_id!r} was not found in the live dataset.")


def predict(customer_id: str, session: Session | None = None) -> dict[str, object]:
    _load_customer_record(customer_id)
    root = DATA_PATH.parents[2]
    env = os.environ.copy()
    env["PYTHONPATH"] = str(root)
    try:
        completed = subprocess.run(
            [sys.executable, "-m", "ml.inference.predict", customer_id],
            cwd=root,
            env=env,
            capture_output=True,
            text=True,
            timeout=15,
            check=True,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("The trained model did not load within 15 seconds.") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(exc.stderr.strip() or "The trained model process failed.") from exc
    payload = json.loads(completed.stdout.strip())
    payload["created_at"] = datetime.now(timezone.utc)
    if session is not None:
        customer = session.scalar(select(Customer).where(Customer.external_customer_id == customer_id))
        if customer is not None:
            prediction = Prediction(
                customer_id=customer.customer_id,
                model_name="random_forest",
                model_version="churn_rf_v1",
                churn_probability=payload["churn_probability"],
                risk_level=payload["risk_level"],
                revenue_at_risk_usd=payload["revenue_at_risk"],
            )
            session.add(prediction)
            session.commit()
            session.refresh(prediction)
            payload["prediction_id"] = str(prediction.prediction_id)
    return payload