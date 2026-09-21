from dataclasses import dataclass


@dataclass(frozen=True)
class PriorityResult:
    score: float
    priority: str
    reasons: list[str]


def retention_priority(churn_probability: float, customer_value: float, revenue_at_risk: float, engagement_proxy: float | None = None) -> PriorityResult:
    """Score documented signals on a 0-100 scale; this is prioritization, not expected loss."""
    reasons: list[str] = []
    risk_component = max(0.0, min(40.0, churn_probability * 40))
    value_component = min(25.0, customer_value / 2000)
    revenue_component = min(25.0, revenue_at_risk / 1000)
    engagement_component = max(0.0, min(10.0, (100 - engagement_proxy) / 10)) if engagement_proxy is not None else 0.0
    score = round(risk_component + value_component + revenue_component + engagement_component, 2)
    if churn_probability >= 0.7 and revenue_at_risk >= 5000:
        priority = "critical"
    elif score >= 40:
        priority = "high"
    elif score >= 20:
        priority = "medium"
    else:
        priority = "low"
    if churn_probability >= 0.4:
        reasons.append("elevated model risk")
    if revenue_at_risk >= 5000:
        reasons.append("material revenue exposure")
    if engagement_proxy is not None and engagement_proxy < 35:
        reasons.append("low engagement proxy")
    return PriorityResult(score, priority, reasons)
