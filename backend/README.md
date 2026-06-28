# Backend

FastAPI application following **clean architecture**. The backend ingests GitHub repositories, parses source code with Tree-Sitter, generates embeddings, builds dependency graphs in Neo4j, and serves agentic analysis via LangGraph.

## Layer Responsibilities

| Layer            | Responsibility                                      |
|------------------|-----------------------------------------------------|
| `api/`           | HTTP routes, request validation, response mapping   |
| `services/`      | Business logic and use-case orchestration           |
| `repositories/`  | Data access adapters (ChromaDB, Neo4j, GitHub)      |
| `models/`        | Domain entities and value objects                   |
| `schemas/`       | Pydantic DTOs for API contracts                     |
| `core/`          | Config, LLM clients, logging, middleware            |
| `workers/`       | Async background jobs (clone, index, re-embed)      |
| `graph/`         | LangGraph agent workflows and tools                 |
| `parser/`        | Tree-Sitter AST parsing and metadata extraction     |
| `embeddings/`    | Code chunking and vector generation                 |

## Dependency Flow

```
api → services → repositories
              → graph
              → parser
              → embeddings
              → workers (async)
```

**Rule:** Inner layers never import from outer layers. `repositories` and `services` must not import from `api`.

## Python Version

Python **3.11+**

## Local Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment

See root `.env.example` for all required variables.
