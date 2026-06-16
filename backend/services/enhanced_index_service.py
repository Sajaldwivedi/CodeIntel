import hashlib
import logging
from typing import Any

from parser.metadata_extractor import entity_to_document
from services.chroma_service import query_code_entities, upsert_chunks, upsert_code_entities
from services.embedding_service import embed_query, embed_texts
from services.file_reader import read_code_files
from services.clone_service import resolve_repo_path
from services.structure_service import extract_repository_entities
from utils.chunking import chunk_code_documents

logger = logging.getLogger(__name__)


def index_repository_with_structure(repo_name: str) -> dict[str, int | str]:
    canonical_repo_name, repo_path = resolve_repo_path(repo_name)
    if not repo_path.exists():
        raise FileNotFoundError(f"Repository '{repo_name}' not found in data/repositories")

    _, entities = extract_repository_entities(canonical_repo_name)
    entities_indexed = _index_entities(canonical_repo_name, entities)

    files = read_code_files(repo_path)
    chunks = chunk_code_documents(files)
    chunks_indexed = _index_chunks(canonical_repo_name, chunks)

    logger.info(
        "Index completed for %s: %d entities and %d chunks",
        canonical_repo_name,
        entities_indexed,
        chunks_indexed,
    )

    return {
        "repo_name": canonical_repo_name,
        "entities_indexed": entities_indexed,
        "chunks_indexed": chunks_indexed,
    }


def search_entities(query: str, n_results: int = 8) -> dict[str, Any]:
    query_vector = embed_query(query)
    return query_code_entities(query_embedding=query_vector, n_results=n_results)


def _index_entities(repo_name: str, entities: list[dict[str, Any]]) -> int:
    if not entities:
        return 0

    documents = [entity_to_document(entity) for entity in entities]
    metadatas = [_sanitize_metadata(entity, repo_name) for entity in entities]
    ids = [_build_entity_id(repo_name, entity) for entity in entities]
    embeddings = embed_texts(documents)

    upsert_code_entities(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(entities)


def _index_chunks(repo_name: str, chunks: list[dict[str, str]]) -> int:
    if not chunks:
        return 0

    documents = [chunk["chunk"] for chunk in chunks]
    metadatas = [{"file": chunk["file"], "repo": repo_name} for chunk in chunks]
    ids = [f"{repo_name}:{i}" for i in range(len(chunks))]
    embeddings = embed_texts(documents)

    upsert_chunks(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
    return len(chunks)


def _sanitize_metadata(entity: dict[str, Any], repo_name: str) -> dict[str, Any]:
    metadata: dict[str, Any] = {"repo": repo_name}
    for key, value in entity.items():
        if isinstance(value, (str, int, float, bool)):
            metadata[key] = value
    return metadata


def _build_entity_id(repo_name: str, entity: dict[str, Any]) -> str:
    stable_key = "|".join(
        [
            repo_name,
            str(entity.get("type", "")),
            str(entity.get("file", "")),
            str(entity.get("line", "")),
            str(entity.get("name", "")),
            str(entity.get("class", "")),
            str(entity.get("module", "")),
            str(entity.get("base", "")),
            str(entity.get("caller", "")),
            str(entity.get("callee", "")),
            str(entity.get("relationship", "")),
            str(entity.get("target", "")),
        ]
    )
    digest = hashlib.sha256(stable_key.encode("utf-8")).hexdigest()[:16]
    return f"{repo_name}:entity:{digest}"
