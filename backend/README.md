# Customer Intelligence API

FastAPI, SQLAlchemy, psycopg, Pydantic, and PostgreSQL backend for the Customer Intelligence platform.

## Run locally

From the repository root:

```powershell
docker compose up -d postgres
.\.venv-1\Scripts\python.exe -m pip install -r backend\requirements.txt
$env:PYTHONPATH = "$PWD\backend"
.\.venv-1\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation is available at `/docs` and `/redoc`.

## Database

The current schema is applied with `sql/001_schema.sql`. Load the imported dataset with:

```powershell
.\.venv-1\Scripts\python.exe backend\scripts\import_full_dataset.py
```

The database-backed dashboard is available at `/api/database-dashboard`. Existing JSON-backed analytics remain available while source-label mapping into predictions is pending.

## Testing

```powershell
$env:PYTHONPATH = "$PWD\backend"
.\.venv-1\Scripts\python.exe -m pytest tests -q
```

Prediction requests deliberately return `501 Not Implemented` until the trained model is connected.
