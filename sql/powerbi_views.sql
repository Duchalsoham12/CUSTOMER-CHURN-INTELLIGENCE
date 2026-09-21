-- Power BI-ready analytical views. Event-date views are intentionally omitted because the source has no event dates.

CREATE OR REPLACE VIEW vw_customer_analytics AS
SELECT c.customer_id, c.external_customer_id, c.customer_persona, c.company_size,
       s.plan_name, s.plan_type, s.seats, s.active_seats, s.mrr_usd,
       CASE WHEN s.seats > 0 THEN ROUND((s.active_seats::numeric / s.seats) * 100, 2) END AS engagement_proxy,
       seg.segment_name, seg.monetary_score
FROM customers c
LEFT JOIN LATERAL (
  SELECT * FROM subscriptions sub WHERE sub.customer_id = c.customer_id ORDER BY sub.created_at DESC LIMIT 1
) s ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM segments sg WHERE sg.customer_id = c.customer_id ORDER BY sg.assigned_at DESC LIMIT 1
) seg ON TRUE;

CREATE OR REPLACE VIEW vw_revenue_risk AS
SELECT c.external_customer_id AS customer_id, p.model_version, p.risk_level,
       p.churn_probability, p.revenue_at_risk_usd, p.predicted_at
FROM customers c
JOIN predictions p ON p.customer_id = c.customer_id;

CREATE OR REPLACE VIEW vw_retention_actions AS
SELECT ra.action_id, c.external_customer_id AS customer_id, ra.priority, ra.risk_level,
       ra.recommended_action, ra.status, ra.assigned_to, ra.created_at, ra.updated_at
FROM retention_actions ra
JOIN customers c ON c.customer_id = ra.customer_id;

CREATE OR REPLACE VIEW vw_rfm_segments AS
SELECT segment_name, COUNT(*) AS customers,
       AVG(monetary_score) AS average_monetary_score
FROM segments
GROUP BY segment_name;

CREATE OR REPLACE VIEW vw_model_predictions AS
SELECT c.external_customer_id AS customer_id, p.model_version, p.model_name,
       p.churn_probability, p.risk_level, p.revenue_at_risk_usd, p.predicted_at
FROM customers c
JOIN predictions p ON p.customer_id = c.customer_id;

CREATE OR REPLACE VIEW vw_monthly_customer_metrics AS
SELECT 'unavailable'::text AS status,
       'Source dataset has no event dates or transaction history.'::text AS note;

CREATE OR REPLACE VIEW vw_cohort_retention AS
SELECT 'unavailable'::text AS status,
       'Source dataset has no signup or first-purchase dates.'::text AS note;
