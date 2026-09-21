# Data Dictionary

## PostgreSQL Relational Schema

### Table: `customers`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `customer_id` | UUID | No | Primary key, automatically generated (`gen_random_uuid()`) |
| `external_customer_id` | TEXT | No | Source customer identifier (e.g., `CCC-06123`) |
| `customer_persona` | TEXT | Yes | Persona segment classification |
| `company_size` | TEXT | Yes | Categorical company size |
| `created_at` | TIMESTAMPTZ | No | Timestamp record inserted |

### Table: `subscriptions`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `subscription_id` | UUID | No | Primary key |
| `customer_id` | UUID | No | Foreign key referencing `customers(customer_id)` |
| `plan_name` | TEXT | Yes | Plan name (e.g., Starter, Growth, Enterprise) |
| `plan_type` | TEXT | Yes | Billing duration category (annual or monthly) |
| `seats` | INTEGER | Yes | Total contracted seat count |
| `active_seats` | INTEGER | Yes | Active user seats utilized |
| `mrr_usd` | NUMERIC(12,2) | Yes | Monthly recurring revenue in USD |
| `started_at` | DATE | Yes | Subscription start date (nullable) |
| `ended_at` | DATE | Yes | Subscription cancellation date (nullable) |
| `created_at` | TIMESTAMPTZ | No | Timestamp of subscription insertion |

### Table: `predictions`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `prediction_id` | UUID | No | Primary key |
| `customer_id` | UUID | No | Foreign key referencing `customers(customer_id)` |
| `model_name` | TEXT | No | Model architecture identifier (e.g., `RandomForestClassifier`) |
| `model_version` | TEXT | Yes | Version string of the model artifact |
| `churn_probability` | NUMERIC(8,6) | Yes | Calibrated model output probability [0, 1] |
| `risk_level` | TEXT | Yes | Risk band: `low`, `medium`, `high`, or `churned` |
| `revenue_at_risk_usd`| NUMERIC(12,2) | Yes | Risk-weighted revenue exposure |
| `predicted_at` | TIMESTAMPTZ | No | Timestamp prediction was calculated |

### Table: `segments`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `segment_id` | UUID | No | Primary key |
| `customer_id` | UUID | No | Foreign key referencing `customers(customer_id)` |
| `segment_name` | TEXT | No | RFM proxy cluster name (e.g., `Champions`, `At Risk`) |
| `recency_score` | NUMERIC(10,4) | Yes | Proxy recency score |
| `frequency_score` | NUMERIC(10,4) | Yes | Proxy frequency score based on seat utilization |
| `monetary_score` | NUMERIC(10,4) | Yes | Quantile-based monetary proxy score (1–5) |
| `assigned_at` | TIMESTAMPTZ | No | Assignment timestamp |

### Table: `retention_actions`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `action_id` | UUID | No | Primary key |
| `customer_id` | UUID | No | Foreign key referencing `customers(customer_id)` |
| `prediction_id` | UUID | Yes | Optional foreign key referencing `predictions(prediction_id)` |
| `priority` | TEXT | No | Prioritization level: `critical`, `high`, `medium`, `low` |
| `risk_level` | TEXT | No | Model risk tier |
| `recommended_action` | TEXT | No | Prescriptive next-best action for customer success |
| `status` | TEXT | No | Workflow state: `new`, `reviewed`, `in_progress`, `contacted`, `resolved`, `dismissed` |
| `assigned_to` | TEXT | Yes | Assignee user identifier or email |
| `notes` | TEXT | Yes | Freeform notes |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | Last update timestamp |
| `reviewed_at` | TIMESTAMPTZ | Yes | Review timestamp |
| `resolved_at` | TIMESTAMPTZ | Yes | Resolution timestamp |

---

## Analytical SQL Views

| View Name | Source Tables | Purpose |
|---|---|---|
| `vw_customer_analytics` | `customers`, `subscriptions`, `segments` | Integrated customer 360 view with engagement proxy |
| `vw_revenue_risk` | `customers`, `predictions` | Revenue exposure joined with model prediction probabilities |
| `vw_retention_actions` | `retention_actions`, `customers` | Operational queue of intervention items |
| `vw_rfm_segments` | `segments` | Aggregated segment metrics and average monetary scores |
| `vw_model_predictions` | `customers`, `predictions` | Historical prediction outputs |
| `vw_monthly_customer_metrics`| Static view | Returns explicit `status: 'unavailable'` note |
| `vw_cohort_retention` | Static view | Returns explicit `status: 'unavailable'` note |

---

## Dataset Boundaries & Missing Entities

The source dataset (`full.jsonl`) contains 500 records. Key constraints:
1. **No Timestamped Events**: No signup dates, login events, ticket creation dates, or cancellation dates.
2. **No Historical Transactions**: Only single snapshot MRR is available per account.
3. **Empty Tables in Raw Ingestion**: Tables `transactions`, `support_tickets`, and `customer_activity` are fully supported by database schema and migrations, but cannot be populated from the raw source without synthetic data fabrication.
