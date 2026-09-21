# Production Readiness Audit

## Verified fixes

- Environment-backed database, CORS, model path, log level, debug, and secret-key settings.
- Request IDs returned through `X-Request-ID` and included in request logs.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- ML, database, and application health checks.
- Upload size, row-count, CSV encoding, filename, and duplicate validation.
- SQLAlchemy foreign keys and indexes for customer, prediction, segment, action, and time access paths.
- Paginated customer and retention APIs with bounded page sizes.
- Model monitoring endpoint based on actual persisted predictions.
- Model artifacts ignored by Git; secrets remain in `.env`, which is ignored.

## Known limitations

- Authentication and authorization are not implemented; the API is authentication-ready but not presented as secured.
- Docker Desktop availability is environment-dependent.
- Native scikit-learn/SciPy loading is blocked by the current Windows Application Control policy, so live prediction must be verified in an allowed environment.
- Drift and production performance monitoring remain foundations until a baseline period and future outcome labels exist.
- Frontend secondary analytics pages retain explicit mock/fallback presentation until each API adapter is migrated.
