from sqlalchemy import text

from app.core.database import SessionLocal
from app.data.pipeline import run_pipeline


def persist_segments() -> int:
    rows = run_pipeline()["rows"]
    monetary_values = sorted(float(row.get("customer_value_proxy_usd") or 0) for row in rows)

    def score(value: float) -> float:
        if not monetary_values:
            return 0
        rank = sum(item <= value for item in monetary_values) / len(monetary_values)
        return round(max(1, min(5, int(rank * 5) + 1)), 4)

    with SessionLocal() as session:
        session.execute(text("DELETE FROM segments"))
        count = 0
        for row in rows:
            segment = "At Risk" if row.get("churn_risk_level") in {"high", "churned"} else "Champions" if (row.get("customer_value_proxy_usd") or 0) >= 10000 and (row.get("engagement_score_proxy") or 0) >= 50 else "Loyal Customers" if (row.get("engagement_score_proxy") or 0) >= 50 else "Potential Loyalists"
            session.execute(text("""INSERT INTO segments (customer_id, segment_name, recency_score, frequency_score, monetary_score)
                SELECT customer_id, :segment, NULL, :frequency, :monetary FROM customers WHERE external_customer_id = :external_id"""), {"segment": segment, "frequency": min(5, max(1, round((row.get("engagement_score_proxy") or 0) / 20, 4))), "monetary": score(float(row.get("customer_value_proxy_usd") or 0)), "external_id": row.get("conversation_id")})
            count += 1
        session.commit()
    return count


if __name__ == "__main__":
    print(f"Persisted {persist_segments()} analytical segments.")