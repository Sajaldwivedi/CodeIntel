# Components

Reusable React UI components organized by scope and feature.

## Subdirectories

| Directory      | Purpose                                    |
|----------------|--------------------------------------------|
| `ui/`          | shadcn/ui primitives (Button, Dialog, etc.)|
| `layout/`      | App shell, sidebar, header, navigation     |
| `repository/`  | Repository list, index status, URL input |
| `chat/`        | Message list, input, streaming display       |
| `graph/`       | Dependency graph visualization             |

## Conventions

- One component per file, named export matching filename
- Props typed with explicit interfaces (in same file or `types/`)
- Presentational components receive data via props — no direct API calls
- Container/page components use hooks for data fetching

## shadcn/ui

Install components via CLI into `ui/`:

```bash
npx shadcn@latest add button dialog input
```

Do not modify shadcn primitives directly — wrap in feature components if customization is needed.

## Styling

TailwindCSS utility classes only. No CSS modules or styled-components.
