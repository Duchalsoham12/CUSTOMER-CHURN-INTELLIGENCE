import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.customers import router as customers_router
from app.api.churn import router as churn_router
from app.api.database import router as database_router
from app.api.analytics import router as analytics_router
from app.api.predictions import router as predictions_router
from app.api.analytics_v2 import router as analytics_v2_router
from app.api.retention import router as retention_router
from app.api.monitoring import router as monitoring_router
from app.api.dashboard import router as dashboard_router
from app.api.revenue_risk import router as revenue_risk_router
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.advanced import router as advanced_router
from app.api.assistant import router as assistant_router
from app.core.config import get_settings

settings = get_settings()
logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger("customer_intelligence")


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.validate_runtime()
    yield

app = FastAPI(
    title="Customer Intelligence API",
    version="0.1.0",
    description="REST API for customer intelligence, churn analytics, and retention intelligence.",
    lifespan=lifespan,
)


import time
from app.core.metrics import system_metrics


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        system_metrics.record_request(500, duration_ms)
        raise exc

    duration_ms = (time.perf_counter() - start_time) * 1000.0
    system_metrics.record_request(response.status_code, duration_ms)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    logger.info("request method=%s path=%s status=%s latency=%.2fms request_id=%s", request.method, request.url.path, response.status_code, duration_ms, request_id)
    return response


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    logger.exception("unhandled request error request_id=%s", request_id, exc_info=exc)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred.", "request_id": request_id}}, headers={"X-Request-ID": request_id})

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

app.include_router(health_router, prefix="/api")
app.include_router(health_router)
app.include_router(upload_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(revenue_risk_router, prefix="/api")
app.include_router(customers_router, prefix="/api")
app.include_router(churn_router, prefix="/api")
app.include_router(database_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(analytics_v2_router, prefix="/api")
app.include_router(retention_router, prefix="/api")
app.include_router(monitoring_router, prefix="/api")
app.include_router(advanced_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")