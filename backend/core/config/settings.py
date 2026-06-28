from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "ai-software-engineer"
    app_env: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    github_token: str = ""
    repos_dir: Path = _PROJECT_ROOT / "data" / "repos"
    data_dir: Path = _PROJECT_ROOT / "data"
    max_upload_size_mb: int = 500
    max_repo_files: int = 50_000

    @property
    def repos_path(self) -> Path:
        return self.repos_dir.resolve()

    @property
    def db_path(self) -> Path:
        return (self.data_dir / "repositories.db").resolve()


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.repos_dir.mkdir(parents=True, exist_ok=True)
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    return settings
