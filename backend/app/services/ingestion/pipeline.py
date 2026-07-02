"""Ingestion pipeline orchestrator."""

from __future__ import annotations

import asyncio
import logging
import shutil
from pathlib import Path
from typing import Any

from app.core.config import Settings
from app.middleware.error_handler import AppError, ValidationError
from app.services.ingestion.clone import clone_repository, extract_zip_archive
from app.services.ingestion.filter import scan_repository
from app.services.ingestion.github import (
    GitHubRepoMetadata,
    ParsedGitHubUrl,
    build_clone_url,
    fetch_repo_metadata,
    parse_github_url,
)
from app.services.ingestion.parse_store import load_parse_results, parse_output_dir, save_parse_results
from app.services.ingestion.store import IngestionJob, IngestionStage, get_ingestion_store

logger = logging.getLogger(__name__)


class IngestionPipeline:
    """Runs the full repository ingestion pipeline."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._store = get_ingestion_store()
        self._workspace = settings.ingestion_workspace_path

    async def start_github_ingestion(
        self,
        *,
        url: str,
        token: str | None = None,
    ) -> IngestionJob:
        parsed = parse_github_url(url)
        job = await self._store.create_job(
            source="github",
            owner=parsed.owner,
            name=parsed.name,
        )
        asyncio.create_task(self._run_github(job, parsed, token))
        return job

    async def start_zip_ingestion(
        self,
        *,
        archive_path: Path,
        owner: str,
        name: str,
    ) -> IngestionJob:
        job = await self._store.create_job(source="zip", owner=owner, name=name)
        asyncio.create_task(self._run_zip(job, archive_path))
        return job

    async def _run_github(
        self,
        job: IngestionJob,
        parsed: ParsedGitHubUrl,
        token: str | None,
    ) -> None:
        work_dir = self._workspace / job.id
        try:
            job.update(
                stage=IngestionStage.VALIDATING,
                message="Validating repository URL…",
            )
            metadata = await fetch_repo_metadata(parsed, token=token)
            if metadata.is_private and not token:
                raise ValidationError(
                    "This is a private repository. Provide a GitHub personal access token.",
                )

            job.update(
                stage=IngestionStage.CLONING,
                message=f"Cloning {metadata.full_name}…",
                metadata={
                    "description": metadata.description,
                    "default_branch": metadata.default_branch,
                    "stars": metadata.stars,
                    "forks": metadata.forks,
                },
            )

            clone_url = build_clone_url(metadata.clone_url, token)
            commit_hash = await clone_repository(
                clone_url,
                work_dir,
                branch=metadata.default_branch,
            )

            await self._scan_and_finalize(
                job,
                work_dir,
                branch=metadata.default_branch,
                commit_hash=commit_hash,
                github_metadata=metadata,
            )
        except AppError as exc:
            logger.warning("ingestion_failed job=%s error=%s", job.id, exc.message)
            job.update(stage=IngestionStage.FAILED, error=exc.message, message="Ingestion failed")
        except Exception:
            logger.exception("ingestion_unexpected job=%s", job.id)
            job.update(
                stage=IngestionStage.FAILED,
                error="An unexpected error occurred during ingestion.",
                message="Ingestion failed",
            )
        finally:
            self._cleanup_work_dir(work_dir)

    async def _run_zip(self, job: IngestionJob, archive_path: Path) -> None:
        work_dir = self._workspace / job.id
        try:
            job.update(
                stage=IngestionStage.VALIDATING,
                message="Validating archive…",
            )
            if not archive_path.exists():
                raise ValidationError("Uploaded archive was not found.")

            job.update(
                stage=IngestionStage.CLONING,
                message="Extracting archive…",
            )
            await extract_zip_archive(archive_path, work_dir)

            await self._scan_and_finalize(
                job,
                work_dir,
                branch="upload",
                commit_hash="uploaded",
                github_metadata=None,
            )
        except AppError as exc:
            job.update(stage=IngestionStage.FAILED, error=exc.message, message="Ingestion failed")
        except Exception:
            logger.exception("zip_ingestion_unexpected job=%s", job.id)
            job.update(
                stage=IngestionStage.FAILED,
                error="An unexpected error occurred during ingestion.",
                message="Ingestion failed",
            )
        finally:
            archive_path.unlink(missing_ok=True)
            self._cleanup_work_dir(work_dir)

    async def _scan_and_finalize(
        self,
        job: IngestionJob,
        work_dir: Path,
        *,
        branch: str,
        commit_hash: str,
        github_metadata: GitHubRepoMetadata | None,
    ) -> None:
        job.update(stage=IngestionStage.PARSING, message="Parsing code with Tree-sitter…")
        scan = await asyncio.to_thread(scan_repository, work_dir)

        if scan.file_count == 0:
            raise ValidationError(
                "No code files were found after filtering. "
                "The repository may only contain ignored directories.",
            )

        file_entries = [(f.path, f.language) for f in scan.files]
        parsed_files, chunks, parse_summary = await asyncio.to_thread(
            _run_tree_sitter_parse,
            work_dir,
            file_entries,
            job.id,
            parse_output_dir(self._settings.ingestion_workspace_path),
        )

        job.update(
            progress=65,
            message=f"Parsed {parse_summary.files_parsed} files into {parse_summary.chunk_count} semantic chunks…",
        )

        job.update(
            stage=IngestionStage.INDEXING,
            progress=75,
            message=f"Indexed {parse_summary.symbol_count} symbols across {parse_summary.files_parsed} files…",
        )
        await asyncio.sleep(0.3)

        job.update(
            stage=IngestionStage.EMBEDDING,
            progress=90,
            message="Preparing embedding pipeline (skipped — no AI wired yet)…",
        )
        await asyncio.sleep(0.4)

        languages = scan.language_percentages()
        result_metadata: dict[str, Any] = {
            "owner": job.owner,
            "name": job.name,
            "branch": branch,
            "commit_hash": commit_hash,
            "file_count": scan.file_count,
            "total_size_bytes": scan.total_size_bytes,
            "languages": languages,
            "primary_language": scan.primary_language,
            "chunk_count": parse_summary.chunk_count,
            "symbol_count": parse_summary.symbol_count,
            "api_endpoint_count": parse_summary.api_endpoint_count,
            "files_parsed": parse_summary.files_parsed,
            "description": (
                github_metadata.description
                if github_metadata
                else f"Uploaded archive for {job.owner}/{job.name}"
            ),
            "stars": github_metadata.stars if github_metadata else 0,
            "forks": github_metadata.forks if github_metadata else 0,
        }

        job.update(
            stage=IngestionStage.COMPLETED,
            progress=100,
            message=f"Successfully ingested {scan.file_count} files ({parse_summary.chunk_count} chunks).",
            metadata=result_metadata,
        )

    def _cleanup_work_dir(self, work_dir: Path) -> None:
        if work_dir.exists():
            shutil.rmtree(work_dir, ignore_errors=True)


def _run_tree_sitter_parse(
    work_dir: Path,
    file_entries: list[tuple[str, str]],
    job_id: str,
    parse_output_dir: Path,
):
    from services.parser import ParserService

    parser = ParserService()
    parsed_files, chunks, summary = parser.parse_repository(work_dir, file_entries)
    save_parse_results(
        parse_output_dir,
        job_id,
        parsed_files,
        extra={
            "chunk_count": summary.chunk_count,
            "symbol_count": summary.symbol_count,
            "api_endpoint_count": summary.api_endpoint_count,
            "files_parsed": summary.files_parsed,
            "files_skipped": summary.files_skipped,
        },
    )
    return parsed_files, chunks, summary
