"""Repository ingestion API routes."""

from __future__ import annotations

import asyncio
import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import StreamingResponse

from app.api.deps import get_app_settings, get_ingestion_pipeline
from app.core.config import Settings
from app.middleware.error_handler import NotFoundError
from app.schemas.ingestion import (
    GitHubIngestionRequest,
    IngestionJobResponse,
    IngestionStartResponse,
)
from app.services.ingestion.pipeline import IngestionPipeline
from app.services.ingestion.store import get_ingestion_store

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB


@router.post(
    "/github",
    response_model=IngestionStartResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest a GitHub repository",
)
async def ingest_github(
    body: GitHubIngestionRequest,
    pipeline: IngestionPipeline = Depends(get_ingestion_pipeline),
) -> IngestionStartResponse:
    """Validate, clone, and index a GitHub repository."""
    job = await pipeline.start_github_ingestion(url=body.url, token=body.token)
    return IngestionStartResponse(job_id=job.id)


@router.post(
    "/upload",
    response_model=IngestionStartResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest a repository ZIP archive",
)
async def ingest_zip(
    file: UploadFile = File(..., description="ZIP archive of the repository."),
    owner: str = Form(default="local"),
    name: str = Form(..., description="Repository name."),
    settings: Settings = Depends(get_app_settings),
    pipeline: IngestionPipeline = Depends(get_ingestion_pipeline),
) -> IngestionStartResponse:
    """Extract and index a uploaded ZIP archive."""
    if not file.filename or not file.filename.lower().endswith(".zip"):
        from app.middleware.error_handler import ValidationError

        raise ValidationError("Only .zip archives are supported.")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        from app.middleware.error_handler import ValidationError

        raise ValidationError(f"Archive exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.")

    upload_dir = Path(settings.ingestion_workspace_dir) / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    archive_path = upload_dir / f"{name}-{uuid.uuid4().hex[:8]}.zip"
    archive_path.write_bytes(content)

    job = await pipeline.start_zip_ingestion(archive_path=archive_path, owner=owner, name=name)
    return IngestionStartResponse(job_id=job.id)


@router.get(
    "/{job_id}",
    response_model=IngestionJobResponse,
    summary="Get ingestion job status",
)
async def get_ingestion_status(job_id: str) -> IngestionJobResponse:
    """Poll the current status of an ingestion job."""
    store = get_ingestion_store()
    job = await store.get_job(job_id)
    if job is None:
        raise NotFoundError(f"Ingestion job '{job_id}' not found.")
    return IngestionJobResponse(**job.to_dict())


@router.get(
    "/{job_id}/events",
    summary="Stream ingestion progress (SSE)",
    response_class=StreamingResponse,
)
async def stream_ingestion_events(job_id: str) -> StreamingResponse:
    """Server-Sent Events stream for real-time ingestion progress."""
    store = get_ingestion_store()
    job = await store.get_job(job_id)
    if job is None:
        raise NotFoundError(f"Ingestion job '{job_id}' not found.")

    async def event_generator():
        queue = job.subscribe()
        try:
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=30.0)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue

                yield f"data: {json.dumps(payload)}\n\n"
                if payload.get("stage") in ("completed", "failed"):
                    break
        finally:
            job.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
