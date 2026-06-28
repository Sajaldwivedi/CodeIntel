# Logging

Structured logging configuration for the backend application.

## Features (Planned)

- JSON structured logs in production
- Human-readable colored logs in development
- Correlation ID propagation via middleware
- Log levels configurable via `LOG_LEVEL` env var
- Integration with LangSmith trace IDs

## Log Format (Production)

```json
{
  "timestamp": "2026-06-28T10:00:00Z",
  "level": "INFO",
  "logger": "services.indexing",
  "message": "Indexing complete",
  "correlation_id": "abc-123",
  "repo_id": "repo-456",
  "duration_ms": 1234
}
```

## Conventions

- Use `structlog` or standard library `logging` with JSON formatter
- Never log secrets, tokens, or full source code
- Include `repo_id` and `correlation_id` in context where applicable
