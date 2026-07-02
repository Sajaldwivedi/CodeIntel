"""Tests for semantic embedding pipeline."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from services.embeddings.manifest import RepoManifest, diff_files, load_manifest, save_manifest
from services.embeddings.models import SemanticChunk
from services.embeddings.semantic_chunks import build_semantic_chunks, chunk_content_hash, file_content_hash
from services.parser.models import FileMetadata, ParsedClass, ParsedFile, ParsedFunction, ParsedImport, Parameter


SAMPLE_SOURCE = '''\
"""Service module."""
import os
from fastapi import APIRouter

router = APIRouter()
CONFIG = {"debug": True}

def top_level_helper(value: int) -> int:
    """Double a value."""
    return value * 2

class UserService:
    """User operations."""

    def get(self, user_id: int) -> dict:
        return {"id": user_id}

    def delete(self, user_id: int) -> None:
        if user_id < 0:
            raise ValueError("bad id")
'''


def _parsed_file() -> ParsedFile:
    return ParsedFile(
        file="app/service.py",
        language="Python",
        imports=[
            ParsedImport(module="os", names=["os"], is_external=True, start_line=2),
            ParsedImport(module="fastapi", names=["APIRouter"], is_external=True, start_line=3),
        ],
        functions=[
            ParsedFunction(
                name="top_level_helper",
                parameters=[Parameter(name="value", type="int")],
                return_type="int",
                start_line=9,
                end_line=11,
                docstring="Double a value.",
            )
        ],
        classes=[
            ParsedClass(
                name="UserService",
                methods=[
                    ParsedFunction(
                        name="get",
                        parameters=[Parameter(name="user_id", type="int")],
                        return_type="dict",
                        start_line=16,
                        end_line=17,
                        is_method=True,
                        class_name="UserService",
                    ),
                    ParsedFunction(
                        name="delete",
                        parameters=[Parameter(name="user_id", type="int")],
                        return_type="None",
                        start_line=19,
                        end_line=21,
                        is_method=True,
                        class_name="UserService",
                    ),
                ],
                bases=[],
                attributes=[],
                start_line=13,
                end_line=21,
                docstring="User operations.",
            )
        ],
        metadata=FileMetadata(complexity="low", lines=22, symbol_count=3),
    )


class TestSemanticChunks:
    def test_builds_function_method_and_module_chunks(self) -> None:
        parsed = _parsed_file()
        # Large threshold forces per-method chunks instead of whole-class chunk.
        chunks = build_semantic_chunks(parsed, SAMPLE_SOURCE, repo_id="acme/app", class_line_threshold=5)
        types = {c.chunk_type for c in chunks}
        assert "function" in types
        assert "method" in types
        assert "module" in types

    def test_chunks_include_imports_context(self) -> None:
        parsed = _parsed_file()
        chunks = build_semantic_chunks(parsed, SAMPLE_SOURCE, repo_id="acme/app")
        assert all("fastapi" in c.imports_context for c in chunks)
        assert all(c.document.startswith("# File:") for c in chunks)

    def test_content_hash_is_stable(self) -> None:
        h1 = chunk_content_hash("repo", "f.py", "fn", "code", 1)
        h2 = chunk_content_hash("repo", "f.py", "fn", "code", 1)
        assert h1 == h2
        assert h1 != chunk_content_hash("repo", "f.py", "fn", "code2", 1)

    def test_small_class_becomes_single_chunk(self) -> None:
        parsed = _parsed_file()
        chunks = build_semantic_chunks(parsed, SAMPLE_SOURCE, repo_id="acme/app", class_line_threshold=80)
        class_chunks = [c for c in chunks if c.chunk_type == "class"]
        method_chunks = [c for c in chunks if c.chunk_type == "method"]
        assert len(class_chunks) == 1
        assert len(method_chunks) == 0


class TestManifest:
    def test_diff_detects_changed_and_removed_files(self) -> None:
        prev = {"a.py": "hash1", "b.py": "hash2"}
        curr = {"a.py": "hash1", "b.py": "hash3", "c.py": "hash4"}
        unchanged, changed, removed = diff_files(prev, curr)
        assert unchanged == {"a.py"}
        assert changed == {"b.py", "c.py"}
        assert removed == set()

    def test_save_and_load_manifest(self, tmp_path: Path) -> None:
        manifest = RepoManifest(repo_id="acme/app", files={"main.py": "abc"}, chunk_ids=["id1"])
        save_manifest(tmp_path, manifest)
        loaded = load_manifest(tmp_path, "acme/app")
        assert loaded is not None
        assert loaded.files["main.py"] == "abc"


class TestEmbeddingIndexer:
    def test_incremental_index_skips_unchanged(self, tmp_path: Path) -> None:
        from services.embeddings.indexer import EmbeddingIndexer

        parsed = _parsed_file()
        sources = {"app/service.py": SAMPLE_SOURCE}
        manifest_dir = tmp_path / "manifests"
        chroma_path = tmp_path / "chroma"

        mock_provider = MagicMock()
        mock_provider.name = "openai"
        mock_provider.embed_texts.side_effect = lambda texts: [[0.1, 0.2, 0.3] for _ in texts]

        with patch("services.embeddings.indexer.create_embedding_provider", return_value=mock_provider):
            indexer = EmbeddingIndexer(
                provider_name="openai",
                openai_api_key="test-key",
                chroma_persistent_path=chroma_path,
                manifest_dir=manifest_dir,
                batch_size=16,
            )
            summary1 = indexer.index_repository("acme/app", [parsed], sources)
            assert summary1.chunks_indexed > 0
            assert mock_provider.embed_texts.call_count >= 1

            calls_after_first = mock_provider.embed_texts.call_count
            summary2 = indexer.index_repository("acme/app", [parsed], sources)
            assert summary2.chunks_indexed == 0
            assert summary2.chunks_embedded > 0
            assert summary2.files_unchanged == 1
            assert mock_provider.embed_texts.call_count == calls_after_first

    def test_resumes_partial_embedding_when_files_unchanged(self, tmp_path: Path) -> None:
        from services.embeddings.indexer import EmbeddingIndexer

        parsed = _parsed_file()
        sources = {"app/service.py": SAMPLE_SOURCE}
        manifest_dir = tmp_path / "manifests"
        chroma_path = tmp_path / "chroma"

        call_count = {"n": 0}

        def embed_side_effect(texts: list[str]) -> list[list[float]]:
            call_count["n"] += 1
            if call_count["n"] <= 6:
                raise RuntimeError("429 quota exceeded")
            return [[0.1, 0.2, 0.3] for _ in texts]

        mock_provider = MagicMock()
        mock_provider.name = "openai"
        mock_provider.embed_texts.side_effect = embed_side_effect

        with patch("services.embeddings.indexer.create_embedding_provider", return_value=mock_provider):
            with patch("services.embeddings.indexer.time.sleep"):
                indexer = EmbeddingIndexer(
                    provider_name="openai",
                    openai_api_key="test-key",
                    chroma_persistent_path=chroma_path,
                    manifest_dir=manifest_dir,
                    batch_size=64,
                    rate_limit_retries=6,
                )
                with pytest.raises(RuntimeError):
                    indexer.index_repository("acme/app", [parsed], sources)

                summary = indexer.index_repository("acme/app", [parsed], sources)
                assert summary.chunks_indexed > 0
                assert summary.chunks_embedded == summary.chunks_total

    def test_changed_file_triggers_reindex(self, tmp_path: Path) -> None:
        from services.embeddings.indexer import EmbeddingIndexer

        parsed = _parsed_file()
        sources_v1 = {"app/service.py": SAMPLE_SOURCE}
        sources_v2 = {"app/service.py": SAMPLE_SOURCE + "\n# changed\n"}
        manifest_dir = tmp_path / "manifests"
        chroma_path = tmp_path / "chroma"

        mock_provider = MagicMock()
        mock_provider.name = "openai"
        mock_provider.embed_texts.side_effect = lambda texts: [[0.1, 0.2, 0.3] for _ in texts]

        with patch("services.embeddings.indexer.create_embedding_provider", return_value=mock_provider):
            indexer = EmbeddingIndexer(
                provider_name="openai",
                openai_api_key="test-key",
                chroma_persistent_path=chroma_path,
                manifest_dir=manifest_dir,
            )
            indexer.index_repository("acme/app", [parsed], sources_v1)
            first_calls = mock_provider.embed_texts.call_count
            summary = indexer.index_repository("acme/app", [parsed], sources_v2)
            assert summary.files_changed == 1
            assert mock_provider.embed_texts.call_count > first_calls


class TestGeminiProvider:
    def test_parses_single_embedding(self) -> None:
        from services.embeddings.providers.gemini_provider import GeminiEmbeddingProvider

        vectors = GeminiEmbeddingProvider._parse_embedding_response(
            {"embedding": [0.1, 0.2, 0.3]},
            expected=1,
        )
        assert vectors == [[0.1, 0.2, 0.3]]

    def test_parses_batch_embeddings(self) -> None:
        from services.embeddings.providers.gemini_provider import GeminiEmbeddingProvider

        vectors = GeminiEmbeddingProvider._parse_embedding_response(
            {"embedding": [[0.1, 0.2], [0.3, 0.4]]},
            expected=2,
        )
        assert vectors == [[0.1, 0.2], [0.3, 0.4]]


class TestChromaMetadata:
    def test_chunk_maps_to_schema(self) -> None:
        from services.embeddings.chroma_store import _chroma_metadata

        chunk = SemanticChunk(
            repo_id="acme/app",
            file_path="main.py",
            language="Python",
            chunk_type="function",
            class_name=None,
            function_name="main",
            symbol="main",
            code="def main(): pass",
            document="# doc",
            start_line=1,
            end_line=1,
            imports_context="import os",
            tags=["function"],
            content_hash=chunk_content_hash("acme/app", "main.py", "main", "def main(): pass", 1),
        )
        meta = _chroma_metadata(chunk)
        assert meta["repo_id"] == "acme/app"
        assert meta["file"] == "main.py"
        assert meta["function"] == "main"
        assert meta["type"] == "function"
        assert meta["language"] == "Python"
