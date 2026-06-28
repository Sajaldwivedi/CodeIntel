# Frontend

React + TypeScript single-page application for interacting with the AI Software Engineer.

## Tech Stack

| Technology    | Purpose                              |
|---------------|--------------------------------------|
| React 18      | UI framework                         |
| TypeScript    | Type safety                          |
| Vite          | Build tool and dev server            |
| TailwindCSS   | Utility-first styling                |
| shadcn/ui     | Accessible component library         |
| React Query   | Server state management and caching    |
| Zustand       | Client state management              |
| React Router  | Client-side routing                  |

## Structure

```
src/
├── components/   # Reusable UI components
├── pages/        # Route-level page components
├── hooks/        # Custom React hooks
├── services/     # API client layer
├── types/        # TypeScript type definitions
├── store/        # Zustand stores
├── lib/          # Utilities and helpers
└── routes/       # Route definitions
```

## Development

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Environment

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Design Principles

- **Feature-based components** grouped by domain (repository, chat, graph)
- **Server state in React Query** — never duplicate API data in Zustand
- **Zustand for UI state** — sidebar, selected repo, theme
- **Strict TypeScript** — no `any`, shared types with backend schemas
