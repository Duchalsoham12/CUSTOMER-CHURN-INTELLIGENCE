from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "raw" / "full.jsonl"


def run_scenario_simulation(
    discount_pct: float = 10.0,
    support_sla_reduction_pct: float = 20.0,
    feature_adoption_boost: float = 15.0,
    target_tier: str = "high_risk",
) -> dict[str, Any]:
    """Vectorized simulation engine calculating portfolio impact and ROI

    of applying customer success & pricing policy levers.
    """
    if not DATA_PATH.exists():
        return {"error": "Dataset unavailable"}

    records = [json.loads(line) for line in DATA_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]

    # Bounds checking
    discount_pct = max(0.0, min(discount_pct, 40.0))
    support_sla_reduction_pct = max(0.0, min(support_sla_reduction_pct, 60.0))
    feature_adoption_boost = max(0.0, min(feature_adoption_boost, 50.0))

    baseline_at_risk = 0
    baseline_exposed_mrr = 0.0
    simulated_at_risk = 0
    simulated_exposed_mrr = 0.0
    target_customer_mrr = 0.0
    saved_accounts = 0

    # Sensitivity elasticities grounded in feature importance
    disc_reduction_factor = (discount_pct / 100.0) * 0.45
    sla_reduction_factor = (support_sla_reduction_pct / 100.0) * 0.35
    adopt_reduction_factor = (feature_adoption_boost / 100.0) * 0.40

    # Combined diminishing returns multiplier
    total_risk_multiplier = max(0.2, (1.0 - disc_reduction_factor) * (1.0 - sla_reduction_factor) * (1.0 - adopt_reduction_factor))

    for rec in records:
        mrr = float(rec.get("mrr_usd") or 0.0)
        risk = str(rec.get("churn_risk_level") or "low").lower()

        # Baseline probability
        base_p = 0.85 if risk == "churned" else 0.65 if risk == "high" else 0.30 if risk == "medium" else 0.10

        is_target = False
        if target_tier == "all":
            is_target = True
        elif target_tier == "high_risk" and risk in {"high", "churned"}:
            is_target = True
        elif target_tier == "medium_and_high" and risk in {"medium", "high", "churned"}:
            is_target = True
        elif target_tier == "enterprise" and mrr >= 800:
            is_target = True

        baseline_exposed_mrr += (mrr * base_p)
        if base_p >= 0.4:
            baseline_at_risk += 1

        if is_target:
            target_customer_mrr += mrr
            sim_p = base_p * total_risk_multiplier
        else:
            sim_p = base_p

        simulated_exposed_mrr += (mrr * sim_p)
        if sim_p >= 0.4:
            simulated_at_risk += 1

    total_records = len(records)
    total_portfolio_mrr = sum(float(r.get("mrr_usd") or 0.0) for r in records)

    gross_mrr_preserved = max(0.0, baseline_exposed_mrr - simulated_exposed_mrr)
    saved_accounts = max(0, baseline_at_risk - simulated_at_risk)
    if saved_accounts == 0 and gross_mrr_preserved > 0:
        # Expected statistical accounts saved across distribution
        saved_accounts = max(1, int(round((gross_mrr_preserved / max(target_customer_mrr, 1.0)) * baseline_at_risk)))

    baseline_churn_rate = (baseline_at_risk / max(total_records, 1)) * 100.0
    simulated_churn_rate = max(0.0, round(baseline_churn_rate - (saved_accounts / max(total_records, 1)) * 100.0, 2))
    # Concession cost is applied to targeted accounts receiving the discount
    discount_campaign_cost = (discount_pct / 100.0) * target_customer_mrr
    net_mrr_benefit = gross_mrr_preserved - discount_campaign_cost
    annualized_benefit = net_mrr_benefit * 12.0

    roi_pct = (net_mrr_benefit / max(discount_campaign_cost, 1.0)) * 100.0 if discount_campaign_cost > 0 else 0.0

    return {
        "scenario_parameters": {
            "discount_offered_pct": discount_pct,
            "support_sla_reduction_pct": support_sla_reduction_pct,
            "feature_adoption_boost_pct": feature_adoption_boost,
            "target_tier": target_tier,
        },
        "baseline": {
            "at_risk_accounts": baseline_at_risk,
            "churn_rate_pct": round(baseline_churn_rate, 2),
            "exposed_mrr_usd": round(baseline_exposed_mrr, 2),
        },
        "simulated": {
            "at_risk_accounts": simulated_at_risk,
            "churn_rate_pct": round(simulated_churn_rate, 2),
            "exposed_mrr_usd": round(simulated_exposed_mrr, 2),
        },
        "impact": {
            "saved_accounts_count": saved_accounts,
            "churn_rate_reduction_points": round(baseline_churn_rate - simulated_churn_rate, 2),
            "gross_mrr_preserved_usd": round(gross_mrr_preserved, 2),
            "campaign_discount_cost_usd": round(discount_campaign_cost, 2),
            "net_monthly_mrr_benefit_usd": round(net_mrr_benefit, 2),
            "annualized_net_benefit_usd": round(annualized_benefit, 2),
            "campaign_roi_pct": round(roi_pct, 1),
        },
        "recommendation": (
            "Highly Favorable Campaign: Preserves positive net MRR with strong ROI."
            if net_mrr_benefit > 0
            else "Caution: The concession cost exceeds the preserved MRR. Reduce discount percentage."
        ),
    }
