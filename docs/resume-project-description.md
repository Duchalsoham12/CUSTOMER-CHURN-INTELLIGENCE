# Resume Project Descriptions

Use these verified descriptions for resumes, LinkedIn project sections, and CV additions.

---

## 1. Short Version (Resume Bullet Points)

**Customer Intelligence & Churn Analytics Platform** | *Python, FastAPI, React, TypeScript, PostgreSQL, Docker, scikit-learn*
- Engineered a full-stack SaaS customer intelligence and churn analytics platform with FastAPI, PostgreSQL, and React/TypeScript, processing 500 real B2B customer accounts with sub-millisecond query latency.
- Implemented leakage-aware churn prediction pipelines across Logistic Regression, Random Forest, and XGBoost, achieving 0.9536 ROC-AUC and 0.7279 PR-AUC on validation holdouts.
- Formulated an analytical 0–100 retention prioritization engine combining churn probability, customer value, revenue at risk, and seat engagement proxies.
- Developed 5 end-to-end UTF-8 CSV export pipelines and an automated CSV schema profiling engine reporting missingness, duplicate rows, and schema integrity.
- Containerized services with Docker Compose, automated CI/CD via GitHub Actions, and established 100% automated test coverage with 17 integration tests.

---

## 2. Detailed Version (Portfolio / Case Study Section)

### **Customer Intelligence & Churn Analytics Platform**
**Role**: Lead Full-Stack & Machine Learning Engineer  
**Stack**: Python 3.12, FastAPI, PostgreSQL 16, SQLAlchemy 2.0, Psycopg 3, React 19, TypeScript, Tailwind CSS, Recharts, Vite, scikit-learn, XGBoost, Docker Compose, GitHub Actions.

#### Project Overview
Architected a production-style customer intelligence platform to bridge the gap between predictive machine learning models and operational retention workflows for SaaS customer success and finance teams.

#### Key Technical Achievements:
- **Relational Data Architecture**: Designed a normalized PostgreSQL schema (customers, subscriptions, predictions, segments, retention actions) with targeted composite and lateral indexes, yielding 0.03ms–1.3ms execution times for complex 360-degree customer analytical queries.
- **Leakage-Aware Machine Learning**: Built a leakage-free feature engineering pipeline strictly excluding post-conversation outcomes and target-adjacent metadata; validated models using stratified splits, evaluating via PR-AUC and ROC-AUC to account for 12.2% class imbalance.
- **Explainable Retention Priority**: Separated raw model probabilities from business intervention priorities, designing a transparent 0–100 scoring algorithm that weighs customer value ($MRR), revenue exposure, and product seat utilization.
- **Responsive React / TypeScript Frontend**: Built a responsive, accessible single-page application with dark mode support, client-side routing, live state management (loading, error, empty states), and dynamic Recharts data visualizations without any mock business data.
- **Enterprise Data Operations**: Created automated CSV ingestion with validation profiling (detecting missing values, duplicates, and malformed rows) and 5 export streams featuring UTF-8 BOM encoding for seamless spreadsheet interoperability.
- **Reliability & CI/CD**: Established comprehensive test suites (17 automated pytest integration tests) and GitHub Actions CI pipelines with containerized PostgreSQL service dependencies and strict typechecking.

---

## 3. Technical Skills Demonstrated

- **Languages**: Python, TypeScript, SQL, Modern JavaScript (ESNext), HTML5/CSS3
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, Psycopg 3, Uvicorn, RESTful API Design, Middleware
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, Client-Side Routing
- **Database & Data Modeling**: PostgreSQL 16, Relational Schema Design, Foreign Key Cascades, Lateral Joins, Indexes, EXPLAIN ANALYZE Optimization, Alembic Migrations
- **Machine Learning & Analytics**: scikit-learn, XGBoost, Data Leakage Auditing, Class Imbalance Handling, PR-AUC, ROC-AUC, RFM Segmentation, Feature Engineering
- **DevOps & Engineering**: Docker, Docker Compose, GitHub Actions CI/CD, Pytest, Environment Configuration, Git Version Control
