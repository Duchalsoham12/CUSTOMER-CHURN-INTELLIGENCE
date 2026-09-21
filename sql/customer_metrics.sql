WITH subscription_totals AS (
    SELECT customer_id, SUM(mrr_usd) AS mrr_usd
    FROM subscriptions
    WHERE ended_at IS NULL
    GROUP BY customer_id
)
SELECT c.external_customer_id, c.company_size, s.mrr_usd,
       RANK() OVER (ORDER BY s.mrr_usd DESC NULLS LAST) AS revenue_rank
FROM customers c
LEFT JOIN subscription_totals s ON s.customer_id = c.customer_id
ORDER BY revenue_rank;