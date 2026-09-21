WITH customer_value AS (
    SELECT c.external_customer_id, COALESCE(SUM(s.mrr_usd), 0) AS monetary_proxy,
           COALESCE(MAX(s.active_seats::numeric / NULLIF(s.seats, 0)), 0) AS engagement_proxy
    FROM customers c
    LEFT JOIN subscriptions s ON s.customer_id = c.customer_id
    GROUP BY c.external_customer_id
), scored AS (
    SELECT *, NTILE(5) OVER (ORDER BY monetary_proxy) AS monetary_score,
           NTILE(5) OVER (ORDER BY engagement_proxy) AS engagement_score
    FROM customer_value
)
SELECT *, CASE WHEN monetary_score >= 4 AND engagement_score >= 4 THEN 'Champions'
               WHEN engagement_score >= 4 THEN 'Loyal Customers'
               ELSE 'Potential Loyalists' END AS segment
FROM scored;