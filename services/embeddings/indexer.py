"""Repository embedding indexer."""

from __future__ import annotations

import logging
from pathlib import Path
import time

from services.embeddings.chroma_store import ChromaEmbeddingStore
from services.embeddings.manifest import (
    RepoManifest,
    diff_files,
    load_manifest,
    save_manifest,
)
from services.embeddings.models import IndexSummary, SemanticChunk
from services.embeddings.providers import create_embedding_provider
from services.embeddings.semantic_chunks import build_repository_chunks, file_content_hash
from services.parser.models import ParsedFile

logger = logging.getLogger(__name__)


class EmbeddingIndexer:
    """Index semantic code chunks into ChromaDB with incremental updates."""

    def __init__(
        self,
        *,
        provider_name: str,
        openai_api_key: str | None = None,
        gemini_api_key: str | None = None,
        gemini_model: str = "models/gemini-embedding-001",
        gemini_request_delay_seconds: float = 2.0,
        chroma_host: str | None = None,
        chroma_port: int | None = None,
        chroma_persistent_path: Path | None = None,
        collection_name: str = "repo_embeddings",
        manifest_dir: Path | None = None,
        batch_size: int = 32,
        class_line_threshold: int = 80,
        rate_limit_retries: int = 6,
        gemini_max_retries: int = 8,
    ) -> None:
        self._provider = create_embedding_provider(
            provider_name,
            openai_api_key=openai_api_key,
            gemini_api_key=gemini_api_key,
            gemini_model=gemini_model,
            gemini_request_delay_seconds=gemini_request_delay_seconds,
            gemini_max_retries=gemini_max_retries,
        )
        self._store = ChromaEmbeddingStore(
            host=chroma_host,
            port=chroma_port,
            persistent_path=chroma_persistent_path,
            collection_name=collection_name,
        )
        self._manifest_dir = manifest_dir or Path("data/embeddings/manifests")
        self._batch_size = batch_size
        self._class_line_threshold = class_line_threshold
        self._rate_limit_retries = rate_limit_retries

    def index_repository(
        self,
        repo_id: str,
        parsed_files: list[ParsedFile],
        sources: dict[str, str],
    ) -> IndexSummary:
        """Embed and store chunks, re-indexing only changed files."""
        current_hashes = {pf.file: file_content_hash(sources[pf.file]) for pf in parsed_files if pf.file in sources}
        previous = load_manifest(self._manifest_dir, repo_id)
        prev_files = previous.files if previous else {}

        unchanged, changed, removed = diff_files(prev_files, current_hashes)

        deleted = 0
        for file_path in removed | changed:
            deleted += self._store.delete_repo_file(repo_id, file_path)

        all_chunks = build_repository_chunks(
            repo_id,
            parsed_files,
            sources,
            class_line_threshold=self._class_line_threshold,
        )

        existing_ids = self._store.get_existing_ids(repo_id)
        new_chunks = [c for c in all_chunks if c.content_hash not in existing_ids]

        indexed = self._embed_and_upsert(new_chunks, repo_id, current_hashes)
        skipped = len(all_chunks) - len(new_chunks)
        final_ids = self._store.get_existing_ids(repo_id)

        manifest = RepoManifest(
            repo_id=repo_id,
            files=current_hashes,
            chunk_ids=sorted(final_ids),
        )
        save_manifest(self._manifest_dir, manifest)

        pending_files = {chunk.file_path for chunk in new_chunks}

        return IndexSummary(
            repo_id=repo_id,
            chunks_indexed=indexed,
            chunks_skipped=skipped,
            chunks_deleted=deleted,
            files_processed=len(pending_files),
            files_unchanged=len(unchanged),
            files_changed=len(changed),
            files_removed=len(removed),
            provider=self._provider.name,
            collection=self._store.collection.name,
            chunks_total=len(all_chunks),
        )

    def _embed_and_upsert(
        self,
        chunks: list[SemanticChunk],
        repo_id: str,
        file_hashes: dict[str, str],
    ) -> int:
        if not chunks:
            return 0
        total = 0
        indexed_ids: list[str] = list(self._store.get_existing_ids(repo_id))
        batch_attempts = self._rate_limit_retries
        for i in range(0, len(chunks), self._batch_size):
            batch = chunks[i : i + self._batch_size]
            texts = [chunk.document for chunk in batch]
            vectors: list[list[float]] | None = None
            for attempt in range(batch_attempts):
                try:
                    vectors = self._provider.embed_texts(texts)
                    break
                except Exception as exc:
                    if attempt < batch_attempts - 1 and self._is_rate_limit(exc):
                        wait = 25.0 * (attempt + 1)
                        logger.warning(
                            "embedding_rate_limit batch_start=%d attempt=%d wait=%.0fs",
                            i,
                            attempt + 1,
                            wait,
                        )
                        time.sleep(wait)
                        continue
                    logger.exception("embedding_batch_failed batch_start=%d batch_size=%d", i, len(batch))
                    save_manifest(
                        self._manifest_dir,
                        RepoManifest(repo_id=repo_id, files=file_hashes, chunk_ids=sorted(set(indexed_ids))),
                    )
                    raise
            if vectors is None:
                raise RuntimeError("embedding batch failed without vectors")
            total += self._store.upsert_chunks(batch, vectors)
            indexed_ids.extend(chunk.content_hash for chunk in batch)
            save_manifest(
                self._manifest_dir,
                RepoManifest(repo_id=repo_id, files=file_hashes, chunk_ids=sorted(set(indexed_ids))),
            )
        return total

    @staticmethod
    def _is_rate_limit(exc: Exception) -> bool:
        message = str(exc).lower()
        return (
            "429" in message
            or "resourceexhausted" in message
            or "rate_limit" in message
            or "quota" in message
        )
