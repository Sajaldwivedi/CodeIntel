# Schemas Layer

Pydantic models defining API request/response contracts. Separate from domain models to allow independent evolution.

## Submodules

| Module       | Purpose                              |
|--------------|--------------------------------------|
| `requests/`  | Incoming request body/query models   |
| `responses/` | Outgoing response models             |

## Conventions

- Suffix request schemas with `Request` (e.g., `IndexRepositoryRequest`)
- Suffix response schemas with `Response` (e.g., `RepositoryResponse`)
- Use `model_config = ConfigDict(from_attributes=True)` for ORM/domain mapping
- Validate at the API boundary; services receive validated schemas or domain models

## Mapping

```
HTTP JSON → Request Schema → Service (domain model) → Response Schema → HTTP JSON
```

Domain models in `models/` should never be returned directly from endpoints.
