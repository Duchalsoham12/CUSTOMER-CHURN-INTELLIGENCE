from collections.abc import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()
raw_url = settings.database_url
if raw_url.startswith("postgresql://"):
    db_url = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
else:
    db_url = raw_url

try:
    if db_url:
        connect_args = {"connect_timeout": 5} if "postgres" in db_url else {}
        engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
        SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    else:
        engine = None
        SessionLocal = None
except Exception:
    engine = None
    SessionLocal = None


def get_db() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True