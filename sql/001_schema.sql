CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_customer_id TEXT UNIQUE NOT NULL,
    customer_persona TEXT,
    company_size TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    plan_name TEXT,
    plan_type TEXT,
    seats INTEGER CHECK (seats IS NULL OR seats >= 0),
    active_seats INTEGER CHECK (active_seats IS NULL OR active_seats >= 0),
    mrr_usd NUMERIC(12, 2) CHECK (mrr_usd IS NULL OR mrr_usd >= 0),
    started_at DATE,
    ended_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subscription_source UNIQUE (customer_id, plan_name, plan_type, mrr_usd)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    amount_usd NUMERIC(12, 2) NOT NULL CHECK (amount_usd >= 0),
    transaction_type TEXT,
    transaction_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    category TEXT,
    status TEXT,
    priority TEXT,
    opened_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS customer_activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_at TIMESTAMPTZ NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS segments (
    segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    recency_score NUMERIC(10, 4),
    frequency_score NUMERIC(10, 4),
    monetary_score NUMERIC(10, 4),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    model_version TEXT,
    churn_probability NUMERIC(8, 6) CHECK (churn_probability IS NULL OR churn_probability BETWEEN 0 AND 1),
    risk_level TEXT,
    revenue_at_risk_usd NUMERIC(12, 2) CHECK (revenue_at_risk_usd IS NULL OR revenue_at_risk_usd >= 0),
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES predictions(prediction_id) ON DELETE SET NULL,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    risk_level TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'contacted', 'resolved', 'dismissed')),
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_time ON transactions(customer_id, transaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_status ON support_tickets(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_customer_time ON customer_activity(customer_id, activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_customer_time ON predictions(customer_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_segments_customer_name ON segments(customer_id, segment_name);
CREATE INDEX IF NOT EXISTS idx_retention_actions_status_priority ON retention_actions(status, priority);
CREATE INDEX IF NOT EXISTS idx_retention_actions_customer ON retention_actions(customer_id, created_at DESC);