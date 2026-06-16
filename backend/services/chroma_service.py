from pathlib import Path
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CHROMA_PATH = PROJECT_ROOT / "embeddings" / "chroma_db"
COLLECTION_NAME = "github_codebase"


def get_collection() -> Collection:
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return client.get_or_create_collection(name=COLLECTION_NAME)


def upsert_chunks(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    collection = get_collection()
    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def query_chunks(query_embedding: list[float], n_results: int = 5) -> dict[str, Any]:
    collection = get_collection()
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )
