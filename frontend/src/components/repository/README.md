# Repository Components

UI components for managing and monitoring indexed GitHub repositories.

## Planned Components

| Component              | Description                           |
|------------------------|---------------------------------------|
| `RepositoryList`       | Table/cards of indexed repositories   |
| `RepositoryCard`       | Single repo with status badge         |
| `AddRepositoryForm`    | GitHub URL input with validation      |
| `IndexProgress`        | Pipeline stage progress indicator     |
| `LanguageBreakdown`    | Bar chart of language statistics      |
| `RepositoryActions`    | Reindex, delete action buttons        |

## Status Display

Visual indicators for index pipeline stages:

```
pending → cloning → parsing → embedding → graphing → ready ✓
                                                   → failed ✗
```

## Data Source

React Query hooks from `hooks/useRepositories.ts` — poll status while indexing.
