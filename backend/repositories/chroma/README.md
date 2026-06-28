# ChromaDB Repository

Vector database adapter for code chunk storage and semantic search.

## Collection Schema

Each codebase is scoped by `repo_id` metadata filter.

| Field            | Type   | Description                    |
|------------------|--------|--------------------------------|
| `id`             | string | Unique chunk ID                |
| `embedding`      | vector | Dense embedding vector         |
| `document`       | string | Chunk text content             |
| `metadata.repo_id`     | string | Repository identifier    |
| `metadata.file_path`   | string | Source file path         |
| `metadata.language`    | string | Programming language     |
| `metadata.symbol_name` | string | Function/class name      |
| `metadata.start_line`  | int    | Start line in source     |
| `metadata.end_line`    | int    | End line in source       |
| `metadata.chunk_type`  | string | function, class, module  |

## Operations

- `upsert(chunks)` — Batch insert/update embeddings
- `search(query_embedding, repo_id, k, filters)` — Similarity search
- `delete_by_repo(repo_id)` — Remove all chunks for a repository
- `count(repo_id)` — Chunk count for status reporting

## Connection

Configured via `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_COLLECTION` environment variables.
