"""Tests for LLM providers."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from services.llm.factory import create_llm_provider
from services.llm.gemini_provider import GeminiLLMProvider


class TestGeminiLLMProvider:
    def test_requires_api_key(self) -> None:
        with pytest.raises(Exception):
            GeminiLLMProvider("")

    def test_uses_system_instruction_and_header_auth(self) -> None:
        client = MagicMock()
        response = MagicMock()
        response.status_code = 200
        response.raise_for_status = MagicMock()
        response.json.return_value = {
            "candidates": [{"content": {"parts": [{"text": '{"strategy":"hybrid"}'}]}}],
        }
        client.post.return_value = response

        provider = GeminiLLMProvider("test-key")
        provider._client = client
        text = provider.complete("question", system="classify")
        assert "hybrid" in text
        _, kwargs = client.post.call_args
        assert kwargs["json"]["systemInstruction"]["parts"][0]["text"] == "classify"

    def test_factory_selects_gemini(self) -> None:
        provider = create_llm_provider("gemini", gemini_api_key="abc")
        assert provider.name == "gemini"
