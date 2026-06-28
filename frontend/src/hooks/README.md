# Custom Hooks

Reusable React hooks encapsulating data fetching and UI logic.

## Planned Hooks

| Hook                  | Purpose                                  |
|-----------------------|------------------------------------------|
| `useRepositories`     | List/create/delete repositories          |
| `useRepository`       | Single repository detail + status polling|
| `useChat`             | Send messages, handle SSE streaming      |
| `useGraph`            | Fetch and filter graph data              |
| `useAnalysis`         | Submit analysis queries                  |
| `useDebounce`         | Debounced value for search inputs        |
| `useMediaQuery`       | Responsive breakpoint detection          |

## Conventions

- Hooks wrap React Query mutations/queries where applicable
- Return typed objects: `{ data, isLoading, error, mutate }`
- SSE streaming logic encapsulated in `useChat`
- Status polling in `useRepository` while index status !== `ready`

## Example Pattern

```typescript
// To be implemented
export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: repositoryService.list,
  });
}
```
