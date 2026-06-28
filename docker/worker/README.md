# Worker Dockerfile

Production image for the background task worker process.

## Image

Shares the same base as `docker/backend/` but with a different entrypoint:

```bash
arq workers.main.WorkerSettings
```

## Runtime

- No exposed ports (internal only)
- Same env vars as backend
- Scalable: run multiple worker containers

## Resource Considerations

- Indexing is CPU/memory intensive (parsing + embedding)
- Recommend 2GB+ RAM per worker container
- Tree-Sitter parsing benefits from multiple cores
