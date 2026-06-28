# Neo4j Repository

Graph database adapter for code dependency and structure graphs.

## Node Labels

| Label      | Properties                                      |
|------------|-------------------------------------------------|
| `Repository` | id, url, name, owner                          |
| `File`       | path, language, line_count                    |
| `Module`     | name, path                                      |
| `Class`      | name, file_path, start_line, end_line           |
| `Function`   | name, file_path, start_line, end_line, signature|
| `Variable`   | name, file_path, type_hint                      |

## Relationship Types

| Type       | From → To              | Description              |
|------------|------------------------|--------------------------|
| `CONTAINS` | Repository/File → *    | Structural containment   |
| `IMPORTS`  | File/Module → Module   | Import dependency        |
| `CALLS`    | Function → Function    | Function call            |
| `EXTENDS`  | Class → Class          | Inheritance              |
| `IMPLEMENTS`| Class → Class         | Interface implementation |
| `USES`     | Function → Variable    | Variable reference       |

## Query Patterns

- Shortest path between two symbols
- All dependents of a module (reverse IMPORTS)
- Call graph depth-N from entry point
- Orphan file detection (no incoming IMPORTS)

## Connection

Configured via `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`.
