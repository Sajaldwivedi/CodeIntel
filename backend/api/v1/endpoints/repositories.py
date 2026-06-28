import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Header, UploadFile

from api.deps.services import get_repository_service
from core.config.settings import get_settings
from core.exceptions.app_exceptions import AppException
from schemas.requests.repository import GitHubUploadRequest
from schemas.responses.repository import (
    RepositoryListResponse,
    RepositoryResponse,
    UploadAcceptedResponse,
)
from services.repository.service import RepositoryService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.get("", response_model=RepositoryListResponse)
def list_repositories(
    service: RepositoryService = Depends(get_repository_service),
) -> RepositoryListResponse:
    items = [service.to_response(r) for r in service.list_all()]
    return RepositoryListResponse(items=items, total=len(items))


@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(
    repo_id: str,
    service: RepositoryService = Depends(get_repository_service),
) -> RepositoryResponse:
    return service.to_response(service.get(repo_id))


@router.post("/github", response_model=UploadAcceptedResponse, status_code=202)
def upload_github(
    body: GitHubUploadRequest,
    background_tasks: BackgroundTasks,
    service: RepositoryService = Depends(get_repository_service),
    x_github_token: str | None = Header(default=None, alias="X-GitHub-Token"),
) -> UploadAcceptedResponse:
    settings = get_settings()
    token = body.github_token or x_github_token or settings.github_token or None

    record = service.create_github(
        body.url,
        branch=body.branch,
    )
    background_tasks.add_task(
        service.processor.process_github,
        record,
        token=token,
    )
    return UploadAcceptedResponse(
        id=record.id,
        status=record.status,
        message="Repository clone started",
    )


@router.post("/upload/zip", response_model=UploadAcceptedResponse, status_code=202)
async def upload_zip(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str | None = Form(default=None),
    service: RepositoryService = Depends(get_repository_service),
) -> UploadAcceptedResponse:
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise AppException("File must be a .zip archive", code="validation_error")

    settings = get_settings()
    content = await file.read()
    service.validate_upload_size(len(content))

    record = service.create_zip(display_name=name or file.filename.replace(".zip", ""))

    tmp = Path(tempfile.gettempdir()) / f"{record.id}.zip"
    tmp.write_bytes(content)

    background_tasks.add_task(service.processor.process_zip, record, tmp)
    return UploadAcceptedResponse(
        id=record.id,
        status=record.status,
        message="ZIP extraction started",
    )


@router.post("/upload/folder", response_model=UploadAcceptedResponse, status_code=202)
async def upload_folder(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    paths: list[str] = Form(...),
    name: str | None = Form(default=None),
    service: RepositoryService = Depends(get_repository_service),
) -> UploadAcceptedResponse:
    if len(files) != len(paths):
        raise AppException(
            "Each file must have a corresponding path",
            code="validation_error",
        )

    folder_name = name
    if not folder_name and paths:
        root = paths[0].split("/")[0].split("\\")[0]
        folder_name = root or "local-folder"

    record = service.create_folder(name=folder_name)

    file_data: list[tuple[str, bytes]] = []
    total_size = 0
    settings = get_settings()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024

    for upload, rel_path in zip(files, paths):
        data = await upload.read()
        total_size += len(data)
        if total_size > max_bytes:
            raise AppException(
                f"Upload exceeds maximum size ({settings.max_upload_size_mb} MB)",
                code="validation_error",
            )
        file_data.append((rel_path, data))

    background_tasks.add_task(service.processor.process_folder, record, file_data)
    return UploadAcceptedResponse(
        id=record.id,
        status=record.status,
        message="Folder upload started",
    )


@router.delete("/{repo_id}", status_code=204)
def delete_repository(
    repo_id: str,
    service: RepositoryService = Depends(get_repository_service),
) -> None:
    service.delete(repo_id)
