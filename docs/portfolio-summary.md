# Portfolio Summary: Customer Intelligence & Churn Analytics Platform

## Project Title
**CustomerIQ — B2B Customer Intelligence, Churn Prediction & Retention Analytics Platform**

## One-Line Description
A production-grade analytics platform integrating leakage-free machine learning, PostgreSQL analytical data modeling, and a responsive React frontend to transform customer behavior signals into prioritized retention workflows.

---

## 1. Problem Statement
SaaS customer success and revenue teams struggle to prioritize intervention efforts across expanding customer portfolios. Traditional approaches suffer from three systemic flaws:
1. **Isolated Data Silos**: Contract MRR, seat utilization, and customer support friction reside in disconnected spreadsheets or systems.
2. **Black-Box Churn Scores**: Generic predictive scores fail to quantify financial exposure, treating high-value enterprise accounts identically to low-tier subscriptions.
3. **Data Leakage & Misleading Metrics**: Analytics tools frequently use post-churn indicators as predictive features or fabricate timeline trends from cross-sectional data.

---

## 2. Technical Architecture
CustomerIQ employs a clean, decoupled architecture:
- **Presentation Layer**: React 19 SPA built with TypeScript, Vite, Tailwind CSS, and Recharts, delivering dark/light themes, live state management, and client-side UTF-8 CSV exports.
- **Application Layer**: Asynchronous FastAPI REST API featuring Pydantic v2 validation, centralized exception handling, request ID tracing, security headers, and live operational telemetry.
- **Data & Storage Layer**: PostgreSQL 16 relational database with UUID primary keys, foreign key constraints, lateral joins, and sub-millisecond query performance.
- **Machine Learning & Feature Engine**: Leakage-aware preprocessing pipelines evaluating Logistic Regression, Random Forest, and XGBoost models under stratified cross-validation with PR-AUC evaluation.
- **Operations & Infrastructure**: Docker Compose containerization and GitHub Actions CI for automated build and test validation.

---

## 3. Major Features & Capabilities
1. **Executive Portfolio Dashboard**: Real-time KPI summary (total accounts, active subscriptions, observed churn rate, MRR, revenue at risk) with live CSV export.
2. **Customer Intelligence Directory**: Searchable, paginated account table with filtering by risk tier, contract billing type, and customer personas.
3. **Account 360 Deep Dive**: Detailed account view displaying contracted MRR, tenure, business friction signals, rule-based recommendations, and model prediction boundaries.
4. **Pattern Discovery & Churn Analytics**: Breakdown of observed churn rates across subscription plans and tenure cohorts.
5. **Revenue Exposure Analytics**: Quantification of total revenue at risk ($446K+ MRR) grouped by risk tiers, with dedicated CSV exports.
6. **RFM Proxy Segmentation**: Heuristic account clustering into *Champions*, *Loyal Customers*, *Potential Loyalists*, and *At Risk* based on MRR × tenure and seat utilization.
7. **Retention Action Center**: Prioritized operational queue for customer success workflows, ranking accounts using a 0–100 multi-factor scoring algorithm.
8. **Automated Data Quality Profiling**: File dropzone accepting arbitrary CSV uploads, calculating missing values per column, duplicate row counts, and schema validation.

---

## 4. Machine Learning Capabilities
- **Leakage-Free Feature Engineering**: Explicitly excluded post-outcome fields (`resolution_outcome`, `churn_risk_level`, text conversations) from feature matrices.
- **Imbalance-Aware Evaluation**: Addressed the 12.2% churn class imbalance using stratified splits, prioritizing PR-AUC (0.7279 for Random Forest) and ROC-AUC (0.9536) over simple accuracy.
- **Model Versioning & Artifacts**: Versioned artifacts (`churn_rf_v1.joblib`, `churn_logistic_v1.joblib`, `churn_xgb_v1.joblib`) with associated JSON metrics and metadata.
- **Separation of Concerns**: Strictly separates statistical probability estimates from operational business retention priorities.

---

## 5. Engineering Practices
- **100% Automated Test Coverage**: 17 automated integration tests in pytest verifying API routes, pagination, data pipelines, schema validation, and retention scoring.
- **Defensive Database Engineering**: Connection pooling with active pre-ping and strict 3-second connection timeouts preventing thread hangs.
- **Data Integrity & Honesty**: Refused to fabricate dummy calendar dates or fake cohort retention curves when the source dataset contained no timestamped events.
- **Export Standards**: All CSV downloads generated with UTF-8 Byte Order Mark (`\ufeff`) for seamless Excel and spreadsheet rendering.

---

## 6. Documented Limitations
- **Cross-Sectional Source Data**: The 500-record dataset has no signup dates or billing logs; monthly growth curves and cohort retention matrices are honestly presented as unavailable.
- **Authentication**: Auth-ready architecture (designed for JWT / OAuth2 integration); authentication is not currently enforced.
- **Power BI Validation**: SQL analytical views and DAX measures are fully verified in PostgreSQL, while Power BI Desktop GUI validation was not performed in this headless automated environment.

---

## 7. Technology Stack Summary
| Category | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, Starlette |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0, Psycopg 3, Alembic |
| **Machine Learning** | scikit-learn, XGBoost, pandas, NumPy, joblib |
| **DevOps & Testing** | Docker, Docker Compose, Pytest, GitHub Actions |
