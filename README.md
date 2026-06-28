# AI Software Engineer for GitHub Repositories

A production-grade full-stack application that understands source code, builds semantic embeddings, creates dependency graphs, and answers architectural questions about GitHub repositories.

This is **not** a simple chatbot. It is an AI Software Engineer that combines:

- **Semantic search** (ChromaDB) over parsed code chunks
- **Dependency graphs** (Neo4j) for structural and architectural reasoning
- **Agentic workflows** (LangGraph) for multi-step analysis
- **AST-aware parsing** (Tree-Sitter) for language-specific understanding

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────────────────────┐
│   React     │────▶│   FastAPI   │────▶│  Services (orchestration layer)  │
│  Frontend   │     │   Backend   │     └──────────┬───────────────────────┘
└─────────────┘     └─────────────┘                │
                                                   ├──▶ Parser (Tree-Sitter)
                                                   ├──▶ Embeddings (ChromaDB)
                                                   ├──▶ Graph (Neo4j)
                                                   ├──▶ LangGraph Agents
                                                   └──▶ Workers (async jobs)
```

## Tech Stack

| Layer        | Technologies                                      |
|--------------|---------------------------------------------------|
| Frontend     | React, TypeScript, Vite, TailwindCSS, shadcn/ui   |
| State/Data   | React Query, Zustand, React Router                |
| Backend      | FastAPI, Python 3.11                              |
| Vector DB    | ChromaDB                                          |
| Graph DB     | Neo4j                                             |
| AI           | LangGraph, LangChain, Gemini, OpenAI-compatible   |
| Parser       | Tree-Sitter                                       |
| Deployment   | Docker Compose                                    |
| Monitoring   | LangSmith                                         |

## Project Structure

```
.
├── backend/          # FastAPI application (clean architecture)
├── frontend/         # React + Vite SPA
├── docker/           # Dockerfiles and service configs
├── docs/             # Architecture and API documentation
├── scripts/          # Development and operations scripts
└── docker-compose.yml
```

## Getting Started

> Application logic is not yet implemented. See each module's README for its intended role.

1. Copy `.env.example` to `.env` and fill in API keys
2. Start infrastructure: `docker compose up -d neo4j chromadb`
3. Backend: see `backend/README.md`
4. Frontend: see `frontend/README.md`

## Clean Architecture Principles

- **api/** — HTTP transport; no business logic
- **services/** — use-case orchestration
- **repositories/** — persistence adapters (ChromaDB, Neo4j)
- **models/** — domain entities
- **schemas/** — API contracts (Pydantic)
- **core/** — cross-cutting concerns (config, LLM, logging)
- **workers/** — background indexing and ingestion
- **graph/** — LangGraph agent definitions
- **parser/** — Tree-Sitter AST extraction
- **embeddings/** — chunking and vector generation
