"""Google Gemini generative language provider."""

from __future__ import annotations

import logging
import time

import httpx

from services.llm.base import LLMProviderError

logger = logging.getLogger(__name__)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiLLMProvider:
    name = "gemini"

    def __init__(
        self,
        api_key: str,
        *,
        model: str = "gemini-2.0-flash",
        timeout_seconds: float = 60.0,
        max_retries: int = 3,
    ) -> None:
        if not api_key:
            raise LLMProviderError("GEMINI_API_KEY is required for Gemini LLM.")
        self._api_key = api_key
        self._model = model
        self._max_retries = max(1, max_retries)
        self._client = httpx.Client(
            timeout=timeout_seconds,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            },
        )

    def complete(self, prompt: str, *, system: str | None = None, temperature: float = 0.2) -> str:
        url = f"{GEMINI_API_BASE}/models/{self._model}:generateContent"
        payload: dict[str, object] = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature},
        }
        if system:
            payload["systemInstruction"] = {"parts": [{"text": system}]}

        delay = 1.0
        last_exc: Exception | None = None
        for attempt in range(1, self._max_retries + 1):
            try:
                response = self._client.post(url, json=payload)
                if response.status_code == 429 and attempt < self._max_retries:
                    logger.warning("Gemini rate limit; retrying in %.1fs (attempt %d)", delay, attempt)
                    time.sleep(delay)
                    delay *= 2
                    continue
                response.raise_for_status()
                return self._extract_text(response.json())
            except LLMProviderError:
                raise
            except Exception as exc:
                last_exc = exc
                if attempt < self._max_retries:
                    time.sleep(delay)
                    delay *= 2
                    continue
                break

        if last_exc is not None:
            message = str(last_exc)
            if "429" in message:
                raise LLMProviderError(
                    "Gemini API rate limit exceeded. Wait a moment and retry, or check quota at "
                    "https://ai.google.dev/gemini-api/docs/rate-limits",
                ) from last_exc
            raise LLMProviderError(f"Gemini completion failed: {last_exc}") from last_exc
        raise LLMProviderError("Gemini completion failed after retries.")

    @staticmethod
    def _extract_text(data: dict) -> str:
        candidates = data.get("candidates") or []
        if not candidates:
            raise LLMProviderError("Gemini returned no candidates.")
        content = candidates[0].get("content", {})
        text_parts = content.get("parts") or []
        text = "".join(part.get("text", "") for part in text_parts).strip()
        if not text:
            raise LLMProviderError("Gemini returned an empty response.")
        return text
