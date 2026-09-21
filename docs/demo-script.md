# 5–7 Minute Product Demo Script: CustomerIQ

This live demo script is structured for technical executive, data science, or engineering interviews to present the Customer Intelligence & Churn Analytics Platform systematically.

---

## Pre-Demo Checklist (1 Minute Before)
- Ensure PostgreSQL container is up: `docker compose up -d postgres`
- Ensure FastAPI server is running: `http://localhost:8000`
- Ensure Vite frontend is running: `http://localhost:5173`
- Have terminal or Swagger docs open: `http://localhost:8000/docs`

---

## 1. Landing Page & Executive Positioning (0:00 – 0:45)
- **URL**: `http://localhost:5173/`
- **Narrative**:
  > *"CustomerIQ is a production-grade analytics platform designed to solve a core SaaS problem: transforming unstructured customer sentiment, contract metrics, and behavioral signals into defensible retention momentum. Notice the focus on explainability: we separate model predictions from observed source labels and rule-based suggestions."*
- **Action**: Highlight the value propositions (See risk earlier, Prioritize value, Move with context) and click **Open workspace**.

---

## 2. Executive Dashboard & Portfolio KPIs (0:45 – 1:30)
- **URL**: `http://localhost:5173/dashboard`
- **Narrative**:
  > *"Here on the Executive Overview, metrics are queried directly from our PostgreSQL-backed API. We display 8 core KPIs: Total Customers (500 real records), Active Accounts (439), Observed Churn Rate (12.2%), and Portfolio MRR.
  > Importantly, look at Revenue at Risk: we calculate this explicitly as observed exposure across high-risk and churned accounts ($446,759 MRR), clearly labeled as a prioritization metric rather than speculative expected loss."*
- **Action**: Click **Export summary CSV** to demonstrate instant download of the live KPI breakdown with UTF-8 BOM encoding. Point out the transparent informational notice explaining why month-over-month trend curves are not displayed due to the absence of timestamped transactions in the source data.

---

## 3. Customer Intelligence Directory & Search (1:30 – 2:15)
- **URL**: `http://localhost:5173/customers`
- **Narrative**:
  > *"In the Customer Directory, we render real portfolio accounts with pagination, text search, and risk tier filtering. Each record presents its contracted plan, tenure in months, MRR, observed risk signals, and prescriptive next steps."*
- **Action**:
  1. Filter by **High** or **Critical** risk in the dropdown.
  2. Search for a specific persona or company ID (e.g. `diplomatic` or `CCC-06123`).
  3. Click **Export CSV** to download the full 500-customer dataset with human-readable headers.

---

## 4. Customer Profile Deep Dive (2:15 – 3:00)
- **URL**: `http://localhost:5173/customers/CCC-06123`
- **Narrative**:
  > *"Drilling into account `CCC-06123`, we see observed contract details: Enterprise plan, $970 MRR, and detected signals like pricing complaints and competitor mentions.
  > Notice the Model Prediction card: it displays an honest 'Unavailable' state if no calibrated probability has been persisted, rather than disguising raw source labels as ML inferences. Recommendations are clearly marked as rule-based suggestions."*

---

## 5. Churn Analytics & Revenue Exposure (3:00 – 3:45)
- **URL**: `http://localhost:5173/churn` and `/revenue-risk`
- **Narrative**:
  > *"On the Churn Analytics view, we analyze observed churn patterns by subscription tier and tenure bands. Starter plans show higher churn rates than Enterprise contracts.
  > Over on Revenue at Risk, we prioritize accounts by financial exposure. We can immediately export high-risk accounts via the dedicated Export Churn-Risk Customers and Revenue-Risk Customers buttons."*
- **Action**: Click **Export Churn-Risk Customers** to download `churn-risk-customers.csv`.

---

## 6. RFM Segmentation & Action Center (3:45 – 4:30)
- **URL**: `http://localhost:5173/segments` and `/retention`
- **Narrative**:
  > *"Because the source dataset lacks transaction timestamps, we engineered defensible proxy features: monetary value is MRR × tenure, and frequency/engagement is represented by seat utilization.
  > In the Retention Action Center, we map operational items into priority tiers (Critical, High, Medium, Low) based on a calibrated 0–100 scoring algorithm that weighs churn probability, customer value, and revenue exposure."*
- **Action**: Click **Export RFM Segments CSV** to download customer-level cluster assignments.

---

## 7. Model Performance & Explainability (4:30 – 5:15)
- **URL**: `http://localhost:5173/model`
- **Narrative**:
  > *"Our machine learning architecture evaluates three distinct models under stratified cross-validation: Logistic Regression, Random Forest, and XGBoost.
  > Random Forest was selected based on a balanced PR-AUC of 0.7279 and ROC-AUC of 0.9536. We enforce strict data leakage prevention by excluding target-adjacent fields like resolution outcomes and post-conversation notes."*

---

## 8. Ingestion Pipeline & Quality Profiling (5:15 – 6:00)
- **URL**: `http://localhost:5173/upload`
- **Narrative**:
  > *"The Data Management interface accepts arbitrary CSV uploads and sends them to our FastAPI `/api/upload` endpoint. The engine parses the schema, calculates missing values per column, detects exact duplicate rows, checks for malformed lines, and produces a real-time data quality report."*
- **Action**: Drag and drop a test CSV file to demonstrate live ingestion and automated profiling.

---

## 9. Interactive API Documentation & Wrap-Up (6:00 – 6:30)
- **URL**: `http://localhost:8000/docs`
- **Narrative**:
  > *"Behind the UI, FastAPI exposes well-documented OpenAPI endpoints with Pydantic validation, structured request IDs, security headers, and health checks across database, ML, and system telemetry at `/api/monitoring/system`.
  > All code is backed by automated pytest integration tests, Docker Compose configurations, and GitHub Actions CI."*
