-- Latest prediction and current subscription value per customer.
WITH latest_predictions AS (
    SELECT DISTINCT ON (customer_id)
        customer_id,
        churn_probability,
        risk_level,
        revenue_at_risk_usd,
        predicted_at
    FROM predictions
    ORDER BY customer_id, predicted_at DESC
), current_mrr AS (
    SELECT customer_id, SUM(mrr_usd) AS mrr_usd
    FROM subscriptions
    WHERE ended_at IS NULL
    GROUP BY customer_id
)
SELECT
    c.external_customer_id,
    cm.mrr_usd,
    lp.churn_probability,
    lp.risk_level,
    lp.revenue_at_risk_usd,
    lp.predicted_at
FROM customers c
LEFT JOIN current_mrr cm ON cm.customer_id = c.customer_id
LEFT JOIN latest_predictions lp ON lp.customer_id = c.customer_id;

-- Monthly revenue with a month-over-month comparison.
WITH monthly_revenue AS (
    SELECT date_trunc('month', transaction_at)::date AS month, SUM(amount_usd) AS revenue_usd
    FROM transactions
    GROUP BY 1
)
SELECT
    month,
    revenue_usd,
    LAG(revenue_usd) OVER (ORDER BY month) AS previous_month_revenue_usd,
    revenue_usd - LAG(revenue_usd) OVER (ORDER BY month) AS change_usd
FROM monthly_revenue
ORDER BY month;