from pathlib import Path

from core.config.settings import Settings
from core.exceptions.app_exceptions import NotFoundError
from models.enums.upload_source import UploadSource
from repositories.github.cloner import FolderWriter, GitHubCloner, ZipExtractor
from repositories.storage.repository_store import RepositoryRecord, RepositoryStore
from schemas.responses.repository import LanguageStat, RepositoryResponse
from services.repository.processor import RepositoryProcessor
from services.repository.scanner import RepositoryScanner
from services.repository.validator import RepositoryValidator


class RepositoryService:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._store = RepositoryStore(settings)
        self._validator = RepositoryValidator(settings)
        self._scanner = RepositoryScanner()
        self._cloner = GitHubCloner()
        self._zip_extractor = ZipExtractor()
        self._folder_writer = FolderWriter()
        self._processor = RepositoryProcessor(
            self._store,
            self._validator,
            self._scanner,
            self._cloner,
            self._zip_extractor,
            self._folder_writer,
        )

    @property
    def processor(self) -> RepositoryProcessor:
        return self._processor

    def _repo_path(self, repo_id: str) -> Path:
        return self._settings.repos_path / repo_id

    def create_github(
        self,
        url: str,
        *,
        branch: str | None = None,
        description: str | None = None,
    ) -> RepositoryRecord:
        owner, name = self._cloner.parse_url(url)
        record = self._store.create(
            name=name,
            owner=owner,
            source=UploadSource.GITHUB,
            local_path=self._repo_path("pending"),
            url=url.rstrip("/"),
            branch=branch,
            description=description,
        )
        final_path = self._repo_path(record.id)
        record.local_path = str(final_path)
        self._store.update(record)
        return record

    def create_zip(self, display_name: str | None = None) -> RepositoryRecord:
        name = display_name or "uploaded-repo"
        record = self._store.create(
            name=name,
            owner="local",
            source=UploadSource.ZIP,
            local_path=str(self._repo_path("pending")),
        )
        final_path = self._repo_path(record.id)
        record.local_path = str(final_path)
        self._store.update(record)
        return record

    def create_folder(self, name: str | None = None) -> RepositoryRecord:
        folder_name = name or "local-folder"
        record = self._store.create(
            name=folder_name,
            owner="local",
            source=UploadSource.FOLDER,
            local_path=str(self._repo_path("pending")),
        )
        final_path = self._repo_path(record.id)
        record.local_path = str(final_path)
        self._store.update(record)
        return record

    def get(self, repo_id: str) -> RepositoryRecord:
        record = self._store.get(repo_id)
        if not record:
            raise NotFoundError(f"Repository {repo_id} not found")
        return record

    def list_all(self) -> list[RepositoryRecord]:
        return self._store.list_all()

    def delete(self, repo_id: str) -> None:
        record = self.get(repo_id)
        self._processor.delete_local_files(record)
        self._store.delete(repo_id)

    def validate_upload_size(self, size_bytes: int) -> None:
        self._validator.validate_zip_size(size_bytes)

    @staticmethod
    def to_response(record: RepositoryRecord) -> RepositoryResponse:
        languages = [
            LanguageStat(
                language=item["language"],
                percentage=item["percentage"],
                bytes=item["bytes"],
                files=item["files"],
            )
            for item in record.languages
        ]
        return RepositoryResponse(
            id=record.id,
            name=record.name,
            owner=record.owner,
            source=record.source,
            url=record.url,
            branch=record.branch,
            commit_hash=record.commit_hash,
            status=record.status,
            progress=record.progress,
            current_stage=record.current_stage,
            file_count=record.file_count,
            total_size_bytes=record.total_size_bytes,
            primary_language=record.primary_language,
            languages=languages,
            description=record.description,
            error_message=record.error_message,
            created_at=record.created_at,
            updated_at=record.updated_at,
            ready_at=record.ready_at,
        )
