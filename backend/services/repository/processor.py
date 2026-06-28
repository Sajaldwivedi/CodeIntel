import logging
import shutil
from datetime import datetime, timezone
from pathlib import Path

from git import Repo

from core.exceptions.app_exceptions import AppException
from models.enums.index_status import IndexStatus
from models.enums.upload_source import UploadSource
from repositories.github.cloner import FolderWriter, GitHubCloner, ZipExtractor
from repositories.storage.repository_store import RepositoryRecord, RepositoryStore
from services.repository.scanner import RepositoryScanner
from services.repository.validator import RepositoryValidator

logger = logging.getLogger(__name__)


class RepositoryProcessor:
    STAGE_PROGRESS = {
        IndexStatus.VALIDATING: 10,
        IndexStatus.CLONING: 30,
        IndexStatus.EXTRACTING: 30,
        IndexStatus.SCANNING: 70,
        IndexStatus.READY: 100,
    }

    def __init__(
        self,
        store: RepositoryStore,
        validator: RepositoryValidator,
        scanner: RepositoryScanner,
        cloner: GitHubCloner,
        zip_extractor: ZipExtractor,
        folder_writer: FolderWriter,
    ):
        self._store = store
        self._validator = validator
        self._scanner = scanner
        self._cloner = cloner
        self._zip_extractor = zip_extractor
        self._folder_writer = folder_writer

    def _update_status(
        self,
        record: RepositoryRecord,
        status: IndexStatus,
        stage: str,
        progress: int | None = None,
    ) -> RepositoryRecord:
        record.status = status
        record.current_stage = stage
        record.progress = progress if progress is not None else self.STAGE_PROGRESS.get(status, 0)
        self._store.update(record)
        return record

    def _fail(self, record: RepositoryRecord, message: str) -> None:
        record.status = IndexStatus.FAILED
        record.error_message = message
        record.current_stage = "Failed"
        record.progress = 0
        self._store.update(record)
        logger.error("Repository %s failed: %s", record.id, message)

    def process_github(
        self,
        record: RepositoryRecord,
        *,
        token: str | None = None,
    ) -> None:
        try:
            self._update_status(record, IndexStatus.VALIDATING, "Validating repository URL")
            root = Path(record.local_path)

            self._update_status(record, IndexStatus.CLONING, "Cloning from GitHub")
            branch, commit = self._cloner.clone(
                record.url or "",
                root,
                branch=record.branch,
                token=token,
            )
            record.branch = branch
            record.commit_hash = commit

            self._finalize(record, root)
        except AppException as exc:
            self._fail(record, exc.message)
        except Exception as exc:
            self._fail(record, str(exc))

    def process_zip(self, record: RepositoryRecord, zip_path: Path) -> None:
        try:
            self._update_status(record, IndexStatus.VALIDATING, "Validating ZIP archive")
            self._validator.validate_zip_size(zip_path.stat().st_size)

            root = Path(record.local_path)
            self._update_status(record, IndexStatus.EXTRACTING, "Extracting ZIP archive")
            self._zip_extractor.extract(zip_path, root)

            self._apply_git_info(record, root)
            self._finalize(record, root)
        except AppException as exc:
            self._fail(record, exc.message)
        except Exception as exc:
            self._fail(record, str(exc))

    def process_folder(
        self,
        record: RepositoryRecord,
        files: list[tuple[str, bytes]],
    ) -> None:
        try:
            self._update_status(record, IndexStatus.VALIDATING, "Validating uploaded files")

            root = Path(record.local_path)
            self._update_status(record, IndexStatus.EXTRACTING, "Writing files to storage")
            self._folder_writer.write_files(root, files)

            self._apply_git_info(record, root)
            self._finalize(record, root)
        except AppException as exc:
            self._fail(record, exc.message)
        except Exception as exc:
            self._fail(record, str(exc))

    def _apply_git_info(self, record: RepositoryRecord, root: Path) -> None:
        git_dir = root / ".git"
        if not git_dir.exists():
            return
        try:
            repo = Repo(root)
            if not repo.head.is_detached:
                record.branch = repo.active_branch.name
            record.commit_hash = repo.head.commit.hexsha
            self._store.update(record)
        except Exception:
            pass

    def _finalize(self, record: RepositoryRecord, root: Path) -> None:
        self._update_status(record, IndexStatus.VALIDATING, "Validating repository contents")
        self._validator.validate_path(root)

        self._update_status(record, IndexStatus.SCANNING, "Scanning files and languages")
        scan = self._scanner.scan(root)

        record.file_count = scan.file_count
        record.total_size_bytes = scan.total_size_bytes
        record.primary_language = scan.primary_language
        record.languages = scan.languages
        record.status = IndexStatus.READY
        record.current_stage = "Ready"
        record.progress = 100
        record.ready_at = datetime.now(timezone.utc)
        record.error_message = None
        self._store.update(record)
        logger.info("Repository %s ready: %d files", record.id, record.file_count)

    def delete_local_files(self, record: RepositoryRecord) -> None:
        root = Path(record.local_path)
        if root.exists():
            shutil.rmtree(root, ignore_errors=True)
