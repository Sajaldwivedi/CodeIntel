# Utilities

Shared helper functions and configuration utilities.

## Planned Files

| File              | Purpose                                  |
|-------------------|------------------------------------------|
| `utils.ts`        | General helpers (cn, formatDate, etc.)   |
| `constants.ts`    | App-wide constants                       |
| `query-client.ts` | React Query client configuration         |
| `env.ts`          | Typed environment variable access        |

## Key Utilities

### `cn()` — Class Name Merger

Tailwind class merging utility (clsx + tailwind-merge) used by shadcn/ui:

```typescript
cn('px-4 py-2', isActive && 'bg-primary', className)
```

### React Query Client

Default configuration:
- `staleTime`: 30 seconds for repository list
- `retry`: 1 for mutations, 3 for queries
- Global error toast on mutation failure

### Environment

```typescript
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;
```

## Rules

- Pure functions only — no side effects except in query-client config
- No React imports in utils.ts
