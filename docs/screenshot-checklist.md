# Portfolio Screenshot Checklist

Capture the following 12 high-resolution screenshots to showcase the platform in portfolio portfolios, case studies, and presentation decks:

| # | View Name | Route / URL | Key Elements to Capture | Focus Description |
|---|---|---|---|---|
| 1 | **Landing Page Hero** | `/` | Brand title, hero headline, value metrics, primary CTA | Executive positioning and value proposition |
| 2 | **Executive Dashboard** | `/dashboard` | 8 live KPI cards, Revenue by Risk bar chart, unavailable trends panel, "Export summary CSV" button | Real-time portfolio visibility and revenue prioritization |
| 3 | **Customer Directory** | `/customers` | Filter dropdowns, search input, summary stats, data table rows, "Export CSV" button | Operational account exploration and filtering |
| 4 | **Customer Profile** | `/customers/CCC-06123` | Persona badge, MRR, tenure, business signals, rule-based recommendation, model boundary card | Detailed account 360 view and contextual insights |
| 5 | **Churn Analytics** | `/churn` | Churn by plan bar chart, Churn by tenure bar chart, "Export Churn-Risk Customers" button | Pattern discovery and tenure correlation |
| 6 | **Revenue at Risk** | `/revenue-risk` | Highlight exposure card ($446K+), risk distribution chart, "Export Revenue-Risk Customers" button | Financial exposure quantification and prioritization |
| 7 | **RFM Segmentation** | `/segments` | RFM proxy cluster distribution chart, methodology badge, "Export RFM Segments CSV" button | Behavioral customer segmentation |
| 8 | **Cohort Limitations** | `/cohorts` | Centered empty state, info icon, "Not available with current dataset" explanation badge | Transparent dataset boundaries and governance |
| 9 | **Retention Action Center** | `/retention` | Summary counts, priority queue cards, action tags, "Export retention actions CSV" button | Workflow orchestration for customer success teams |
| 10| **Model Performance** | `/model` | Model comparison table (Random Forest, Logistic Regression, XGBoost metrics), ROC-AUC / PR-AUC | Machine learning rigor and validation metrics |
| 11| **Data Upload & Validation** | `/upload` | File dropzone, completed data quality report (rows, columns, missing values, duplicates) | Automated ingestion and schema validation engine |
| 12| **FastAPI Swagger Docs** | `http://localhost:8000/docs` | Grouped REST endpoints (`analytics`, `customers`, `retention`, `monitoring`, `system`) | Robust backend architecture and OpenAPI standards |

---

## Capture Guidelines
- **Resolution**: 1920×1080 (or 16:9 aspect ratio) with high DPI scaling.
- **Theme**: Capture in both light and dark mode toggles if creating a comprehensive gallery.
- **Data State**: Ensure the PostgreSQL container is running so all KPI cards and table views display live data.
- **Browser Frame**: Omit browser bookmarks and URL bars for clean portfolio embedding.
