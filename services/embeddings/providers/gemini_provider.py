"""Google Gemini embedding provider."""

from __future__ import annotations

import logging
import time

import google.generativeai as genai

from services.embeddings.providers.base import EmbeddingProvider

logger = logging.getLogger(__name__)


class GeminiEmbeddingProvider(EmbeddingProvider):
    name = "gemini"

    def __init__(
        self,
        api_key: str,
        *,
        model: str = "models/gemini-embedding-001",
        request_delay_seconds: float = 4.0,
        max_retries: int = 8,
    ) -> None:
        genai.configure(api_key=api_key)
        self._model = model
        self._dimension = 3072
        self._request_delay_seconds = request_delay_seconds
        self._max_retries = max_retries

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        # Embed one chunk per API call to stay under Gemini free-tier RPM/TPM.
        vectors: list[list[float]] = []
        for index, text in enumerate(texts):
            vectors.append(self._embed_one_with_retry(text))
            if index < len(texts) - 1 and self._request_delay_seconds > 0:
                time.sleep(self._request_delay_seconds)
        return vectors

    def _embed_one_with_retry(self, text: str) -> list[float]:
        delay = 8.0
        for attempt in range(self._max_retries):
            try:
                result = genai.embed_content(
                    model=self._model,
                    content=text,
                    task_type="retrieval_document",
                )
                embedding = result.get("embedding")
                if not embedding:
                    raise ValueError("Gemini embed response missing 'embedding' field")
                if embedding and isinstance(embedding[0], list):
                    return list(embedding[0])
                return list(embedding)
            except Exception as exc:
                if self._is_rate_limit(exc) and attempt < self._max_retries - 1:
                    logger.warning(
                        "gemini_rate_limit retry=%d/%d wait=%.0fs",
                        attempt + 1,
                        self._max_retries,
                        delay,
                    )
                    time.sleep(delay)
                    delay = min(delay * 1.5, 120.0)
                    continue
                raise
        raise RuntimeError("unreachable")

    @staticmethod
    def _is_rate_limit(exc: Exception) -> bool:
        message = str(exc).lower()
        return (
            "429" in message
            or "resourceexhausted" in message
            or "rate_limit" in message
            or "quota" in message
        )

    @staticmethod
    def _parse_embedding_response(result: dict, *, expected: int) -> list[list[float]]:
        embedding = result.get("embedding")
        if embedding is None:
            raise ValueError("Gemini embed response missing 'embedding' field")
        if expected == 1:
            if embedding and isinstance(embedding[0], (int, float)):
                return [list(embedding)]
            if embedding and isinstance(embedding[0], list):
                return [list(embedding[0])]
            return [list(embedding)]
        if not embedding or not isinstance(embedding[0], list):
            raise ValueError("Expected batch embeddings from Gemini API")
        return [list(vector) for vector in embedding]
