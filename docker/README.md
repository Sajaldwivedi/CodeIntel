# Docker

Docker configuration for containerized deployment of all services.

## Structure

```
docker/
├── backend/     # FastAPI API server image
├── frontend/    # React production build (nginx)
├── worker/      # Background worker image
└── neo4j/       # Neo4j custom config (optional)
```

## Usage

```bash
# Infrastructure only (dev)
docker compose up -d neo4j chromadb redis

# Full stack
docker compose --profile full up -d
```

## Profiles

| Profile | Services                              |
|---------|---------------------------------------|
| default | neo4j, chromadb, redis                |
| full    | + backend, worker, frontend           |

## Volumes

Persistent data stored in named Docker volumes:
- `neo4j_data` — graph database
- `chroma_data` — vector embeddings
- `redis_data` — task queue state

Application data (cloned repos) mounted from `./data/` host directory.
