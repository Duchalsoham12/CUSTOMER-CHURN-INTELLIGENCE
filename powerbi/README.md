# Power BI Layer

The Power BI-ready SQL views are in `sql/powerbi_views.sql`:

- `vw_customer_analytics`
- `vw_revenue_risk`
- `vw_rfm_segments`
- `vw_retention_actions`

Recommended model:

```text
DimCustomer -> FactPredictions -> FactRetentionActions
DimSubscription -> FactCustomerMetrics
DimSegment -> FactCustomerMetrics
```

A true `DimDate` and monthly/cohort facts are deferred because the supplied source has no event dates. Connect Power BI to PostgreSQL and use the views after applying the schema and view script.
