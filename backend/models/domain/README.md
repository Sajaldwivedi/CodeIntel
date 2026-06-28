# Domain Entities

Core business entities representing the problem domain.

## Planned Files

| File              | Entity        | Description                           |
|-------------------|---------------|---------------------------------------|
| `repository.py`   | `Repository`  | GitHub repo with index lifecycle      |
| `code_chunk.py`   | `CodeChunk`   | Parsed, chunked source code unit      |
| `symbol.py`       | `Symbol`      | AST-extracted symbol (fn, class, mod)|
| `dependency.py`   | `DependencyEdge` | Typed graph edge                 |
| `search_result.py`| `SearchResult`| Vector search hit with metadata       |
| `conversation.py` | `Conversation`| Chat session entity                   |
| `message.py`      | `Message`     | Single chat message with role         |

## Example Shape (Repository)

```
Repository
├── id: str
├── url: str
├── owner: str
├── name: str
├── branch: str
├── status: IndexStatus
├── file_count: int
├── language_stats: dict[str, int]
├── indexed_at: datetime | None
├── error_message: str | None
└── created_at: datetime
```

These are plain dataclasses — serialization happens in `schemas/`.
