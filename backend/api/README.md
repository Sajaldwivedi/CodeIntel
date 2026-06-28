# API Layer

HTTP transport layer for the FastAPI application. Handles routing, dependency injection, and mapping between HTTP and domain layers.

## Responsibilities

- Define REST/WebSocket endpoints
- Inject services via FastAPI `Depends()`
- Validate incoming requests using Pydantic schemas
- Map domain results to response schemas
- Handle HTTP status codes and error responses

## Structure

```
api/
├── deps/           # Shared FastAPI dependencies (auth, db sessions)
└── v1/
    ├── endpoints/  # Route handlers grouped by resource
    └── router.py   # Aggregates v1 routes (to be implemented)
```

## Rules

- **No business logic** in endpoint handlers — delegate to `services/`
- **No direct database access** — use `repositories/` via services
- Version all routes under `/api/v1/`

## Planned Endpoints

| Resource     | Prefix                  | Description                    |
|--------------|-------------------------|--------------------------------|
| Health       | `/api/v1/health`        | Liveness and readiness probes  |
| Repositories | `/api/v1/repositories`  | Clone, index, status           |
| Analysis     | `/api/v1/analysis`      | Architecture Q&A               |
| Chat         | `/api/v1/chat`          | Agentic conversation           |
| Graph        | `/api/v1/graph`         | Dependency graph queries       |
