# Routes

React Router route definitions and navigation configuration.

## Route Tree

```
/                          → HomePage
/repositories              → RepositoriesPage
/repositories/:id          → RepositoryPage
/chat                      → ChatPage (no repo selected)
/chat/:repoId              → ChatPage (repo-scoped)
/graph/:repoId             → GraphPage
/analysis/:repoId          → AnalysisPage
/settings                  → SettingsPage
*                          → NotFoundPage
```

## Router Setup

```typescript
// To be implemented in routes/index.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [ /* route definitions */ ],
  },
]);
```

## Navigation Guards

- Graph and Analysis pages require `:repoId` — redirect to `/repositories` if missing
- Chat with no repo shows repo selector prompt

## Lazy Loading

All page components loaded via `React.lazy()` with `Suspense` fallback (Skeleton).
