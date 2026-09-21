from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "raw" / "full.jsonl"


def build_feature_dictionary(record: dict[str, object]) -> dict[str, object]:
    return {
        "conversation_id": record.get("conversation_id"),
        "channel": record.get("channel"),
        "product_category": record.get("product_category"),
        "customer_tenure": record.get("customer_tenure"),
        "tenure_months": record.get("tenure_months"),
        "customer_persona": record.get("customer_persona"),
        "company_size": record.get("company_size"),
        "plan_name": record.get("plan_name"),
        "plan_type": record.get("plan_type"),
        "seats": record.get("seats"),
        "active_seats": record.get("active_seats"),
        "per_seat_price_usd": record.get("per_seat_price_usd"),
        "mrr_usd": record.get("mrr_usd"),
        "discount_offered_pct": record.get("discount_offered_pct"),
        "turn_count": record.get("turn_count"),
        "word_count": record.get("word_count"),
        "sentiment_arc": record.get("sentiment_arc"),
        "injection_style": record.get("injection_style"),
        "agent_persona": record.get("agent_persona"),
    }


def load_feature_rows() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(build_feature_dictionary(json.loads(line)))
    return rows
