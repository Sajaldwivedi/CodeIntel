# Domain Models

Pure Python domain entities and value objects. No framework dependencies (no Pydantic, no SQLAlchemy).

## Submodules

| Module    | Contents                                    |
|-----------|---------------------------------------------|
| `domain/` | Core entities: Repository, CodeChunk, Symbol |
| `enums/`  | Shared enumerations                         |

## Design Rules

- **Immutable** value objects where possible (`@dataclass(frozen=True)`)
- **No I/O** — models never touch databases or HTTP
- **Rich behavior** — domain methods like `Symbol.full_name()` live on the model
- Schemas in `schemas/` are separate DTOs for API serialization

## Planned Entities

- `Repository` — indexed GitHub repository
- `CodeChunk` — embeddable unit of source code
- `Symbol` — parsed function, class, or module
- `DependencyEdge` — graph relationship between symbols
- `SearchResult` — ranked retrieval result with score
- `Conversation` — chat session with message history
