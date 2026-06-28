# Zustand Stores

Client-side state management for UI state not derived from the server.

## Planned Stores

| Store              | State Managed                              |
|--------------------|--------------------------------------------|
| `useAppStore`      | Theme (light/dark), sidebar collapsed      |
| `useRepoStore`     | Currently selected repository ID           |
| `useChatStore`     | Active conversation ID, draft message      |
| `useGraphStore`    | Selected node, layout preference, filters  |

## What NOT to Store

- API response data → React Query cache
- Form state → local component state or react-hook-form
- URL state → React Router params/search params

## Store Pattern

```typescript
// To be implemented
interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

## Persistence

Selected preferences (theme, sidebar) persisted to `localStorage` via Zustand `persist` middleware.

## DevTools

Zustand devtools middleware enabled in development for debugging.
