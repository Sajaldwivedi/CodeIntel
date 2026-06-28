# Indexing Service

Orchestrates the full repository indexing pipeline.

## Pipeline Stages

1. **Clone** — Fetch repository from GitHub to local storage
2. **Discover** — Walk file tree, filter by supported extensions
3. **Parse** — Tree-Sitter AST extraction per file
4. **Chunk** — Split parsed units into embedding-sized chunks
5. **Embed** — Generate vector embeddings via LLM provider
6. **Store Vectors** — Upsert chunks into ChromaDB
7. **Build Graph** — Create Neo4j nodes (File, Function, Class, Module) and edges (IMPORTS, CALLS, EXTENDS)
8. **Finalize** — Update repository status and metadata

## Status Tracking

Each repository progresses through:

```
pending → cloning → parsing → embedding → graphing → ready | failed
```

## Retry Policy

- Transient failures (network, rate limits): exponential backoff
- Parse failures on individual files: log and skip, continue pipeline
- Fatal failures: mark repository as `failed` with error detail
