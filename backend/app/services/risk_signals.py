from typing import Any


def build_business_signals(record: dict[str, Any]) -> list[dict[str, str]]:
    signals: list[dict[str, str]] = []
    seats = record.get("seats")
    active_seats = record.get("active_seats")
    if seats not in (None, 0) and active_seats is not None:
        utilization = float(active_seats) / float(seats)
        if utilization < 0.35:
            signals.append({"signal": "LOW_ENGAGEMENT", "severity": "high", "description": "Active seat utilization is below 35%."})
    churn_signals = record.get("churn_signals") or []
    if isinstance(churn_signals, str):
        churn_signals = [churn_signals]
    if any("support" in str(signal) for signal in churn_signals):
        signals.append({"signal": "SUPPORT_FRICTION", "severity": "medium", "description": "The source record includes support-frustration signals."})
    if any("pricing" in str(signal) or "billing" in str(signal) for signal in churn_signals):
        signals.append({"signal": "COMMERCIAL_FRICTION", "severity": "medium", "description": "The source record includes pricing or billing signals."})
    if int(record.get("tenure_months") or 0) <= 3:
        signals.append({"signal": "SHORT_TENURE", "severity": "low", "description": "Customer tenure is three months or less."})
    return signals
