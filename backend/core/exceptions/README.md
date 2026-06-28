# Exceptions

Domain-specific exception hierarchy mapped to HTTP responses.

## Hierarchy (Planned)

```
AppException (base)
├── NotFoundError          → 404
├── ValidationError        → 422
├── RepositoryNotReadyError → 409
├── IndexingError          → 500
├── LLMProviderError       → 502
├── GraphQueryError        → 500
└── RateLimitError         → 429
```

## Usage in Services

```python
raise NotFoundError(f"Repository {repo_id} not found")
```

## Global Handler

FastAPI exception handler in app factory converts `AppException` subclasses to `ErrorResponse` JSON with appropriate status codes.

## Rules

- Services raise domain exceptions — never `HTTPException`
- API layer may catch and re-raise as HTTP responses via handlers
- Include actionable `details` dict for client debugging
