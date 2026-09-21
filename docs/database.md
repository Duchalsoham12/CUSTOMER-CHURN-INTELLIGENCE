# Database

PostgreSQL is managed locally with Docker Compose. Alembic configuration lives in `backend/alembic.ini`; the initial schema is also maintained in `sql/001_schema.sql` for the current imported database.

Indexes cover customer IDs, subscription access, prediction time/risk, segment access, and retention action status/priority. Credentials are environment-backed.
