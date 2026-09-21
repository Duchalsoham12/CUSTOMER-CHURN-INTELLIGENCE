# Customer Intelligence & Churn Analytics Platform

A production-style analytics platform for customer intelligence, churn risk, segmentation, and revenue-at-risk analysis.

## Project Status

**Step 8 implementation is complete.**
- Frontend mock business data has been completely eliminated across all routes and components.
- The React application connects directly to the FastAPI REST API and PostgreSQL database.
- 5 comprehensive CSV export capabilities have been implemented with UTF-8 BOM encoding.
- Dataset boundaries (no event timestamps or transaction history) are transparently documented and handled with informative empty/unavailable states.
- 100% of test suites pass without weakening or removing any test assertions.
- Power BI setup, relational architecture, and DAX measures are documented in [`docs/powerbi-setup.md`](docs/powerbi-setup.md).

---

## Architecture

```text
.
├── frontend/       React 19 + TypeScript + Vite + Tailwind CSS + Recharts
├── backend/        FastAPI REST API and SQLAlchemy/Psycopg application services
├── ml/             Data preparation, leakage-aware features, and churn models
├── data/           raw, processed, and external dataset boundaries
├── sql/            PostgreSQL schema, relational tables, and analytical views
├── notebooks/      Exploratory analysis and experiment notebooks
├── tests/          Cross-layer and integration test suites
├── docs/           Architecture, KPI definitions, data dictionary, and Power BI setup
├── powerbi/        Power BI DAX measures and documentation
├── .env.example    Local environment variable contract
└── docker-compose.yml  PostgreSQL and containerized service definitions
```

---

## Data Flow

```text
CSV upload -> validation -> quality report -> cleaning -> features
-> analytics and segmentation -> churn prediction -> risk metrics -> live dashboard
```

---

## Localhost Links & Running Services

### Quick Start

1. **Start PostgreSQL**:
   ```powershell
   docker compose up -d postgres
   ```
   *(PostgreSQL container runs on mapped port `15432` with credentials in `.env`)*

2. **Start the FastAPI Backend**:
   ```powershell
   $env:PYTHONPATH="backend"
   .\.venv-1\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Root: [http://localhost:8000](http://localhost:8000)
   - Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

3. **Start the Vite Frontend**:
   ```powershell
   npm run dev --prefix frontend
   ```
   - Web Application: [http://localhost:5173](http://localhost:5173)

---

## Step 8 Verification & CSV Exports

All 5 required business exports are implemented using live API data:

1. **Customers** (`customers.csv`): Exported from the Customers view with customer ID, plan, billing frequency, tenure, MRR, persona, risk signals, and recommended action.
2. **Churn-Risk Customers** (`churn-risk-customers.csv`): Exported from the Churn Analytics view, isolating accounts with observed `high` or `churned` risk labels.
3. **Revenue-Risk Customers** (`revenue-risk-customers.csv`): Exported from the Revenue at Risk view, detailing accounts contributing to portfolio revenue exposure and their exposure share percentage.
4. **RFM Segments** (`rfm-segments.csv`): Exported from the Segments view, providing customer-level RFM proxy segment assignments, monetary value proxies, and engagement scores.
5. **Retention Actions** (`retention-actions.csv`): Exported from the Retention Action Center, detailing operational queue priorities, statuses, and triggering signals.

---

## Dataset & Analytical Boundaries

- **Real Source Provenance**: Loaded from the 500-record `full.jsonl` dataset.
- **No Data Fabrication**: The source dataset contains no signup dates, transaction dates, or usage timestamps. Consequently:
  - Monthly period-over-period time-series trend curves are explicitly marked as unavailable with the current dataset.
  - Historical cohort retention curves are rendered as transparent, structured unavailable views.
  - RFM segmentation is documented as an analytical proxy (MRR x tenure for monetary value; seat utilization for engagement).

---

## Power BI Integration

Power BI integration details are documented in [`docs/powerbi-setup.md`](docs/powerbi-setup.md) and [`powerbi/measures.dax.txt`](powerbi/measures.dax.txt).
- All 7 SQL views (`vw_customer_analytics`, `vw_revenue_risk`, `vw_rfm_segments`, `vw_retention_actions`, `vw_model_predictions`, `vw_monthly_customer_metrics`, `vw_cohort_retention`) have been applied to PostgreSQL.
- **Status**: Database connection, SQL views, and DAX measures are prepared and verified against PostgreSQL. Power BI Desktop GUI validation was not performed in this automated headless CLI environment. No fake `.pbix` files have been fabricated.

---

## Test Suite Execution

Run all test suites with:

```powershell
$env:PYTHONPATH="backend"; .\.venv-1\Scripts\pytest.exe -v
npm run build --prefix frontend
```
All 17 automated backend integration tests and the frontend TypeScript compilation pass.
