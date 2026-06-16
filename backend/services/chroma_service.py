from pathlib import Path
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CHROMA_PATH = PROJECT_ROOT / "embeddings" / "chroma_db"
COLLECTION_NAME = "github_codebase"
CODE_ENTITIES_COLLECTION_NAME = "code_entities"


def get_collection(name: str = COLLECTION_NAME) -> Collection:
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return client.get_or_create_collection(name=name)


def _upsert(
    collection_name: str,
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    collection = get_collection(collection_name)
    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def _query(
    collection_name: str,
    query_embedding: list[float],
    n_results: int,
) -> dict[str, Any]:
    collection = get_collection(collection_name)
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )


def upsert_chunks(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    _upsert(
        collection_name=COLLECTION_NAME,
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def query_chunks(query_embedding: list[float], n_results: int = 5) -> dict[str, Any]:
    return _query(
        collection_name=COLLECTION_NAME,
        query_embedding=query_embedding,
        n_results=n_results,
    )


def upsert_code_entities(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    _upsert(
        collection_name=CODE_ENTITIES_COLLECTION_NAME,
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def query_code_entities(query_embedding: list[float], n_results: int = 8) -> dict[str, Any]:
    return _query(
        collection_name=CODE_ENTITIES_COLLECTION_NAME,
        query_embedding=query_embedding,
        n_results=n_results,
    )
