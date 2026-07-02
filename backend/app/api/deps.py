"""Reusable FastAPI dependencies.

Provides request-scoped access to shared resources (currently settings) so
route handlers stay decoupled from module-level globals and remain testable.
"""

from __future__ import annotations

from fastapi import Request

from app.core.config import Settings, get_settings
from app.services.ingestion.pipeline import IngestionPipeline


def get_app_settings(request: Request) -> Settings:
    """Return the settings bound to the current application instance.

    Falls back to the cached environment settings if none were attached (e.g.
    when a route is exercised outside of :func:`app.main.create_app`).
    """
    settings: Settings | None = getattr(request.app.state, "settings", None)
    return settings or get_settings()


def get_ingestion_pipeline(request: Request) -> IngestionPipeline:
    """Return an ingestion pipeline bound to the current app settings."""
    settings = get_app_settings(request)
    return IngestionPipeline(settings)
