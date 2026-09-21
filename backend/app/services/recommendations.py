from typing import Any


def recommendation_for(signals: list[dict[str, str]], priority: str) -> dict[str, Any]:
    names = {signal["signal"] for signal in signals}
    if "LOW_ENGAGEMENT" in names:
        action = "Run a personalized engagement and adoption review."
    elif "SUPPORT_FRICTION" in names:
        action = "Schedule a customer-success support follow-up."
    elif "COMMERCIAL_FRICTION" in names:
        action = "Offer a transparent subscription and value review."
    elif priority in {"critical", "high"}:
        action = "Prioritize human review by the customer-success team."
    else:
        action = "Continue monitoring and regular customer engagement."
    return {"recommended_action": action, "priority": priority, "supporting_signals": signals, "note": "Suggestion based on documented rules; no retention outcome is guaranteed."}
