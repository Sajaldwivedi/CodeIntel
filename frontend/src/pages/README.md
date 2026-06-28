# Pages

Route-level page components mapped by React Router.

## Planned Pages

| Page               | Route                  | Description                    |
|--------------------|------------------------|--------------------------------|
| `HomePage`         | `/`                    | Dashboard, recent repos        |
| `RepositoriesPage` | `/repositories`        | Manage indexed repositories    |
| `RepositoryPage`   | `/repositories/:id`    | Single repo overview + stats   |
| `ChatPage`         | `/chat/:repoId?`       | Agent conversation interface   |
| `GraphPage`        | `/graph/:repoId`       | Dependency graph explorer      |
| `AnalysisPage`     | `/analysis/:repoId`    | Architectural analysis view    |
| `SettingsPage`     | `/settings`            | App configuration              |
| `NotFoundPage`     | `*`                    | 404 fallback                   |

## Conventions

- Pages compose feature components — minimal logic
- Data fetching via custom hooks, not inline in pages
- Loading and error states handled at page level
- Each page wrapped in `PageContainer` layout component

## Lazy Loading

Pages code-split via `React.lazy()` for faster initial load:

```typescript
const ChatPage = lazy(() => import('./ChatPage'));
```
