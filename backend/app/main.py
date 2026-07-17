import json
import os
import time
import urllib.request
from typing import Dict, List

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import Config and Services
from backend.app.core.config import settings
from backend.app.routers.feedback import router as feedback_router

# Import Routers
from backend.app.routers.navigation import router as navigation_router
from backend.app.routers.operations import router as operations_router
from backend.app.routers.simulation import router as simulation_router
from backend.app.services.ai_service import ai_service

app = FastAPI(
    title="StadiumFlow AI",
    description="Real-Time Decision Intelligence API for Smart Stadiums & Tournament Experiences",
    version="1.0.0"
)

# CORS Setup
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
allow_all = "*" in origins or not origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ServerlessRateLimiter:
    def __init__(self):
        self.redis_url = os.getenv("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        self.redis_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
        self.local_db: Dict[str, List[float]] = {}

    def is_allowed(self, ip: str, limit: int = 100, window: int = 60) -> bool:
        current_time = time.time()
        # If Upstash Redis credentials are set, perform HTTP rate check
        if self.redis_url and self.redis_token:
            try:
                key = f"rate_limit:{ip}"
                incr_url = f"{self.redis_url}/incr/{key}"
                if not incr_url.startswith(("http://", "https://")):
                    raise ValueError("Insecure URL scheme")
                req = urllib.request.Request(
                    incr_url,
                    headers={"Authorization": f"Bearer {self.redis_token}"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=1.0) as response:  # nosec B310
                    res_data = json.loads(response.read().decode())
                    current_count = int(res_data.get("result", 1))

                # If it is the first increment in the window, set expire
                if current_count == 1:
                    expire_url = f"{self.manager_url if hasattr(self, 'manager_url') else self.redis_url}/expire/{key}/{window}"
                    if not expire_url.startswith(("http://", "https://")):
                        raise ValueError("Insecure URL scheme")
                    ex_req = urllib.request.Request(
                        expire_url,
                        headers={"Authorization": f"Bearer {self.redis_token}"},
                        method="POST"
                    )
                    with urllib.request.urlopen(ex_req, timeout=1.0) as _:  # nosec B310
                        pass

                return current_count <= limit
            except Exception as e:
                # Fallback to local in-memory dict on any network error
                print(f"Serverless Rate Limiter Warning: Redis check failed, using fallback: {e}")

        # In-Memory Local Fallback
        if ip in self.local_db:
            self.local_db[ip] = [t for t in self.local_db[ip] if current_time - t < window]
        else:
            self.local_db[ip] = []

        if len(self.local_db[ip]) >= limit:
            return False

        self.local_db[ip].append(current_time)
        return True

limiter = ServerlessRateLimiter()

@app.middleware("http")
async def add_security_headers_and_rate_limit(request: Request, call_next):
    # 1. Payload Size Check (Max 1MB)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1 * 1024 * 1024:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": "Payload too large. Maximum allowed size is 1MB."}
                )
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid content-length header."}
            )

    # 2. Rate Limiting Check (Max 100 requests per minute per IP)
    client_ip = request.client.host if request.client else "unknown"
    if not limiter.is_allowed(client_ip, limit=100, window=60):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )

    # Proceed with request
    response = await call_next(request)

    # 3. Security Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self';"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    return response

# Core Health Check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "gemini_api_active": ai_service.initialized
    }

# Include routers
app.include_router(navigation_router)
app.include_router(simulation_router)
app.include_router(feedback_router)
app.include_router(operations_router)
