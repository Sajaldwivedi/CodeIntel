# GitHub Repository

Adapter for GitHub API and local repository cloning.

## Operations

| Operation       | Description                                   |
|-----------------|-----------------------------------------------|
| `clone`         | Shallow clone to `REPOS_DIR/{repo_id}`        |
| `get_metadata`  | Fetch owner, name, default branch, languages  |
| `list_files`    | Walk cloned tree with extension filtering     |
| `read_file`     | Read single file content from clone           |
| `cleanup`       | Remove local clone directory                  |

## Authentication

Uses `GITHUB_TOKEN` for:
- Higher rate limits
- Private repository access
- Repository metadata API

## Clone Strategy

- Shallow clone (`--depth 1`) for speed
- Configurable branch via request or default branch
- `.gitignore` patterns applied during file discovery

## Rate Limiting

Respect GitHub API rate limits; implement backoff and caching for metadata calls.
