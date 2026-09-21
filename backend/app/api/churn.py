from collections import Counter, defaultdict
from ast import literal_eval
from typing import Any

from fastapi import APIRouter

from app.services.dashboard import load_records

router = APIRouter(tags=["analytics"])


@router.get("/churn")
def churn_summary() -> dict[str, Any]:
    records = load_records()
    outcome_by_risk: dict[str, Counter[str]] = defaultdict(Counter)
    signal_counts: Counter[str] = Counter()

    for record in records:
        risk = str(record.get("churn_risk_level", "unknown"))
        outcome = str(record.get("resolution_outcome", "unknown"))
        outcome_by_risk[risk][outcome] += 1
        signals = record.get("churn_signals") or ""
        if isinstance(signals, str) and signals.startswith("["):
            try:
                signals = literal_eval(signals)
            except (ValueError, SyntaxError):
                signals = [signals]
        if isinstance(signals, str):
            signals = signals.split(",")
        for signal in signals:
            cleaned_signal = str(signal).strip(" []\'\"")
            if cleaned_signal:
                signal_counts[cleaned_signal] += 1

    return {
        "source": "observed dataset labels",
        "risk_outcomes": {risk: dict(outcomes) for risk, outcomes in outcome_by_risk.items()},
        "top_signals": [{"signal": signal, "records": count} for signal, count in signal_counts.most_common(8)],
        "interpretation_note": "These are observed source labels and signals, not causal findings or model probabilities.",
    }