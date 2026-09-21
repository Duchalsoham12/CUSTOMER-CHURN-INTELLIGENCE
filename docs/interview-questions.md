# Technical Interview Preparation Guide

Concise, verified answers covering data analytics, SQL, machine learning, backend, frontend, and deployment architectures based on the Customer Intelligence & Churn Analytics Platform.

---

## 1. Data Analytics

### How did you calculate churn?
> Churn is calculated as the ratio of accounts with explicit churned resolution outcomes to total unique accounts in the dataset:
> $$\text{Churn Rate} = \frac{\text{Churned Accounts}}{\text{Total Accounts}} \times 100$$
> In our 500-record dataset, 61 accounts churned, yielding an observed churn rate of **12.2%** (retention rate: 87.8%). We explicitly report this as an observed label rate, not a causal guarantee.

### What is RFM?
> **RFM** stands for **Recency**, **Frequency**, and **Monetary value**. Because our source dataset lacks historical transaction timestamps, we engineered defensible proxy dimensions:
> - **Monetary**: Calculated as contracted $\text{MRR} \times \text{tenure in months}$ to reflect cumulative account financial footprint.
> - **Frequency / Engagement**: Proxy derived from contracted seat utilization ($\text{active seats} / \text{total seats} \times 100$).
> - **Recency**: Acknowledged as unavailable rather than fabricated. Accounts are clustered into proxy segments (*Champions*, *Loyal Customers*, *Potential Loyalists*, *At Risk*).

### What is Revenue at Risk?
> **Revenue at Risk** is an analytical prioritization metric quantifying financial exposure. In observed analytics, it represents the sum of MRR for accounts labeled high-risk or churned ($\$446,759$ MRR across 176 accounts). In predictive modeling, it is calculated as:
> $$\text{Revenue at Risk} = \text{Churn Probability} \times \text{Customer Value (MRR)}$$
> We explicitly document this as a risk-weighted prioritization ranking, **not guaranteed financial loss**.

### Why can cohort analysis not be performed with this dataset?
> True SaaS cohort retention requires customer acquisition timestamps (signup month) and discrete monthly transaction or activity events over time ($M_0, M_1, M_2, \dots$). The 500-record source dataset is a single cross-sectional snapshot containing contract duration in integer months but **zero calendar dates or event logs**. Displaying a synthetic cohort heatmap would fabricate dates, violating our core data governance requirement. Instead, we return a structured `status: 'unavailable'` response.

### How did you prevent misleading analytics?
> 1. Explicitly separated observed historical source labels from ML model prediction probabilities.
> 2. Documented dataset limitations and surfaced informative empty/unavailable states for unsupported date-dependent features.
> 3. Refused to fabricate synthetic time-series or dummy transactions.
> 4. Displayed caveats on recommendations emphasizing that they are heuristic suggestions, not causal guarantees.

---

## 2. SQL & Relational Modeling

### Explain your analytical views.
> We created 7 specialized PostgreSQL views in `sql/powerbi_views.sql`:
> - `vw_customer_analytics`: Integrates customer metadata with lateral joins to latest subscription and RFM segment records, computing seat engagement percentage on the fly.
> - `vw_revenue_risk`: Joins customer accounts with model predictions to expose churn probabilities and revenue exposure.
> - `vw_retention_actions`: Presents the operational queue for customer success workflows.
> - `vw_rfm_segments`: Aggregates customer counts and average monetary scores grouped by segment.
> - `vw_model_predictions`: Audit log of model inference outputs and versions.
> - `vw_monthly_customer_metrics` & `vw_cohort_retention`: Structured placeholder views returning honest unavailable notices for Power BI.

### Why use PostgreSQL views?
> 1. **Encapsulation**: Simplifies complex lateral joins and aggregations into standard tabular schemas for downstream BI tools like Power BI.
> 2. **Security & Abstraction**: Allows frontend or BI users to query curated business metrics without direct access to base table mutation logic.
> 3. **Consistency**: Centralizes business metric definitions (such as seat engagement formulas) in the database layer rather than duplicating logic across client applications.

