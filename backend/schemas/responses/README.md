# Response Schemas

Pydantic models for serializing API responses.

## Planned Schemas

| Schema                    | Description                              |
|---------------------------|------------------------------------------|
| `HealthResponse`          | Service health and dependency status     |
| `RepositoryResponse`      | Repository metadata and index status     |
| `RepositoryListResponse`  | Paginated list of repositories           |
| `AnalysisResponse`        | Answer with citations and confidence     |
| `ChatStreamEvent`         | SSE event payload                        |
| `GraphNodeResponse`       | Single graph node with properties        |
| `GraphEdgeResponse`       | Relationship between nodes               |
| `SearchResultResponse`    | Ranked code chunk with score             |
| `ErrorResponse`           | Standardized error body                  |

## Standard Envelope

List endpoints use a consistent pagination wrapper:

```
PaginatedResponse[T]
├── items: list[T]
├── total: int
├── page: int
└── page_size: int
```

## Error Format

```json
{
  "error": "repository_not_found",
  "message": "Repository abc-123 not found",
  "details": {}
}
```
