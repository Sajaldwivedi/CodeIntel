# TypeScript Types

Shared type definitions mirroring backend Pydantic schemas.

## Structure

| File                    | Types                                    |
|-------------------------|------------------------------------------|
| `repository.types.ts`   | Repository, IndexStatus, LanguageStats   |
| `chat.types.ts`         | Message, Conversation, ChatStreamEvent   |
| `analysis.types.ts`     | AnalysisQuery, AnalysisResult, Citation  |
| `graph.types.ts`        | GraphNode, GraphEdge, GraphQuery         |
| `api.types.ts`          | ApiError, PaginatedResponse, HealthStatus|
| `enums.ts`              | Shared enum constants                    |

## Sync Strategy

Types should mirror backend `schemas/` definitions. Consider generating from OpenAPI spec in CI:

```bash
# Future: auto-generate from /openapi.json
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/generated.ts
```

## Conventions

- Use `interface` for object shapes, `type` for unions/intersections
- Enum values as `const` objects with `as const` for tree-shaking
- Never use `any` — use `unknown` with type guards if needed

## IndexStatus Example

```typescript
export const IndexStatus = {
  PENDING: 'pending',
  CLONING: 'cloning',
  PARSING: 'parsing',
  EMBEDDING: 'embedding',
  GRAPHING: 'graphing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export type IndexStatus = typeof IndexStatus[keyof typeof IndexStatus];
```
