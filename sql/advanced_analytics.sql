WITH latest_prediction AS (
    SELECT DISTINCT ON (customer_id) customer_id, risk_level, revenue_at_risk_usd
    FROM predictions ORDER BY customer_id, predicted_at DESC
), ranked AS (
    SELECT c.external_customer_id, s.mrr_usd, lp.risk_level,
           RANK() OVER (ORDER BY s.mrr_usd DESC NULLS LAST) AS value_rank
    FROM customers c
    LEFT JOIN subscriptions s ON s.customer_id = c.customer_id
    LEFT JOIN latest_prediction lp ON lp.customer_id = c.customer_id
)
SELECT * FROM ranked WHERE risk_level IN ('high', 'churned') ORDER BY value_rank;