import logging
import os
from pathlib import Path
from typing import Any

import google.generativeai as genai

from services.clone_service import resolve_repo_path
from services.chroma_service import query_chunks, upsert_chunks
from services.embedding_service import embed_query, embed_texts
from services.file_reader import read_code_files
from utils.chunking import chunk_code_documents

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPOSITORIES_DIR = PROJECT_ROOT / "data" / "repositories"
GEMINI_MODEL = "gemini-2.5-flash"


def index_repository(repo_name: str) -> int:
    canonical_repo_name, repo_path = resolve_repo_path(repo_name)
    if not repo_path.exists():
        raise FileNotFoundError(f"Repository '{repo_name}' not found in data/repositories")

    files = read_code_files(repo_path)
    chunks = chunk_code_documents(files)

    if not chunks:
        logger.info("No chunks generated for repository: %s", canonical_repo_name)
        return 0

    documents = [chunk["chunk"] for chunk in chunks]
    metadatas = [{"file": chunk["file"], "repo": canonical_repo_name} for chunk in chunks]
    ids = [f"{canonical_repo_name}:{i}" for i in range(len(chunks))]
    embeddings = embed_texts(documents)

    upsert_chunks(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
    logger.info("Indexed %d chunks for repository %s", len(chunks), canonical_repo_name)
    return len(chunks)


def _build_prompt(retrieved_chunks: str, question: str) -> str:
    return (
        "You are a software architecture assistant.\n\n"
        "Use ONLY the provided repository context.\n\n"
        "If information is missing, say so.\n\n"
        "Repository Context:\n"
        f"{retrieved_chunks}\n\n"
        "Question:\n"
        f"{question}"
    )


def _extract_sources(metadatas: list[dict[str, Any]]) -> list[str]:
    ordered_sources: list[str] = []
    seen: set[str] = set()

    for metadata in metadatas:
        file_name = metadata.get("file")
        if not file_name or file_name in seen:
            continue
        seen.add(file_name)
        ordered_sources.append(file_name)

    return ordered_sources


def answer_question(question: str) -> dict[str, Any]:
    query_vector = embed_query(question)
    retrieval = query_chunks(query_embedding=query_vector, n_results=5)

    documents = retrieval.get("documents", [[]])[0]
    metadatas = retrieval.get("metadatas", [[]])[0]

    if not documents:
        return {
            "answer": "I could not find relevant repository context to answer this question.",
            "sources": [],
        }

    context = "\n\n".join(documents)
    prompt = _build_prompt(retrieved_chunks=context, question=question)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)

    answer_text = (response.text or "").strip()
    if not answer_text:
        answer_text = "I could not generate an answer from the provided context."

    return {
        "answer": answer_text,
        "sources": _extract_sources(metadatas),
    }
