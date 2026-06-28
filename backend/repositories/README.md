# Repositories Layer

Data access adapters implementing persistence for ChromaDB, Neo4j, and GitHub. Follows the **Repository Pattern** to isolate storage concerns from business logic.

## Submodules

| Module    | Storage    | Purpose                              |
|-----------|------------|--------------------------------------|
| `chroma/` | ChromaDB   | Vector storage and similarity search |
| `neo4j/`  | Neo4j      | Dependency graph CRUD and queries    |
| `github/` | GitHub API | Repository cloning and metadata      |

## Interface Design

Each repository exposes a protocol/ABC that services depend on:

```python
class VectorRepository(Protocol):
    async def upsert(self, chunks: list[CodeChunk]) -> None: ...
    async def search(self, query: str, repo_id: str, k: int) -> list[SearchResult]: ...
    async def delete_by_repo(self, repo_id: str) -> None: ...
```

## Rules

- Repositories return domain models, not raw driver objects
- Connection pooling managed in `core/` and injected here
- No business logic — only CRUD and query operations
- All async where the underlying driver supports it
