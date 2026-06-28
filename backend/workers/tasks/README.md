# Worker Tasks

Individual background task definitions.

## Task Contract

Each task:
1. Accepts a typed payload (Pydantic model)
2. Updates progress/status at each pipeline stage
3. Is idempotent (safe to retry)
4. Logs start, completion, and failure with correlation ID
5. Emits LangSmith traces for AI-heavy steps

## Planned Files

| File                  | Task                         |
|-----------------------|------------------------------|
| `index_repository.py` | Full indexing pipeline       |
| `reindex_repository.py`| Re-run indexing on existing repo |
| `delete_repository.py`| Clean up vectors, graph, clone |
| `cleanup_stale.py`    | Remove orphaned data           |

## Error Handling

- Retry transient errors (network, rate limit) up to 3 times with backoff
- Permanent errors (invalid repo, auth failure) mark status as `failed` immediately
- All errors captured in repository `error_message` field

## Enqueue Pattern

```python
# From service layer (to be implemented)
await queue.enqueue("index_repository", repo_id=repo.id)
```
