from app.data.cleaning import clean_records
from app.data.features import engineer_features
from app.data.pipeline import run_pipeline
from app.data.validation import validate_records


def test_real_pipeline_reports_actual_quality() -> None:
    result = run_pipeline()
    assert result["quality"]["rows"] == 500
    assert result["quality"]["missing_values"] == 396
    assert result["quality"]["quality_status"] == "warning"


def test_validation_detects_invalid_values() -> None:
    report = validate_records([{"conversation_id": "bad", "churn_risk_level": "unknown", "tenure_months": 1, "mrr_usd": -1, "plan_type": "weekly"}])
    assert report["invalid_values"] == 4


def test_cleaning_retains_outliers_and_deduplicates_ids() -> None:
    records = [{"conversation_id": "CCC-1", "mrr_usd": 9999999, "tenure_months": "4"}, {"conversation_id": "CCC-1", "mrr_usd": 10, "tenure_months": "1"}]
    cleaned, report = clean_records(records)
    assert len(cleaned) == 1 and cleaned[0]["mrr_usd"] == 9999999
    assert report["duplicates_removed"] == 1 and report["outliers_deleted"] == 0


def test_feature_engineering_is_deterministic() -> None:
    result = engineer_features([{"seats": 10, "active_seats": 5, "mrr_usd": 100, "tenure_months": 3}])[0]
    assert result["seat_utilization"] == 0.5
    assert result["customer_value_proxy_usd"] == 300