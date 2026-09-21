# KPI Definitions & Analytical Specifications

## Core Portfolio KPIs

| Metric | Definition | Formula | Source | Classification |
|---|---|---|---|---|
| Total Customers | Unique imported customer records | `COUNT(customers)` | `customers` / `/api/analytics/overview` | Actual |
| Active Customers | Customers not labeled churned in the source dataset | `total - churned` | Source analytics pipeline | Observed label |
| Churn Rate | Share of records labeled churned | `churned / total * 100` | `full.jsonl` | Observed label, not causal |
| Retention Rate | Complement of observed churn rate | `(total - churned) / total * 100` | `full.jsonl` | Observed label |
| Total Revenue | Sum of current imported MRR | `SUM(subscriptions.mrr_usd)` | `subscriptions` / `/api/analytics/overview` | Observed MRR |
| Average Customer Value | Average observed MRR per customer record | `total revenue / total customers` | `subscriptions` | Observed value proxy |
| Revenue at Risk | Analytical exposure metric summing MRR of high-risk and churned accounts | `SUM(mrr_usd WHERE risk IN ('high', 'churned'))` | `/api/analytics/revenue` | Analytical prioritization metric |
| High Risk Customers | Accounts with observed high-risk label | Count by risk level | `full.jsonl` / `predictions` | Observed label / Model predicted |
| High Priority Actions | Retention queue items requiring high/critical attention | Count by action priority | `retention_actions` | Operational queue |

---

## Retention Priority Calculation

Retention priority combines four distinct dimensions into a 0–100 prioritization score:
$$\text{Score} = \text{Risk Component} (0\text{–}40) + \text{Value Component} (0\text{–}25) + \text{Revenue Component} (0\text{–}25) + \text{Engagement Component} (0\text{–}10)$$

Where:
- **Risk Component**: $\min(40, \text{churn\_probability} \times 40)$
- **Value Component**: $\min(25, \text{customer\_value} / 2000)$
- **Revenue Component**: $\min(25, \text{revenue\_at\_risk} / 1000)$
- **Engagement Component**: $\min(10, (100 - \text{engagement\_proxy}) / 10)$

### Priority Tiers:
- **Critical**: `churn_probability >= 0.7 AND revenue_at_risk >= 5000` (or `score >= 65`)
- **High**: `score >= 40`
- **Medium**: `score >= 20`
- **Low**: `score < 20`

---

## Standardized CSV Exports

The platform provides 5 primary UTF-8 CSV exports with human-readable headers:

1. **Customers** (`customers.csv`):
   - Columns: `Customer ID`, `Risk Level`, `Plan Name`, `Billing Cycle`, `Tenure (Months)`, `MRR (USD)`, `Customer Persona`, `Risk Signals`, `Recommended Action`, `Resolution Outcome`
2. **Churn-Risk Customers** (`churn-risk-customers.csv`):
   - Filtered to high-risk and churned accounts.
   - Columns: `Customer ID`, `Risk Level`, `MRR (USD)`, `Plan Name`, `Billing Cycle`, `Tenure (Months)`, `Observed Signals`, `Recommended Action`
3. **Revenue-Risk Customers** (`revenue-risk-customers.csv`):
   - Accounts contributing to exposed revenue.
   - Columns: `Customer ID`, `Risk Level`, `MRR at Risk (USD)`, `Share of Total Exposed MRR (%)`, `Plan Name`, `Tenure (Months)`, `Recommended Action`
4. **RFM Segments** (`rfm-segments.csv`):
   - Granular customer-level segment assignments based on RFM proxy heuristics.
   - Columns: `Customer ID`, `Assigned Segment`, `Monetary Value Proxy (USD)`, `Engagement Score Proxy (%)`
5. **Retention Actions** (`retention-actions.csv`):
   - Operational queue export for customer success teams.
   - Columns: `Action ID`, `Customer ID`, `Model Risk Level`, `Retention Priority`, `Recommended Action`, `Workflow Status`, `Triggering Business Signals`

---

## Dataset Limitations & Boundary Notice

> [!NOTE]
> The source dataset (`full.jsonl`) is a cross-sectional snapshot containing subscription plans, seat counts, tenure in months, and risk signals. It **does not contain**:
> - Timestamped signup dates
> - Transaction logs or billing histories
> - Daily/monthly usage events
>
> As a result, **monthly trend curves**, **month-over-month growth metrics**, and **historical cohort retention matrices** cannot be genuinely calculated. The platform explicitly displays honest "Not available with current dataset" states rather than fabricating synthetic date distributions.
