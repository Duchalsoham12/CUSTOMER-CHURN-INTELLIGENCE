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
        if not self.database_url:
            raise ValueError("DATABASE_URL must be configured.")
        if self.app_env == "production" and (self.debug or not self.secret_key):
            raise ValueError("Production requires DEBUG=false and SECRET_KEY.")


@lru_cache
def get_settings() -> Settings:
    return Settings()