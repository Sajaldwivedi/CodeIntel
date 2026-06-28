# Workers

Background job processing for long-running tasks like repository cloning and indexing.

## Architecture

```
API enqueues task → Redis queue → Worker picks up → executes pipeline
```

## Submodules

| Module   | Purpose                              |
|----------|--------------------------------------|
| `tasks/` | Individual task definitions          |

## Planned Tasks

| Task              | Trigger                    | Duration    |
|-------------------|----------------------------|-------------|
| `index_repository`| POST /repositories         | Minutes     |
| `reindex_repository`| PUT /repositories/{id}/reindex | Minutes |
| `delete_repository`| DELETE /repositories/{id} | Seconds     |
| `cleanup_stale`   | Scheduled cron             | Seconds     |

## Worker Runtime

- Separate process from API server (see `docker/worker/Dockerfile`)
- Configurable concurrency via `WORKER_CONCURRENCY`
- Graceful shutdown: finish in-progress tasks before exit
- Dead letter queue for permanently failed tasks

## Status Updates

Workers update repository status in real-time so the frontend can poll or subscribe to progress.

## Technology Options

- **ARQ** (async Redis queue) — recommended for async FastAPI
- Alternative: Celery with Redis broker
