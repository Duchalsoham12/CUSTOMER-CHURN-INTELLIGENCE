from app.services.recommendations import recommendation_for
from app.services.retention import retention_priority
from app.services.risk_signals import build_business_signals


def test_priority_distinguishes_risk_from_value() -> None:
    critical = retention_priority(0.9, 20000, 15000, 20)
    medium_risk_high_value = retention_priority(0.5, 20000, 10000, 60)
    assert critical.priority == "critical"
    assert medium_risk_high_value.priority in {"high", "critical"}
    assert critical.score > 0


def test_risk_signals_only_use_available_fields() -> None:
    signals = build_business_signals({"seats": 10, "active_seats": 2, "tenure_months": 2, "churn_signals": ["support_frustration"]})
    names = {signal["signal"] for signal in signals}
    assert {"LOW_ENGAGEMENT", "SUPPORT_FRICTION", "SHORT_TENURE"}.issubset(names)


def test_recommendations_are_transparent() -> None:
    result = recommendation_for([{"signal": "LOW_ENGAGEMENT", "severity": "high", "description": "low"}], "high")
    assert "engagement" in result["recommended_action"].lower()
    assert "guaranteed" in result["note"]
