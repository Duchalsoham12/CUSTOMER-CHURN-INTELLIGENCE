from collections import defaultdict
from typing import Any

from fastapi import APIRouter

from app.services.dashboard import load_records

router = APIRouter(tags=["analytics"])


@router.get("/revenue-risk")
def revenue_risk_summary() -> dict[str, Any]:
    totals: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)
    for record in load_records():
        risk = str(record.get("churn_risk_level", "unknown"))
        totals[risk] += float(record.get("mrr_usd") or 0)
        counts[risk] += 1

    observed_exposure = totals.get("high", 0) + totals.get("churned", 0)
    return {
        "source": "observed dataset labels",
        "currency": "USD MRR",
        "observed_high_and_churned_mrr": round(observed_exposure, 2),
        "by_risk_level": [
            {"risk_level": risk, "records": counts.get(risk, 0), "mrr_usd": round(totals.get(risk, 0), 2)}
            for risk in ("low", "medium", "high", "churned")
        ],
        "interpretation_note": "This is observed MRR grouped by source risk labels, not expected loss from calibrated churn probabilities.",
    }