"""Application configuration via ``pydantic-settings``.

All configuration is sourced from environment variables (or a local ``.env``
file). Settings are cached so the object is constructed once per process.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Repo-root ``.env`` (works when cwd is ``backend/`` or repo root).
_REPO_ROOT = Path(__file__).resolve().parents[3]
_ENV_FILES = (str(_REPO_ROOT / ".env"), ".env")


class Settings(BaseSettings):
    """Strongly-typed application settings.

    Environment variables are matched case-insensitively to field names, e.g.
    ``NEO4J_URI`` populates :attr:`neo4j_uri`.
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILES,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Application ---
    app_name: str = "AI Software Engineer for GitHub Repositories"
    app_version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    enable_docs: bool = True
    log_level: str = "INFO"

    # CORS origins. Provide as a JSON array in the environment, e.g.
    # CORS_ORIGINS='["http://localhost:5173"]'.
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    # --- Neo4j (graph database) ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"

    # --- ChromaDB (vector database) ---
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_use_http: bool = False
    chroma_collection: str = "repo_embeddings"
    chroma_persistent_path: str = "../data/chroma"

    # --- Embeddings ---
    # Active embedding backend: "jina" (default) or "openai".
    embedding_provider: str = "jina"
    embedding_batch_size: int = 64
    class_line_threshold: int = 80

    # --- Jina embeddings (primary provider) ---
    jina_api_key: str | None = None
    jina_embedding_model: str = "jina-embeddings-v3"
    jina_batch_size: int = 64
    jina_api_url: str = "https://api.jina.ai/v1/embeddings"
    jina_timeout_seconds: float = 60.0
    jina_max_retries: int = 3
    # Optional Matryoshka output size; None uses the model default (1024).
    jina_dimensions: int | None = None

    # --- Repository ingestion ---
    # Outside ``backend/`` so uvicorn --reload does not restart mid-clone.
    ingestion_workspace_dir: str = "../data/ingestion"

    # --- LLM provider abstraction (answer generation; no logic wired yet) ---
    llm_provider: str = "openai"
    openai_api_key: str | None = None
    # Retained for the answering LLM only — not used for embeddings.
    gemini_api_key: str | None = None

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def ingestion_workspace_path(self) -> Path:
        """Absolute path to the ingestion working directory."""
        path = Path(self.ingestion_workspace_dir)
        if not path.is_absolute():
            path = (Path.cwd() / path).resolve()
        return path

    @property
    def chroma_persistent_path_resolved(self) -> Path:
        path = Path(self.chroma_persistent_path)
        if not path.is_absolute():
            path = (Path.cwd() / path).resolve()
        return path

    @property
    def embedding_manifest_dir(self) -> Path:
        return self.ingestion_workspace_path.parent / "embeddings" / "manifests"


@lru_cache
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance."""
    return Settings()