### How would you optimize a slow query?
> 1. Run `EXPLAIN (ANALYZE, BUFFERS)` to inspect query planning time, execution time, row estimates, join algorithms (Hash vs Nested Loop), and memory usage.
> 2. Eliminate full sequential scans on large tables by creating targeted composite or covering B-tree indexes.
> 3. Avoid `SELECT *` by requesting only necessary columns.
> 4. Rewrite expensive correlated subqueries as `LEFT JOIN LATERAL` or Common Table Expressions (CTEs).
> 5. Increase `work_mem` for queries performing large in-memory sorts or hash tables.

### Why are indexes needed?
> Without indexes, PostgreSQL must perform sequential scans reading every disk page in a table ($O(N)$). B-tree indexes allow logarithmic search ($O(\log N)$) on foreign keys, filter predicates, and sort columns. For example, our `idx_subscriptions_customer_id` and `idx_retention_actions_status_priority` indexes reduce execution time to under **0.03ms** on filtered queue queries.

---

## 3. Machine Learning & Modeling

### Why use Logistic Regression?
> Logistic Regression serves as an interpretable, linear baseline. It provides well-calibrated odds ratios and verifies whether the feature space is linearly separable before introducing non-linear tree models.

### Why Random Forest?
> Random Forest ensembles multiple decision trees using bagging (bootstrap aggregating) and random feature subsampling. It handles mixed data types, captures non-linear feature interactions, and resists overfitting without requiring extensive feature scaling.

### Why XGBoost?
> XGBoost utilizes gradient boosting, fitting sequential trees to pseudo-residuals of previous trees. It excels with tabular data, implements built-in L1/L2 regularization to prevent overfitting, and provides gradient-based feature split optimizations.

### How did you handle class imbalance?
> With only 12.2% churned records (61 positive cases out of 500), standard accuracy is a misleading metric (an 87.8% accurate model could simply predict zero churn). We addressed this by:
> 1. Using stratified train/test splits (`StratifiedKFold` / `train_test_split(stratify=y)`) to preserve the 12.2% class distribution.
> 2. Evaluating primarily on **PR-AUC** (Precision-Recall Area Under Curve) and F1-score rather than accuracy.
> 3. Applying class-weighted loss functions (`class_weight='balanced'`) during tree training.

### Why use PR-AUC?
> ROC-AUC evaluates the True Positive Rate against the False Positive Rate. When negative cases heavily outnumber positive cases, large numbers of false positives result in small changes to the False Positive Rate, making ROC-AUC overly optimistic. **PR-AUC** plots Precision ($\frac{TP}{TP+FP}$) directly against Recall ($\frac{TP}{TP+FN}$), giving a strict, realistic assessment of model performance on the minority class.

### What is data leakage?
> Data leakage occurs when training data includes features containing information that would not be available at the time of prediction. We conducted an explicit leakage audit (`ml/artifacts/leakage_report.json`), strictly excluding:
> - `resolution_outcome`: Post-interaction outcome used to derive the target.
> - `churn_risk_level`: Subjective source risk assessment label.
> - `conversation` & `summary`: Post-interaction unstructured text containing outcome words.
> - `churn_signals`: Annotations assigned after the churn risk was recognized.

### How did you split the data?
> We used a stratified 80/20 train/test split. Stratification guarantees that both the training set and validation set contain exactly the same 12.2% churn ratio, preventing partition variance.

### How does SHAP work?
> SHAP (SHapley Additive exPlanations) is based on cooperative game theory. It calculates the marginal contribution of each feature to the difference between the model's actual prediction and the expected baseline prediction across all possible feature coalitions, providing mathematically consistent local and global feature attribution.

