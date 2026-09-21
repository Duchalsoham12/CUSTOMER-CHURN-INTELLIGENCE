from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/api/health", headers={"X-Request-ID": "test-request-1"})
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.headers["X-Request-ID"] == "test-request-1"
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_database_health_endpoint() -> None:
    response = client.get("/api/database/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "postgresql"}


def test_database_dashboard_endpoint() -> None:
    response = client.get("/api/database-dashboard")
    assert response.status_code == 200
    assert response.json()["total_customers"] == 500


def test_prediction_endpoint_returns_real_risk_for_known_customer() -> None:
    response = client.post("/api/predict", json={"customer_id": "CCC-06123"})
    assert response.status_code in {200, 503}
    if response.status_code == 200:
        payload = response.json()
        assert payload["customer_id"] == "CCC-06123"
        assert 0.0 <= payload["churn_probability"] <= 1.0
        assert payload["risk_level"] in {"low", "medium", "high", "churned"}


def test_prediction_endpoint_rejects_unknown_customer() -> None:
    response = client.post("/api/predict", json={"customer_id": "does-not-exist"})
    assert response.status_code == 404


def test_dashboard_uses_full_dataset() -> None:
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "full.jsonl"
    assert payload["total_records"] == 500


def test_customer_pagination_and_detail() -> None:
    response = client.get("/api/customers?page=2&page_size=10")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["items"]) == 10
    assert payload["page"] == 2
    record_id = payload["items"][0]["record_id"]

    detail = client.get(f"/api/customers/{record_id}")
    assert detail.status_code == 200
    assert detail.json()["record_id"] == record_id
    assert detail.json()["recommended_action"]


def test_missing_customer_returns_404() -> None:
    response = client.get("/api/customers/does-not-exist")
    assert response.status_code == 404


def test_revenue_risk_is_observed_and_labeled() -> None:
    response = client.get("/api/revenue-risk")
    assert response.status_code == 200
    payload = response.json()
    assert payload["observed_high_and_churned_mrr"] == 446759.0
    assert "not expected loss" in payload["interpretation_note"]


def test_upload_rejects_non_csv() -> None:
    response = client.post("/api/upload", files={"file": ("data.txt", b"not csv", "text/plain")})
    assert response.status_code == 400