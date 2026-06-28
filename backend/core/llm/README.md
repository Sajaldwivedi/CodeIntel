# LLM Provider Abstraction

OpenAI-compatible architecture supporting multiple LLM backends.

## Provider Interface

```python
class LLMProvider(Protocol):
    async def generate(self, messages: list[Message], **kwargs) -> str: ...
    async def stream(self, messages: list[Message], **kwargs) -> AsyncIterator[str]: ...
```

## Implementations (Planned)

| Provider   | File              | Backend                          |
|------------|-------------------|----------------------------------|
| Gemini     | `gemini.py`       | Google Generative AI SDK         |
| OpenAI     | `openai.py`       | OpenAI / Azure / compatible APIs |

## Factory

`get_llm_provider()` returns the configured provider based on `LLM_PROVIDER` env var.

## Embeddings

Separate embedding interface in `embeddings/generators/` — LLM module handles chat/completion only.

## LangSmith Integration

All LLM calls wrapped with LangChain callbacks for automatic tracing when `LANGCHAIN_TRACING_V2=true`.

## Model Selection

| Use Case     | Recommended Model          |
|--------------|----------------------------|
| Chat/Agent   | gemini-2.0-flash / gpt-4o  |
| Embeddings   | text-embedding-004         |
| Summarization| gemini-2.0-flash           |
