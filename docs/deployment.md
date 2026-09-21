# Deployment

Local production-style services:

```powershell
docker compose up -d --build
```

This starts PostgreSQL, FastAPI, and the Nginx-served frontend. Secrets and connection strings are supplied through environment variables; no deployment credentials are configured in this repository.
