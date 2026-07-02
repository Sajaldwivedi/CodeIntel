"""Ensure the ingestion workspace exists at startup."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def register_lifespan(app: FastAPI, settings: Settings) -> None:
    """Create required directories when the application starts."""

    @app.on_event("startup")
    async def _ensure_workspace() -> None:
        workspace = Path(settings.ingestion_workspace_dir)
        workspace.mkdir(parents=True, exist_ok=True)
        (workspace / "uploads").mkdir(parents=True, exist_ok=True)
        logger.info("Ingestion workspace ready at %s", workspace.resolve())
