# CustomerIQ — Customer Intelligence & Churn Analytics Platform

[![CI](https://github.com/placeholder/customer-churn-intelligence/actions/workflows/ci.yml/badge.svg)](https://github.com/placeholder/customer-churn-intelligence)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade B2B customer intelligence, churn prediction, and retention analytics platform. CustomerIQ integrates leakage-aware machine learning pipelines, a normalized PostgreSQL analytical schema, and a responsive React 19 single-page application to transform customer usage signals into prioritized operational workflows.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Business Problem](#2-business-problem)
3. [Key Capabilities](#3-key-capabilities)
4. [Architecture](#4-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Data Pipeline](#6-data-pipeline)
7. [Analytics Methodology](#7-analytics-methodology)
8. [Machine Learning Methodology](#8-machine-learning-methodology)
9. [Explainability](#9-explainability)
10. [Retention Intelligence](#10-retention-intelligence)
11. [Revenue at Risk Definition](#11-revenue-at-risk-definition)
12. [Dataset Limitations](#12-dataset-limitations)
13. [Local Setup](#13-local-setup)
14. [Docker Setup](#14-docker-setup)
15. [API Documentation](#15-api-documentation)
16. [Testing](#16-testing)
17. [Power BI Integration](#17-power-bi-integration)
18. [Screenshots Section](#18-screenshots-section)
19. [Deployment Instructions](#19-deployment-instructions)
20. [Security Notes](#20-security-notes)
21. [Known Limitations](#21-known-limitations)
22. [Future Improvements](#22-future-improvements)

---

## 1. Project Overview
CustomerIQ is designed for SaaS customer success, account management, and finance teams. It bridges the gap between predictive statistical churn models and tactical account intervention. Rather than providing disconnected probability scores, CustomerIQ contextually correlates model predictions with financial exposure (contracted Monthly Recurring Revenue), product utilization proxies, and operational action queues.

---

## 2. Business Problem
In high-growth B2B subscription businesses, retaining existing recurring revenue is critical to unit economics and net revenue retention (NRR). However, customer success managers frequently face:
- **Alert Fatigue**: Disjointed lists of accounts without quantifiable revenue exposure.
- **Equal Treatment Fallacy**: A 70% churn risk on a $50/month account receiving the same urgency as a 40% churn risk on a $25,000/month enterprise account.
- **Unexplainable Scores**: ML models delivering black-box scores without transparent business drivers.
- **Data Leakage & Hallucination**: Analytics tools predicting churn using post-cancellation indicators or fabricating trend graphs when historical event dates do not exist.

CustomerIQ solves these challenges with an explainable prioritization formula, strict data leakage boundaries, and transparent reporting.

---

## 3. Key Capabilities
- **Executive Portfolio Health**: Real-time KPI summaries covering 500 accounts, observed churn rates (12.2%), portfolio MRR, and revenue at risk.
- **Customer Intelligence Directory**: Searchable, paginated customer directory with filtering by risk level, billing cycle, and persona.
- **Account 360 Deep-Dive**: Granular account profiles displaying seat utilization, business friction signals, rule-based recommendations, and model boundary states.
- **Pattern Discovery Analytics**: Empirical churn rates broken down by subscription plan and contract duration bands.
- **Financial Exposure Analytics**: Quantification and segmentation of exposed revenue by risk tier.
- **RFM Proxy Segmentation**: Quantile-based customer clustering into *Champions*, *Loyal Customers*, *Potential Loyalists*, and *At Risk*.
- **Retention Action Center**: Prioritized operational queue (Critical, High, Medium, Low) scoring probability, MRR, exposure, and seat engagement.
- **Automated Data Quality Profiler**: File upload dropzone validating CSV schemas, column missingness, duplicate rows, and data anomalies.
- **Full CSV Exportability**: 5 dedicated UTF-8 BOM CSV exports for spreadsheet analysis.

---

## 4. Architecture

```text
+-------------------------------------------------------------------------+
|                        React 19 Frontend (Vite)                         |
|     Executive Dashboard · Customer 360 · Churn Analytics · Action Queue |
+------------------------------------+------------------------------------+
                                     |  HTTP / REST (JSON)
+------------------------------------v------------------------------------+
|                         FastAPI Application                             |
|    Auth-Ready · Request ID · Security Headers · Telemetry Monitoring    |
+------------------+-----------------+-------------------+----------------+
                   |                 |                   |
      +------------v---+       +-----v----------+   +----v---------------+
      | PostgreSQL 16  |       | ML Inference   |   | Data Pipeline      |
      | Relational DB  |       | Versioned      |   | Profiling & RFM    |
      | 7 SQL Views    |       | Joblib Models  |   | Feature Engineering|
      +----------------+       +----------------+   +--------------------+
```

---

## 5. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, Starlette |
| **Database** | PostgreSQL 16 (Alpine), SQLAlchemy 2.0, Psycopg 3, Alembic |
| **Machine Learning** | scikit-learn, XGBoost, pandas, NumPy, joblib |
| **DevOps & CI/CD** | Docker, Docker Compose, GitHub Actions, Pytest |

---

## 6. Data Pipeline

```text
Source Data (full.jsonl)
       │
       ▼
1. Validation ─────────► Missing values profiling, duplicate detection, schema checks
       │
       ▼
2. Cleaning ───────────► Robust outlier handling, deduplication on customer ID
       │
       ▼
3. Feature Eng. ───────► Contract MRR, seat utilization proxy, tenure categorization
       │
       ▼
4. Relational Storage ─► Normalized tables (customers, subscriptions, segments)
       │
       ▼
5. Model Inference ────► Stratified feature transforms, calibrated probabilities
       │
       ▼
6. Operational Views ──► Analytical SQL views, REST API endpoints, Web Dashboard
```

---

## 7. Analytics Methodology
- **Churn Rate Calculation**: Calculated as the empirical ratio of churned resolution outcomes to total records ($61 / 500 = 12.2\%$).
- **Retention Rate**: Complement of observed churn rate ($87.8\%$).
- **Proxy RFM Segmentation**:
  - **Monetary Proxy**: $\text{MRR} \times \text{tenure in months}$ representing cumulative customer spend.
  - **Frequency/Engagement Proxy**: Contracted seat utilization percentage ($\frac{\text{active seats}}{\text{contracted seats}} \times 100$).
  - **Recency**: Acknowledged as unavailable due to absence of transaction timestamps.

---

## 8. Machine Learning Methodology
The machine learning pipeline evaluates three model architectures trained on leakage-free features:
1. **Logistic Regression** (`churn_logistic_v1`): Baseline linear model.
2. **Random Forest** (`churn_rf_v1`): Ensemble decision tree classifier selected as the primary production model.
3. **XGBoost** (`churn_xgb_v1`): Gradient-boosted decision tree classifier.

### Validation Performance Comparison (Stratified 80/20 Holdout)
| Model | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|
| **Random Forest** | **0.7273** | **0.6667** | **0.6957** | **0.9536** | **0.7279** |
| Logistic Regression | 0.5000 | 0.7500 | 0.6000 | 0.9328 | 0.6782 |
| XGBoost | 0.6000 | 0.2500 | 0.3529 | 0.9271 | 0.6197 |

*Note: Evaluation metrics are derived from saved offline validation artifacts, not live production deployment guarantees.*

---

## 9. Explainability
To guarantee transparency and prevent data leakage:
- **Leakage Elimination**: All post-conversation outcomes (`resolution_outcome`, `churn_risk_level`, text conversations, customer support notes) are excluded from model training features (`ml/artifacts/leakage_report.json`).
- **Signal Attribution**: Source business friction signals (pricing complaints, competitor mentions, low seat engagement) are presented alongside predictions to provide customer success managers with actionable context.

---

## 10. Retention Intelligence
CustomerIQ strictly decouples **Model Probability** from **Operational Priority**:
- **Model Output**: Statistical likelihood of customer churn ($0.0 \dots 1.0$).
- **Retention Priority**: A composite 0–100 score prioritizing accounts by business impact:
  $$\text{Score} = \text{Risk Component} (0\text{–}40) + \text{Value Component} (0\text{–}25) + \text{Revenue Component} (0\text{–}25) + \text{Engagement Component} (0\text{–}10)$$
  - **Critical**: `churn_probability >= 0.7 AND revenue_at_risk >= 5000` (or `score >= 65`)
  - **High**: `score >= 40`
  - **Medium**: `score >= 20`
  - **Low**: `score < 20`

---

## 11. Revenue at Risk Definition
Revenue at Risk is an **analytical prioritization metric**, defined as:
$$\text{Revenue at Risk} = \text{Churn Probability} \times \text{Customer Value (MRR)}$$
In observed analytics, it represents the sum of MRR for accounts labeled high-risk or churned ($\$446,759.00$ MRR across 176 accounts). It is explicitly designated as a **prioritization tool**, not guaranteed financial loss.

---

## 12. Dataset Limitations
The imported dataset (`full.jsonl`, 500 records) is a cross-sectional snapshot. It **does not contain**:
- Calendar signup dates or cancellation dates
- Time-stamped transaction or billing logs
- Daily event streams

**Governance Policy**: In accordance with rigorous data integrity, month-over-month trend curves and cohort retention matrices are **never fabricated**. The application displays informative, structured unavailable states (`Not available with current dataset`) and documents why.

---

## 13. Local Setup

### Prerequisites
- Python 3.11+ (Python 3.12 recommended)
- Node.js 20+ and npm 10+
- PostgreSQL 16+ or Docker Desktop

### 1. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
$env:PYTHONPATH="backend"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Root: [http://localhost:8000](http://localhost:8000)
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 14. Docker Setup

Start the PostgreSQL service container:
```powershell
docker compose up -d postgres
```
Verify container health:
```powershell
docker compose ps
```
The database listens on host port `15432` with pre-configured credentials (`customer_intelligence:change-me`).

---

## 15. API Documentation

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Core API health check |
| `GET` | `/health/db` | Database connectivity health check |
| `GET` | `/health/ml` | Machine learning artifact availability check |
| `GET` | `/api/monitoring/system` | Live operational telemetry (latency, request counts, data quality) |
| `GET` | `/api/monitoring/model` | Model prediction monitoring and drift status |
| `GET` | `/api/analytics/overview` | Core portfolio KPIs (total accounts, churn rate, MRR) |
| `GET` | `/api/analytics/churn` | Observed churn rates by subscription plan and tenure |
| `GET` | `/api/analytics/rfm` | RFM proxy customer segments and scores |
| `GET` | `/api/analytics/revenue` | Revenue at risk exposure by risk band |
| `GET` | `/api/customers` | Paginated customer table with search and filtering |
| `GET` | `/api/customers/{id}` | Customer 360 profile lookup |
| `POST` | `/api/upload` | Multipart CSV schema ingestion and profiling |
| `GET` | `/api/retention/queue` | Operational retention action queue |
| `GET` | `/api/model-performance` | Validation metrics comparison across model artifacts |

---

## 16. Testing

Run the full automated test suite:
```powershell
$env:PYTHONPATH="backend"; pytest tests -v
```
Run the frontend typecheck and production build:
```powershell
npm run build --prefix frontend
```
**Results**: 17/17 backend integration tests pass; TypeScript/Vite builds with zero errors.

---

## 17. Power BI Integration
Integration specifications and DAX formulas are documented in [`docs/powerbi-setup.md`](docs/powerbi-setup.md) and [`powerbi/measures.dax.txt`](powerbi/measures.dax.txt).
- All 7 analytical SQL views (`vw_customer_analytics`, `vw_revenue_risk`, `vw_retention_actions`, `vw_rfm_segments`, `vw_model_predictions`, `vw_monthly_customer_metrics`, `vw_cohort_retention`) are applied and verified in PostgreSQL.
- *Status*: SQL views and DAX formulas are verified; Power BI Desktop GUI testing was not performed in this headless automated environment.

---

## 18. Screenshots Section
Refer to [`docs/screenshot-checklist.md`](docs/screenshot-checklist.md) for full portfolio capture specifications covering the Landing Page, Dashboard, Customer Directory, Profile 360, Churn Analytics, Revenue Risk, RFM Segmentation, Action Queue, ML Performance, Data Upload, and Swagger UI.

---

## 19. Deployment Instructions

### Production Container Deployment
1. Copy `.env.example` to `.env` and set secure values:
   ```env
   APP_ENV=production
   DEBUG=false
   SECRET_KEY=<strong-random-secret>
   CORS_ORIGINS=https://app.yourdomain.com
   DATABASE_URL=postgresql+psycopg://user:password@db-host:5432/customer_intelligence
   ```
2. Build and launch services via Docker Compose:
   ```powershell
   docker compose up -d --build
   ```

### Cloud Production Architecture (Recommended)
- **Database**: Managed PostgreSQL (AWS RDS or GCP Cloud SQL) with SSL and automated snapshots.
- **Backend API**: Containerized FastAPI deployed on AWS ECS (Fargate) or GCP Cloud Run behind an Application Load Balancer.
- **Frontend SPA**: Static assets (`frontend/dist`) distributed via AWS S3 + CloudFront CDN or Vercel.

---

## 20. Security Notes
- **Zero Committed Secrets**: `.env` and sensitive credentials are excluded via `.gitignore`.
- **Security Headers**: API responses enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Injection Protection**: Database queries utilize SQLAlchemy parameterized queries and ORM mappings, preventing SQL injection.
- **Bounded Ingestion**: CSV uploads are restricted to 10 MB and validated for file type and UTF-8 encoding.
- **Authentication**: The architecture is designed as **auth-ready** with user context hooks; authentication is not currently enforced.

---

## 21. Known Limitations
- **Cross-Sectional Dataset**: Lacks historical event dates; monthly growth curves and cohort retention matrices are unavailable.
- **Power BI Desktop**: Report `.pbix` visual construction is a manual step using the provided SQL views and DAX formulas.
- **Prospective Monitoring**: Production model drift monitoring requires future ground-truth renewal outcomes.

---

## 22. Future Improvements
- [ ] Implement JWT / OAuth2 authentication and role-based access control (RBAC).
- [ ] Integrate prospective event-streaming ingestion (Kafka / AWS Kinesis) for real-time activity tracking.
- [ ] Connect webhook dispatchers for Slack and email notifications on high-priority retention actions.
- [ ] Deploy SHAP explainability visualizations directly in the React customer profile view.

---

## License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
