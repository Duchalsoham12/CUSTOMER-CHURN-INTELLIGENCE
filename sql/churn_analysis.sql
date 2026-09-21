SELECT risk_level, COUNT(*) AS customers,
       SUM(revenue_at_risk_usd) AS revenue_at_risk_usd
FROM predictions
GROUP BY risk_level
ORDER BY revenue_at_risk_usd DESC NULLS LAST;