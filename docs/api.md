# API

FastAPI documentation is available at `/docs` and `/redoc`.

Health:

- `GET /health`
- `GET /health/db`
- `GET /health/ml`

Analytics:

- `GET /api/analytics/overview`
- `GET /api/analytics/churn`
- `GET /api/analytics/monthly`
- `GET /api/analytics/rfm`
- `GET /api/analytics/cohorts`
- `GET /api/analytics/revenue`

Prediction and retention:

- `POST /api/predict`
- `POST /api/predict/batch`
- `GET /api/model-performance`
- `GET /api/retention/overview`
- `GET /api/retention/queue`
- `POST /api/retention/actions`
- `PATCH /api/retention/actions/{action_id}`
