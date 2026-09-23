from __future__ import annotations

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_explain_customer_returns_valid_shap() -> None:
    response = client.get("/api/customers/CCC-06123/shap")
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CCC-06123"
    assert "base_expected_probability" in data
    assert "predicted_churn_probability" in data
    assert 0.0 <= data["predicted_churn_probability"] <= 1.0
    assert len(data["features"]) >= 5
    for feat in data["features"]:
        assert "feature_name" in feat
        assert "shap_value" in feat
        assert feat["direction"] in {"increases_risk", "decreases_risk"}


def test_ai_copilot_generation_across_tones() -> None:
    # Test Empathetic tone
    resp1 = client.post(
        "/api/retention/generate-outreach",
        json={"customer_id": "CCC-06123", "tone": "empathetic"},
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert "subject_line" in data1
    assert "email_body" in data1
    assert "executive_escalation_memo" in data1
    assert "recommended_concession" in data1
    assert "CCC-06123" in data1["email_body"]

    # Test Urgent tone
    resp2 = client.post(
        "/api/retention/generate-outreach",
        json={"customer_id": "CCC-06123", "tone": "urgent"},
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "URGENT" in data2["subject_line"] or "Escalation" in data2["subject_line"]


def test_what_if_simulation_mathematical_consistency() -> None:
    response = client.post(
        "/api/analytics/simulate",
        json={
            "discount_pct": 15.0,
            "support_sla_reduction_pct": 25.0,
            "feature_adoption_boost": 20.0,
            "target_tier": "high_risk",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "simulated" in data
    assert "impact" in data

    impact = data["impact"]
    assert impact["saved_accounts_count"] >= 0
    assert impact["gross_mrr_preserved_usd"] >= 0

    # Verify arithmetic: Net MRR = Gross Preserved - Concession Cost
    expected_net = round(impact["gross_mrr_preserved_usd"] - impact["campaign_discount_cost_usd"], 2)
    assert abs(impact["net_monthly_mrr_benefit_usd"] - expected_net) < 0.05


def test_uplift_segmentation_covers_all_accounts() -> None:
    response = client.get("/api/analytics/uplift")
    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed_customers"] == 500

    quadrants = data["quadrants"]
    assert "persuadables" in quadrants
    assert "sure_things" in quadrants
    assert "lost_causes" in quadrants
    assert "sleeping_dogs" in quadrants

    total_quadrant_count = sum(q["count"] for q in quadrants.values())
    assert total_quadrant_count == 500


def test_webhook_alert_dispatch() -> None:
    response = client.post(
        "/api/webhooks/alert",
        json={"customer_id": "CCC-06123", "channel": "slack"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "CCC-06123"
    assert data["delivery_status"] in {"simulated_success", "delivered"}
    assert "payload" in data


def test_action_audit_log_flow() -> None:
    # 1. Record an action
    log_resp = client.post(
        "/api/retention/log-action",
        json={
            "customer_id": "CCC-06123",
            "action_type": "email_sent",
            "channel": "email",
            "tone": "executive",
            "notes": "Spoke with VP of Operations. Agreed to 15% annual extension.",
            "performed_by": "CS Director",
        },
    )
    assert log_resp.status_code == 200
    assert log_resp.json()["status"] == "recorded"

    # 2. Retrieve history for that customer
    hist_resp = client.get("/api/retention/history/CCC-06123")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert history["total_actions"] >= 1
    latest = history["actions"][0]
    assert latest["customer_id"] == "CCC-06123"
    assert "VP of Operations" in latest["notes"]
