"""Embedding provider factory."""

from __future__ import annotations

from services.embeddings.providers.base import EmbeddingProvider
from services.embeddings.providers.gemini_provider import GeminiEmbeddingProvider
from services.embeddings.providers.openai_provider import OpenAIEmbeddingProvider


class EmbeddingProviderError(Exception):
    """Raised when no embedding provider can be configured."""


def create_embedding_provider(
    provider: str,
    *,
    openai_api_key: str | None = None,
    gemini_api_key: str | None = None,
    openai_model: str = "text-embedding-3-small",
    gemini_model: str = "models/gemini-embedding-001",
    gemini_request_delay_seconds: float = 4.0,
    gemini_max_retries: int = 8,
) -> EmbeddingProvider:
    normalized = provider.lower().strip()

    if normalized == "openai":
        if not openai_api_key:
            raise EmbeddingProviderError("OPENAI_API_KEY is required for OpenAI embeddings.")
        return OpenAIEmbeddingProvider(openai_api_key, model=openai_model)

    if normalized == "gemini":
        if not gemini_api_key:
            raise EmbeddingProviderError("GEMINI_API_KEY is required for Gemini embeddings.")
        return GeminiEmbeddingProvider(
            gemini_api_key,
            model=gemini_model,
            request_delay_seconds=gemini_request_delay_seconds,
            max_retries=gemini_max_retries,
        )

    raise EmbeddingProviderError(f"Unsupported embedding provider: {provider}")
