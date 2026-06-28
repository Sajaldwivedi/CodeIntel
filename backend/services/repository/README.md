# Repository Service

Manages the lifecycle of indexed GitHub repositories.

## Operations

| Operation    | Description                                    |
|--------------|------------------------------------------------|
| `register`   | Accept a GitHub URL, validate, enqueue index   |
| `get`        | Retrieve repository metadata and index status  |
| `list`       | List all registered repositories               |
| `reindex`    | Trigger full re-index (e.g., after code change)|
| `delete`     | Remove vectors, graph nodes, and local clone   |

## Domain Model

See `models/domain/repository.py` (to be implemented).

Key fields: `id`, `url`, `owner`, `name`, `branch`, `status`, `indexed_at`, `file_count`, `language_stats`.

## Validation

- GitHub URL format validation
- Duplicate detection (same owner/repo/branch)
- Private repo access requires `GITHUB_TOKEN`
