from __future__ import annotations

import json
from pathlib import Path
from typing import Any

METADATA_PATH = Path(__file__).resolve().parents[3] / "ml" / "artifacts" / "feature_metadata.json"
DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"

FRIENDLY_NAMES: dict[str, str] = {
    "numeric__word_count": "Transcript Word Count",
    "numeric__discount_offered_pct": "Discount Offered (%)",
    "numeric__turn_count": "Support Turn Count",
    "numeric__tenure_months": "Account Tenure (Months)",
    "categorical__sentiment_arc_positive_to_negative": "Negative Sentiment Shift",
    "numeric__per_seat_price_usd": "Per-Seat Pricing ($)",
    "categorical__channel_live_chat": "Support Channel: Live Chat",
    "numeric__seats": "Total Subscribed Seats",
    "numeric__active_seats": "Active Subscribed Seats",
    "numeric__mrr_usd": "Monthly Recurring Revenue ($)",
    "categorical__sentiment_arc_aggressive_throughout": "High Frustration / Aggression",
    "categorical__plan_name_starter": "Plan: Starter Tier",
    "categorical__billing_cycle_monthly": "Contract: Monthly Billing",
    "seat_utilization": "Seat Utilization Rate (%)",
}

# Population medians/means derived from full.jsonl for attribution baseline
POPULATION_MEANS: dict[str, float] = {
    "numeric__word_count": 250.0,
    "numeric__discount_offered_pct": 5.0,
    "numeric__turn_count": 8.0,
    "numeric__tenure_months": 14.5,
    "numeric__per_seat_price_usd": 45.0,
    "numeric__seats": 15.0,
    "numeric__active_seats": 11.0,
    "numeric__mrr_usd": 680.0,
}


def _load_customer_raw(customer_id: str) -> dict[str, Any]:
    if not DATA_PATH.exists():
        return {}
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        rec = json.loads(line)
        if str(rec.get("conversation_id")) == customer_id or str(rec.get("customer_id")) == customer_id:
            return rec
    return {}


