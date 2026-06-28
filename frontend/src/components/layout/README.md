# Layout Components

Application shell and structural layout components.

## Planned Components

| Component       | Description                              |
|-----------------|------------------------------------------|
| `AppLayout`     | Root layout with sidebar + main content  |
| `Sidebar`       | Navigation, repo selector, settings link |
| `Header`        | Page title, breadcrumbs, actions         |
| `PageContainer` | Consistent page padding and max-width    |

## Layout Structure

```
┌──────────────────────────────────────────┐
│  Sidebar (240px)  │  Header              │
│                   ├──────────────────────│
│  - Repositories   │                      │
│  - Chat           │  Main Content        │
│  - Graph          │  (React Router       │
│  - Settings       │   outlet)            │
│                   │                      │
└──────────────────────────────────────────┘
```

## Responsive Behavior

- Desktop: persistent sidebar
- Mobile: collapsible sidebar via Sheet component
