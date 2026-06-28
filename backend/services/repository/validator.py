from pathlib import Path

from core.config.settings import Settings
from core.exceptions.app_exceptions import ValidationError


class RepositoryValidator:
    def __init__(self, settings: Settings):
        self._settings = settings

    def validate_path(self, root: Path) -> None:
        if not root.exists():
            raise ValidationError("Repository path does not exist")

        if not any(root.iterdir()):
            raise ValidationError("Repository is empty")

        file_count = sum(1 for _ in root.rglob("*") if _.is_file())
        if file_count == 0:
            raise ValidationError("No files found in repository")

        if file_count > self._settings.max_repo_files:
            raise ValidationError(
                f"Repository exceeds maximum file count ({self._settings.max_repo_files})"
            )

        total_size = sum(f.stat().st_size for f in root.rglob("*") if f.is_file())
        max_bytes = self._settings.max_upload_size_mb * 1024 * 1024
        if total_size > max_bytes:
            raise ValidationError(
                f"Repository exceeds maximum size ({self._settings.max_upload_size_mb} MB)"
            )

    def validate_zip_size(self, size_bytes: int) -> None:
        max_bytes = self._settings.max_upload_size_mb * 1024 * 1024
        if size_bytes > max_bytes:
            raise ValidationError(
                f"ZIP file exceeds maximum size ({self._settings.max_upload_size_mb} MB)"
            )
