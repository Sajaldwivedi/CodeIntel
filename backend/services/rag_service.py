import logging
import os
from typing import Any

import google.generativeai as genai

from services.chroma_service import query_chunks
from services.embedding_service import embed_query
from services.enhanced_index_service import index_repository_with_structure, search_entities

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"


def index_repository(repo_name: str) -> int:
    result = index_repository_with_structure(repo_name)
    return int(result["chunks_indexed"])


def _build_prompt(entities_context: str, chunks_context: str, question: str) -> str:
    return (
        "You are a software architecture assistant.\n\n"
        "Use repository structure information and code context.\n\n"
        "When mentioning a function, class, or method, always provide file name and line number when available.\n\n"
        "If information is missing, say so.\n\n"
        "Repository Structure:\n"
        f"{entities_context}\n\n"
        "Repository Code:\n"
        f"{chunks_context}\n\n"
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


def _merge_context(
    entity_documents: list[str],
    chunk_documents: list[str],
) -> tuple[str, str]:
    dedup_entities: list[str] = []
    dedup_chunks: list[str] = []
    seen: set[str] = set()

    for text in entity_documents:
        key = text.strip()
        if not key or key in seen:
            continue
        seen.add(key)
        dedup_entities.append(text)

    for text in chunk_documents:
        key = text.strip()
        if not key or key in seen:
            continue
        seen.add(key)
        dedup_chunks.append(text)

    return "\n".join(dedup_entities), "\n\n".join(dedup_chunks)


def answer_question(question: str) -> dict[str, Any]:
    query_vector = embed_query(question)
    entity_retrieval = search_entities(question)
    retrieval = query_chunks(query_embedding=query_vector, n_results=5)

    semantic_documents = retrieval.get("documents", [[]])[0]
    semantic_metadatas = retrieval.get("metadatas", [[]])[0]
    entity_documents = entity_retrieval.get("documents", [[]])[0]
    entity_metadatas = entity_retrieval.get("metadatas", [[]])[0]

    if not semantic_documents and not entity_documents:
        return {
            "answer": "I could not find relevant repository context to answer this question.",
            "sources": [],
        }

    structure_context, code_context = _merge_context(
        entity_documents=entity_documents,
        chunk_documents=semantic_documents,
    )
    prompt = _build_prompt(
        entities_context=structure_context,
        chunks_context=code_context,
        question=question,
    )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)

    answer_text = (response.text or "").strip()
    if not answer_text:
        answer_text = "I could not generate an answer from the provided context."

    merged_sources = _extract_sources(entity_metadatas + semantic_metadatas)

    return {
        "answer": answer_text,
        "sources": merged_sources,
    }
