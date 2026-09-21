# Power BI Setup & Integration Architecture

This document specifies the direct database connection, data model relationships, DAX measure definitions, and validation status for Power BI Desktop.

---

## 1. PostgreSQL Connection

Connect to the operational PostgreSQL database using Power BI Desktop's native PostgreSQL connector:

- **Server**: `localhost:15432` (Docker mapped port) or `localhost:5432` (native service)
- **Database**: `customer_intelligence`
- **Authentication**: Database Credentials
- **Username**: `customer_intelligence`
- **Password**: `change-me` (or matching `.env` configuration)
- **Data Connectivity Mode**: DirectQuery (recommended for real-time actions) or Import (recommended for fast aggregations)

> [!CAUTION]
> Never hardcode or commit database credentials in shared Power BI template or report files.

---

## 2. Available SQL Analytical Views

The platform provides pre-compiled analytical views defined in [`sql/powerbi_views.sql`](../sql/powerbi_views.sql):

1. **`vw_customer_analytics`**: Customer 360 table containing persona, company size, latest subscription tier, MRR, seats, calculated seat engagement proxy percentage, and RFM segment name.
2. **`vw_revenue_risk`**: Account-level risk classification, churn probability, and revenue-at-risk joined between customers and model predictions.
3. **`vw_rfm_segments`**: Aggregated summary table grouped by segment name with total account count and average monetary proxy score.
4. **`vw_retention_actions`**: Operational queue table showing pending actions, assigned agents, action priority, and status.
5. **`vw_model_predictions`**: Full prediction audit trail including model name, version, probability, and risk tier.
6. **`vw_monthly_customer_metrics`**: Structured placeholder returning `status: 'unavailable'` and a documented note explaining the absence of timestamp data in the source dataset.
7. **`vw_cohort_retention`**: Structured placeholder returning `status: 'unavailable'` and explaining the lack of customer acquisition timestamps.

---

## 3. Recommended Data Model Relationships

```text
               +---------------------------+
               |  vw_customer_analytics    |
               | (customer_id = PK)       |
               +-------------+-------------+
                             |
       +---------------------+---------------------+
       | 1:*                                       | 1:*
+------v--------------------+               +------v--------------------+
|   vw_revenue_risk         |               |   vw_retention_actions    |
| (customer_id = FK)        |               | (customer_id = FK)        |
+---------------------------+               +---------------------------+
       | 1:*
+------v--------------------+
|   vw_model_predictions   |
| (customer_id = FK)        |
+---------------------------+
```

- **Primary Dimension**: `vw_customer_analytics` joined on `customer_id` (1-to-many, single direction).
- **Display Identifier**: Use `external_customer_id` (e.g. `CCC-06123`) for visual report labels.
- **Referential Integrity**: All child views join on the validated UUID `customer_id`.

---

## 4. Key DAX Measures

The following core DAX measures should be implemented in the Power BI Model (defined in [`powerbi/measures.dax.txt`](../powerbi/measures.dax.txt)):

```dax
Total Customers = COUNTROWS('vw_customer_analytics')

Total MRR = SUM('vw_customer_analytics'[mrr_usd])

Average Customer Value = DIVIDE([Total MRR], [Total Customers], 0)

Active Customers = 
CALCULATE(
    COUNTROWS('vw_customer_analytics'),
    'vw_customer_analytics'[plan_name] <> BLANK()
)

Observed High Risk Accounts = 
CALCULATE(
    COUNTROWS('vw_revenue_risk'),
    'vw_revenue_risk'[risk_level] IN {"high", "churned"}
)

Total Revenue at Risk = 
CALCULATE(
    SUM('vw_revenue_risk'[revenue_at_risk_usd]),
    'vw_revenue_risk'[risk_level] IN {"high", "churned"}
)

Average Seat Engagement = AVERAGE('vw_customer_analytics'[engagement_proxy])

Pending Retention Actions = 
CALCULATE(
    COUNTROWS('vw_retention_actions'),
    'vw_retention_actions'[status] IN {"new", "reviewed", "in_progress"}
)
```

---

## 5. Unsupported Date-Dependent Analytics

The following common SaaS analytics are **intentionally unsupported** in this schema:
- Month-over-month (MoM) MRR growth curves.
- Customer cohort retention heatmaps (M1, M3, M6, M12 retention).
- Support ticket volume trends over time.

These cannot be accurately created because the 500-record dataset has no signup dates or billing event timestamps. Power BI reports should display the `vw_monthly_customer_metrics` and `vw_cohort_retention` unavailable notes rather than using fabricated dummy dates.

---

## 6. Power BI Validation Status

- **SQL Views**: Validated and applied directly to the PostgreSQL database.
- **Relational Integrity**: Validated via foreign key constraints in `001_schema.sql`.
- **Power BI Desktop GUI Validation**: **Not performed**. Power BI Desktop is not installed or executed in this automated CLI environment.
- **File Artifacts**: No `.pbix`, `.pbip`, or `.pbit` binary files have been fabricated; instructions and SQL schema views are provided for direct manual or automated import in Power BI Desktop.
