# API Services

HTTP client layer for communicating with the FastAPI backend.

## Structure

| File                  | Endpoints Covered                |
|-----------------------|----------------------------------|
| `api-client.ts`       | Base axios/fetch client config   |
| `repository.service.ts`| /repositories CRUD              |
| `chat.service.ts`     | /chat messages + SSE stream      |
| `analysis.service.ts` | /analysis queries                |
| `graph.service.ts`    | /graph data queries              |
| `health.service.ts`   | /health probes                   |

## Base Client

```typescript
// Configured with VITE_API_BASE_URL
// Handles: JSON serialization, error parsing, auth headers (future)
```

## Error Handling

API errors mapped to typed `ApiError`:

```typescript
interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## Streaming

`chat.service.ts` handles SSE parsing for streaming agent responses:

```typescript
// To be implemented
async function* streamChat(repoId: string, message: string): AsyncGenerator<ChatEvent>
```

## Rules

- Services are pure HTTP — no React dependencies
- Return typed responses matching backend `schemas/responses/`
- All URLs relative to `VITE_API_BASE_URL`
