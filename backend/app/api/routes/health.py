"""Health check endpoint.

Controllers stay thin: this handler only assembles a response model from
configuration. Any future readiness checks (DB connectivity, etc.) should be
delegated to a dedicated service rather than implemented inline here.
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Liveness/health check",
)
async def health_check() -> HealthResponse:
    """Return basic service metadata to signal the API is alive."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