### How is risk level different from retention priority?
> - **Risk Level (Model Output)**: A statistical probability estimate ($0.0 \dots 1.0$) indicating how likely a customer is to churn based on contract and usage features.
> - **Retention Priority (Business Decision)**: An operational ranking ($0 \dots 100$) combining the churn probability with the customer's monetary value ($\text{MRR}$), total revenue exposure, and product seat engagement. A customer with medium churn risk but $\$25,000$ MRR receives higher retention priority than an account with high churn risk but only $\$50$ MRR.

---

## 4. Backend Engineering

### Why FastAPI?
> FastAPI provides high-performance asynchronous HTTP handling on top of Starlette and Uvicorn, native data validation with Pydantic v2, dependency injection for database sessions, and automated OpenAPI (Swagger) documentation generation.

### How does the frontend communicate with the backend?
> The frontend communicates via a centralized, typed API client (`frontend/src/services/api.ts`) using standard asynchronous `fetch` requests over HTTP REST endpoints, passing query parameters for pagination/filtering and multipart/form-data for file uploads.

### How is validation handled?
> Backend inputs are strictly validated at the boundary:
> 1. Path and query parameters are constrained using FastAPI `Query` (e.g. `ge=1`, `le=100`, regex patterns for risk levels).
> 2. Request and response payloads use Pydantic models with type annotations.
> 3. File uploads are validated for `.csv` file extension, non-empty payloads, maximum size bounds (10 MB), and valid UTF-8 CSV headers.

### How are errors handled?
> 1. Predictable client errors raise structured `HTTPException` with appropriate status codes (400 for bad uploads, 404 for missing records, 422 for schema validation, 503 for unavailable dependencies).
> 2. Unhandled exceptions are caught by a global exception handler middleware returning standard JSON responses with UUID request tracing IDs, avoiding sensitive stack trace exposure.

---

## 5. Frontend Engineering

### Why React / TypeScript?
> React provides declarative component-based UI composition with performant virtual DOM reconciliation. TypeScript adds static type safety across API response contracts, preventing null reference bugs and enabling confident refactoring.

### How are API states handled?
> Every view component encapsulates four distinct lifecycle states:
> 1. **Loading State**: Displays animated spinners (`RefreshCw`) during network roundtrips.
> 2. **Error State**: Displays informative error panels with retry capabilities when endpoints fail.
> 3. **Empty State**: Displays clear empty notices when queries return zero results.
> 4. **Success State**: Renders interactive data tables and Recharts charts.

### How are CSV exports implemented?
> Exports are generated client-side using a reusable helper (`frontend/src/lib/csv.ts`). It transforms typed JavaScript object arrays into CSV format, escapes commas and quotes, prepends a UTF-8 Byte Order Mark (`\ufeff`) for Microsoft Excel compatibility, and triggers a browser download via dynamic anchor blobs.

---

## 6. Deployment & Infrastructure

### How does Docker help?
> Docker guarantees consistent containerized runtime environments across development, testing, and production. It packages PostgreSQL with pre-configured health checks, volumes for data persistence, and exposed ports, eliminating "works on my machine" issues.

### How is PostgreSQL connected?
> Connections are managed via SQLAlchemy 2.0 with the modern `psycopg` (v3) binary driver. We configure connection pooling with `pool_pre_ping=True` to verify live connections and set a strict `connect_timeout=3` to prevent indefinite thread hangs when the database is unreachable.

### How would you deploy this system to the cloud?
> 1. **Database**: Managed PostgreSQL (AWS RDS or Google Cloud SQL) with automated backups, multi-AZ failover, and SSL enforcement.
> 2. **Backend**: Containerized FastAPI service running on AWS ECS / Fargate or Google Cloud Run, autoscaling behind an Application Load Balancer with HTTPS termination.
> 3. **Frontend**: Static production build (`dist/`) hosted on AWS S3 + CloudFront CDN or Vercel/Netlify for global low-latency edge delivery.
> 4. **Secrets & Config**: Environment variables injected securely via AWS Secrets Manager or GCP Secret Manager.
