import time
from threading import Lock
from typing import Any


class MetricsStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self.start_time = time.time()
        self.total_requests = 0
        self.status_2xx = 0
        self.status_4xx = 0
        self.status_5xx = 0
        self.total_latency_ms = 0.0

    def record_request(self, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self.total_requests += 1
            self.total_latency_ms += duration_ms
            if 200 <= status_code < 300:
                self.status_2xx += 1
            elif 400 <= status_code < 500:
                self.status_4xx += 1
            elif status_code >= 500:
                self.status_5xx += 1

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            avg_latency = (
                round(self.total_latency_ms / self.total_requests, 2)
                if self.total_requests > 0
                else 0.0
            )
            return {
                "uptime_seconds": round(time.time() - self.start_time, 1),
                "total_requests": self.total_requests,
                "successful_requests_2xx": self.status_2xx,
                "client_errors_4xx": self.status_4xx,
                "server_errors_5xx": self.status_5xx,
                "average_latency_ms": avg_latency,
            }


system_metrics = MetricsStore()
