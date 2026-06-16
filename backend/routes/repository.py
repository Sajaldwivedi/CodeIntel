import logging

from fastapi import APIRouter, HTTPException

from models.schemas import (
    CloneRepositoryRequest,
    CloneRepositoryResponse,
    IndexRepositoryRequest,
    IndexRepositoryResponse,
    StructureRepositoryRequest,
    StructureRepositoryResponse,
)
from services.clone_service import clone_repository, list_available_repositories
from services.enhanced_index_service import index_repository_with_structure
from services.structure_service import get_structure_summary

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
        result = index_repository_with_structure(payload.repo_name)
        return IndexRepositoryResponse(
            status="success",
            chunks_indexed=int(result["chunks_indexed"]),
            entities_indexed=int(result["entities_indexed"]),
        )
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


@router.post("/structure", response_model=StructureRepositoryResponse)
def structure_repository_endpoint(payload: StructureRepositoryRequest) -> StructureRepositoryResponse:
    try:
        summary = get_structure_summary(payload.repo_name)
        return StructureRepositoryResponse(
            repo_name=str(summary["repo_name"]),
            classes=int(summary["classes"]),
            functions=int(summary["functions"]),
            methods=int(summary["methods"]),
            imports=int(summary["imports"]),
            sample_entities=list(summary["sample_entities"]),
        )
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
        logger.exception("Repository structure extraction failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
