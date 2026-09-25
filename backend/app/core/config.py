from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["development", "testing", "production"] = "development"
    debug: bool = False
    log_level: str = "INFO"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
    database_url: str = ""
    secret_key: str = ""
    model_path: str = "ml/artifacts/churn_rf_v1.joblib"
    model_version: str = "churn_rf_v1"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def validate_runtime(self) -> None:
        import logging
        logger = logging.getLogger("customer_intelligence")
        if not self.secret_key:
            self.secret_key = "churn-intelligence-default-secret-key-change-in-prod"
        if not self.database_url:
            logger.warning("DATABASE_URL not configured. Running in embedded dataset / JSONL mode.")
        if self.app_env == "production" and self.debug:
            logger.warning("Production mode requested with debug=True; forcing debug=False.")
            self.debug = False


@lru_cache
def get_settings() -> Settings:
    return Settings()