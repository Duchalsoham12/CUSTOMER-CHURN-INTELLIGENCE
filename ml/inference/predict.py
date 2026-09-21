from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "ml" / "artifacts" / "churn_rf_v1.joblib"
DATA_PATH = ROOT / "data" / "raw" / "full.jsonl"
TARGET_EXCLUSIONS = {
    "conversation_id",
    "churn_risk_level",
    "conversation",
    "summary",
    "churn_signals",
    "sentiment_arc",
    "resolution_outcome",
    "participants",
}


def load_customer_record(customer_id: str) -> dict[str, object]:
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        if str(record.get("conversation_id")) == customer_id:
            return record
    raise KeyError(f"Customer {customer_id!r} was not found in the live dataset.")


def build_feature_frame(record: dict[str, object]) -> pd.DataFrame:
    model = joblib.load(MODEL_PATH)
    feature_names = list(getattr(model, "feature_names_in_", []))
    if not feature_names:
        excluded = TARGET_EXCLUSIONS | {"conversation_id", "participants"}
        feature_names = [
            column
            for column in record
            if column not in excluded and column not in {"conversation", "summary", "churn_signals"}
        ]
    row = {name: record.get(name) for name in feature_names}
    frame = pd.DataFrame([row], columns=feature_names)
    return frame


def predict_customer(customer_id: str) -> dict[str, object]:
    model = joblib.load(MODEL_PATH)
    record = load_customer_record(customer_id)
    feature_frame = build_feature_frame(record)
    probability = float(model.predict_proba(feature_frame)[0, 1]) if len(model.classes_) > 1 else float(model.predict_proba(feature_frame)[0, 0])
    if len(model.classes_) > 1 and 1 in model.classes_:
        index = int(np.where(model.classes_ == 1)[0][0])
        probability = float(model.predict_proba(feature_frame)[0, index])
    risk_level = "low"
    if probability >= 0.7:
        risk_level = "churned"
    elif probability >= 0.4:
        risk_level = "high"
    elif probability >= 0.2:
        risk_level = "medium"
    return {
        "customer_id": str(record.get("conversation_id")),
        "churn_probability": round(probability, 6),
        "risk_level": risk_level,
        "customer_value": float(record.get("mrr_usd") or 0.0),
        "revenue_at_risk": round(float(record.get("mrr_usd") or 0.0) * probability, 2),
        "model_version": "churn_rf_v1",
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python -m ml.inference.predict CUSTOMER_ID")
    print(json.dumps(predict_customer(sys.argv[1])))
