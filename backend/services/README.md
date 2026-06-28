# Services Layer

Business logic and use-case orchestration. Services coordinate between repositories, parsers, embeddings, and LangGraph agents.

## Submodules

| Module        | Purpose                                              |
|---------------|------------------------------------------------------|
| `indexing/`   | Full pipeline: clone → parse → embed → graph       |
| `analysis/`   | Architectural Q&A orchestration                      |
| `repository/` | Repository lifecycle (register, status, delete)      |
| `chat/`       | Agent conversation management and streaming          |

## Design Principles

- **Single responsibility** — one service per bounded context
- **Testable** — accept repository interfaces; no direct HTTP concerns
- **Idempotent** — indexing operations safe to retry
- **Observable** — emit LangSmith traces for AI operations

## Typical Flow: Index Repository

```
RepositoryService.register(url)
  → Worker enqueues IndexTask
    → CloneService.fetch()
    → ParserService.parse_all()
    → EmbeddingService.embed_chunks()
    → GraphService.build_dependencies()
    → ChromaRepository.upsert()
    → Neo4jRepository.upsert()
```

## Rules

- Services may call multiple repositories, parsers, and graph agents
- Services must **not** import from `api/`
- Return domain models or schemas — never raw DB records
