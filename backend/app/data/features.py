from typing import Any


def engineer_features(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    features = []
    for record in records:
        item = dict(record)
        seats = float(item.get("seats") or 0)
        active_seats = float(item.get("active_seats") or 0)
        item["seat_utilization"] = round(active_seats / seats, 4) if seats else None
        item["customer_value_proxy_usd"] = round(float(item.get("mrr_usd") or 0) * max(float(item.get("tenure_months") or 0), 1), 2)
        item["engagement_score_proxy"] = round(item["seat_utilization"] * 100, 2) if item["seat_utilization"] is not None else None
        features.append(item)
    return features