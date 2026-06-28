# Request Schemas

Pydantic models for validating incoming API requests.

## Planned Schemas

| Schema                    | Endpoint                    | Fields                          |
|---------------------------|-----------------------------|---------------------------------|
| `IndexRepositoryRequest`  | POST /repositories          | url, branch?, force_reindex?    |
| `AnalysisQueryRequest`    | POST /analysis/query        | repo_id, question, depth?       |
| `ChatMessageRequest`      | POST /chat/messages         | repo_id, conversation_id?, message |
| `GraphQueryRequest`       | POST /graph/query           | repo_id, cypher?, symbol?, depth? |
| `SearchRequest`           | POST /analysis/search       | repo_id, query, k?, filters?    |

## Validation Rules

- GitHub URLs must match `https://github.com/{owner}/{repo}` pattern
- `repo_id` must be UUID format
- `k` (top-k results) bounded between 1 and 100
- Message content max length enforced
