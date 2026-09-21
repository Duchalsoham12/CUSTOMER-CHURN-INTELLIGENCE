import json
from pathlib import Path
from typing import Any

from app.data.cleaning import clean_records
from app.data.features import engineer_features
from app.data.validation import validate_records


DEFAULT_SOURCE = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def load_jsonl(path: Path = DEFAULT_SOURCE) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def run_pipeline(path: Path = DEFAULT_SOURCE) -> dict[str, Any]:
    raw = load_jsonl(path)
    quality = validate_records(raw)
    cleaned, cleaning = clean_records(raw)
    featured = engineer_features(cleaned)
    return {"quality": quality, "cleaning": cleaning, "rows": featured, "limitations": ["No source dates: time series and cohorts are unavailable.", "No transaction events: true RFM recency/frequency is unavailable; segments use transparent value and utilization proxies."]}