# API Endpoints

Individual route handler modules grouped by resource domain.

## Planned Modules

| Module           | File                    | Description                         |
|------------------|-------------------------|-------------------------------------|
| Health           | `health.py`             | `/health`, `/ready` probes          |
| Repositories     | `repositories.py`       | CRUD + index trigger for repos      |
| Analysis         | `analysis.py`           | Architectural analysis queries      |
| Chat             | `chat.py`               | Streaming agent conversations       |
| Graph            | `graph.py`              | Neo4j dependency graph queries      |

## Conventions

- One router (`APIRouter`) per module
- Handler functions are thin — call a service method and return a schema
- Use `response_model` on all endpoints for type safety
- Streaming endpoints use `StreamingResponse` for SSE

## Error Handling

Map domain exceptions from `core/exceptions/` to HTTP responses via global exception handlers in the app factory.
