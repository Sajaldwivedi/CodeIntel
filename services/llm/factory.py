"""LLM provider factory."""

from __future__ import annotations

from services.llm.base import LLMProvider, LLMProviderError
from services.llm.gemini_provider import GeminiLLMProvider
from services.llm.openai_provider import OpenAILLMProvider


def create_llm_provider(
    provider: str,
    *,
    openai_api_key: str | None = None,
    openai_model: str = "gpt-4o-mini",
    gemini_api_key: str | None = None,
    gemini_model: str = "gemini-2.0-flash",
) -> LLMProvider:
    normalized = provider.lower().strip()
    if normalized == "openai":
        if not openai_api_key:
            raise LLMProviderError("OPENAI_API_KEY is required for OpenAI LLM.")
        return OpenAILLMProvider(openai_api_key, model=openai_model)
    if normalized == "gemini":
        if not gemini_api_key:
            raise LLMProviderError("GEMINI_API_KEY is required for Gemini LLM.")
        return GeminiLLMProvider(gemini_api_key, model=gemini_model)
    raise LLMProviderError(f"Unsupported LLM provider: {provider}")
