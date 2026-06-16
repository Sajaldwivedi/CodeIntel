import logging

from fastapi import APIRouter, HTTPException

from models.schemas import (
    CloneRepositoryRequest,
    CloneRepositoryResponse,
    IndexRepositoryRequest,
    IndexRepositoryResponse,
)
from services.clone_service import clone_repository, list_available_repositories
from services.rag_service import index_repository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/repository", tags=["repository"])


@router.post("/clone", response_model=CloneRepositoryResponse)
def clone_repository_endpoint(payload: CloneRepositoryRequest) -> CloneRepositoryResponse:
    try:
        repo_name = clone_repository(payload.repo_url)
        return CloneRepositoryResponse(status="success", repository=repo_name)
    except Exception as exc:  # pragma: no cover
        logger.exception("Repository clone failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/index", response_model=IndexRepositoryResponse)
def index_repository_endpoint(payload: IndexRepositoryRequest) -> IndexRepositoryResponse:
    try:
        chunks_indexed = index_repository(payload.repo_name)
        return IndexRepositoryResponse(status="success", chunks_indexed=chunks_indexed)
    except FileNotFoundError as exc:
        available_repos = list_available_repositories()
        raise HTTPException(
            status_code=404,
            detail={
                "message": str(exc),
                "available_repositories": available_repos,
            },
        ) from exc
    except Exception as exc:  # pragma: no cover
        logger.exception("Repository indexing failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
