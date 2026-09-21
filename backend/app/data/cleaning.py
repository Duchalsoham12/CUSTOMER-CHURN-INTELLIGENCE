from typing import Any


def clean_records(records: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Clean only deterministic defects; unusual values are retained and reported."""
    seen: set[str] = set()
    cleaned: list[dict[str, Any]] = []
    duplicates_removed = 0
    for record in records:
        key = str(record.get("conversation_id", ""))
        if key in seen:
            duplicates_removed += 1
            continue
        seen.add(key)
        item = dict(record)
        if item.get("mrr_usd") is not None:
            item["mrr_usd"] = float(item["mrr_usd"])
        if item.get("tenure_months") is not None:
            item["tenure_months"] = int(item["tenure_months"])
        cleaned.append(item)
    return cleaned, {"duplicates_removed": duplicates_removed, "outliers_deleted": 0, "treatment": "deduplicate IDs and coerce numeric fields; retain outliers"}