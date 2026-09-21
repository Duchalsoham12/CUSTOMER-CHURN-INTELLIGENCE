SELECT COALESCE(p.risk_level, 'unscored') AS risk_level,
       COUNT(*) AS customers,
       SUM(COALESCE(p.revenue_at_risk_usd, 0)) AS revenue_at_risk_usd
FROM customers c
LEFT JOIN predictions p ON p.customer_id = c.customer_id
GROUP BY p.risk_level
ORDER BY revenue_at_risk_usd DESC;