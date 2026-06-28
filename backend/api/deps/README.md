# API Dependencies

Shared FastAPI dependency injection providers used across endpoints.

## Intended Contents

- Database session / connection pool providers (Neo4j, ChromaDB)
- Service factory dependencies
- Authentication and authorization guards (future)
- Request context (correlation ID, user ID)
- Rate limiting dependencies

## Usage Pattern

```python
# Example (to be implemented)
@router.get("/repositories")
async def list_repos(
    repo_service: RepositoryService = Depends(get_repository_service),
):
    ...
```

## Rules

- Dependencies are **wiring only** — no business logic
- Keep providers stateless where possible; use lifespan events for connection pools
