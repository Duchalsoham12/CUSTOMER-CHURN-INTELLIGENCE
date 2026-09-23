from __future__ import annotations

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_suggestions() -> None:
    response = client.get("/api/assistant/suggestions")
    assert response.status_code == 200
    suggestions = response.json()
    assert len(suggestions) >= 5
    for s in suggestions:
        assert "id" in s
        assert "label" in s
        assert "question" in s


def test_query_top_enterprise_risk() -> None:
    response = client.post(
        "/api/assistant/query",
        json={"question": "Show me the top 5 enterprise accounts with highest churn risk and MRR"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sql_query" in data
    assert "SELECT" in data["sql_query"]
    assert "table_data" in data
    assert len(data["table_data"]) == 5
    assert "chart_data" in data
    assert len(data["chart_data"]) == 5
    assert len(data["suggested_followups"]) >= 2


def test_query_plan_breakdown() -> None:
    response = client.post(
        "/api/assistant/query",
        json={"question": "What is our churn rate across different subscription plans?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "plan_name" in data["table_data"][0]
    assert "churn_rate_pct" in data["table_data"][0]
    assert data["chart_type"] == "bar"


def test_query_support_friction() -> None:
    response = client.post(
        "/api/assistant/query",
        json={"question": "Which customers have the highest word count and turn count in support tickets?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "word_count" in data["table_data"][0]
    assert "turn_count" in data["table_data"][0]
    assert "Support Turns" in data["chart_value_label"]


def test_query_tenure_comparison() -> None:
    response = client.post(
        "/api/assistant/query",
        json={"question": "Compare the average tenure of customers who churned versus active"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["table_data"]) == 2
    assert "avg_tenure_months" in data["table_data"][0]


def test_general_portfolio_query() -> None:
    response = client.post(
        "/api/assistant/query",
        json={"question": "Summarize our total portfolio revenue at risk"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "Total Portfolio Accounts" in data["answer"] or "Total Tracked Accounts" in data["answer"]
    assert len(data["table_data"]) >= 4
