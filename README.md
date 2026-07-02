# AI Software Engineer for GitHub Repositories

> Graph-RAG + Code Intelligence platform that understands full GitHub
> repositories, builds embeddings and a knowledge graph, and answers codebase
> questions with citations, diagrams, and dependency analysis.

This repository is a **production-grade monorepo scaffold**. This phase sets up
the architecture only — no AI/retrieval logic yet.

## Architecture

```
.
├── frontend/            # React + TypeScript + Vite + Tailwind (+ shadcn/ui-ready)
├── backend/             # FastAPI application (app factory pattern)
│   └── app/
│       ├── api/         # Routers + route handlers (no business logic)
│       ├── core/        # Config (Pydantic Settings) + logging
│       ├── middleware/  # CORS, request logging, error handling
│       └── schemas/     # Pydantic response/request models
├── services/            # Reusable domain services (imported by backend)
│   ├── parser/          # Tree-sitter parsing (scaffold)
│   ├── embeddings/      # ChromaDB vector store (scaffold)
│   └── graph/           # Neo4j knowledge graph (scaffold)
├── shared/              # Cross-cutting types + utilities
├── docker/              # Dockerfiles for backend + frontend
├── docker-compose.yml   # Orchestrates backend, frontend, neo4j, chromadb
└── README.md
```

### Design principles

- **App factory pattern** — `create_app()` builds a fully configured FastAPI app.
- **No business logic in controllers** — routes delegate to services.
- **Strict typing everywhere** — Python type hints + TypeScript strict mode.
- **Modular services** — `parser`, `embeddings`, `graph` are independent packages.
- **Config via environment** — `pydantic-settings` on the backend, `import.meta.env` on the frontend.

## Tech stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Tailwind, shadcn/ui-ready |
| Backend    | FastAPI (Python 3.11)                             |
| Vector DB  | ChromaDB                                          |
| Graph DB   | Neo4j                                             |
| Agent      | LangGraph (later phase)                           |
| Parsing    | Tree-sitter (later phase)                         |
| Deployment | Docker Compose                                    |

## Getting started

### 1. Configure environment

```bash
cp .env.example .env
```

### 2. Run the full stack (Docker)

```bash
docker compose up -d --build
```

| Service   | URL                            |
| --------- | ------------------------------ |
| Backend   | http://localhost:8000          |
| API docs  | http://localhost:8000/docs     |
| Health    | http://localhost:8000/api/v1/health |
| Frontend  | http://localhost:5173          |
| Neo4j     | http://localhost:7474          |
| ChromaDB  | http://localhost:8001          |

### 3. Local development (without Docker)

Backend:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
PYTHONPATH=.. uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
cd backend
PYTHONPATH=.. pytest -q
```

## Roadmap

- [x] **Phase 1** — Monorepo scaffold + infrastructure
- [ ] **Phase 2** — Repo ingestion + Tree-sitter parsing
- [ ] **Phase 3** — Embeddings (ChromaDB) + knowledge graph (Neo4j)
- [ ] **Phase 4** — Hybrid retrieval + LangGraph agent
- [ ] **Phase 5** — Q&A with citations, diagrams, dependency analysis