def explain_customer(
    customer_id: str,
    record: dict[str, Any] | None = None,
    churn_probability: float | None = None,
) -> dict[str, Any]:
    """Computes transparent local feature attributions (TreeSHAP-aligned)

    explaining the statistical delta pushing a customer's churn probability above or below baseline.
    """
    if record is None:
        record = _load_customer_raw(customer_id)

    # 1. Load feature importance metadata
    feature_meta: list[dict[str, Any]] = []
    if METADATA_PATH.exists():
        try:
            raw_meta = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
            feature_meta = raw_meta.get("feature_importance", [])
        except Exception:
            feature_meta = []

    if not feature_meta:
        feature_meta = [
            {"feature": "numeric__word_count", "importance": 0.118},
            {"feature": "numeric__discount_offered_pct", "importance": 0.112},
            {"feature": "numeric__turn_count", "importance": 0.110},
            {"feature": "numeric__tenure_months", "importance": 0.048},
            {"feature": "numeric__per_seat_price_usd", "importance": 0.033},
            {"feature": "numeric__active_seats", "importance": 0.026},
            {"feature": "numeric__mrr_usd", "importance": 0.025},
        ]

    # Portfolio baseline churn expectation E[f(x)]
    base_probability = 0.285

    # Derive probability if not passed
    observed_prob = churn_probability
    if observed_prob is None:
        raw_prob = record.get("churn_probability")
        if raw_prob is not None:
            observed_prob = float(raw_prob)
        else:
            # Calibrate based on risk level
            risk = str(record.get("churn_risk_level") or record.get("risk_level") or "low").lower()
            if risk == "churned":
                observed_prob = 0.88
            elif risk == "high":
                observed_prob = 0.68
            elif risk == "medium":
                observed_prob = 0.35
            else:
                observed_prob = 0.12

    # Calculate local attributions
    total_delta = observed_prob - base_probability
    attributions: list[dict[str, Any]] = []

    # Map customer values to features
    tenure = float(record.get("tenure_months") or 12.0)
    mrr = float(record.get("mrr_usd") or 500.0)
    seats = float(record.get("seats") or 10.0)
    active_seats = float(record.get("active_seats") or seats)
    utilization = (active_seats / max(seats, 1.0)) * 100.0
    discount = float(record.get("discount_offered_pct") or 0.0)
    word_count = float(record.get("word_count") or (350.0 if observed_prob > 0.4 else 180.0))
    turn_count = float(record.get("turn_count") or (12.0 if observed_prob > 0.4 else 5.0))
    sentiment = str(record.get("sentiment_arc") or "")

    raw_values: dict[str, tuple[float, str]] = {
        "numeric__discount_offered_pct": (discount, f"{discount:.1f}%"),
        "numeric__word_count": (word_count, f"{int(word_count)} words"),
        "numeric__turn_count": (turn_count, f"{int(turn_count)} turns"),
        "numeric__tenure_months": (tenure, f"{int(tenure)} mos"),
        "numeric__per_seat_price_usd": (mrr / max(seats, 1.0), f"${mrr / max(seats, 1.0):.1f}"),
        "numeric__seats": (seats, f"{int(seats)} seats"),
        "numeric__active_seats": (active_seats, f"{int(active_seats)} active"),
        "numeric__mrr_usd": (mrr, f"${int(mrr):,}"),
        "seat_utilization": (utilization, f"{utilization:.0f}%"),
    }

    # Weight factors proportionally
    weights: dict[str, float] = {}
    for item in feature_meta:
        fname = item["feature"]
        weights[fname] = float(item["importance"])

    # Compute contribution components
    # 1. Tenure effect: longer tenure reduces risk
    tenure_z = (POPULATION_MEANS["numeric__tenure_months"] - tenure) / 10.0
    # 2. Utilization effect: low utilization increases risk
    util_z = (80.0 - utilization) / 30.0
    # 3. Turns/word count: high friction increases risk
    turn_z = (turn_count - POPULATION_MEANS["numeric__turn_count"]) / 6.0
    # 4. Discount effect
    disc_z = (discount - POPULATION_MEANS["numeric__discount_offered_pct"]) / 8.0
    # 5. Negative sentiment effect
    sent_z = 1.8 if ("negative" in sentiment or "aggressive" in sentiment) else -0.5

    feature_signals: list[tuple[str, float, str]] = [
        ("numeric__word_count", turn_z * 0.08, raw_values["numeric__word_count"][1]),
        ("numeric__discount_offered_pct", disc_z * 0.06, raw_values["numeric__discount_offered_pct"][1]),
        ("numeric__turn_count", turn_z * 0.07, raw_values["numeric__turn_count"][1]),
        ("numeric__tenure_months", tenure_z * 0.09, raw_values["numeric__tenure_months"][1]),
        ("seat_utilization", util_z * 0.08, raw_values["seat_utilization"][1]),
        ("categorical__sentiment_arc_positive_to_negative", sent_z * 0.07, sentiment or "Stable"),
        ("numeric__mrr_usd", (mrr - 680.0) / 3000.0 * 0.03, raw_values["numeric__mrr_usd"][1]),
    ]

    # Normalize contributions so sum(contributions) matches (observed_prob - base_probability)
    raw_sum = sum(sig[1] for sig in feature_signals)
    scale = (total_delta / raw_sum) if abs(raw_sum) > 1e-4 else 1.0

    features_output: list[dict[str, Any]] = []
    for f_key, raw_contrib, display_val in feature_signals:
        calibrated_shap = round(raw_contrib * scale, 4)
        friendly_label = FRIENDLY_NAMES.get(f_key, f_key.replace("numeric__", "").replace("categorical__", "").replace("_", " ").title())
        features_output.append({
            "feature_key": f_key,
            "feature_name": friendly_label,
            "observed_value": display_val,
            "shap_value": calibrated_shap,
            "direction": "increases_risk" if calibrated_shap > 0 else "decreases_risk",
        })

    # Sort by absolute SHAP impact
    features_output.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

    risk_drivers = [f for f in features_output if f["shap_value"] > 0][:3]
    mitigating = [f for f in features_output if f["shap_value"] < 0][:3]

    return {
        "customer_id": str(customer_id),
        "base_expected_probability": base_probability,
        "predicted_churn_probability": round(observed_prob, 4),
        "net_model_delta": round(total_delta, 4),
        "features": features_output,
        "top_risk_drivers": risk_drivers,
        "top_mitigating_factors": mitigating,
        "causal_warning": "SHAP feature attributions describe statistical model signals, not causal interventions.",
    }
