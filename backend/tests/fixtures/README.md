# Test Fixtures

Shared test data, mock objects, and sample repositories.

## Contents (Planned)

```
fixtures/
├── sample_repos/
│   ├── python_mini/       # Small Python project for parser tests
│   └── typescript_mini/   # Small TS project for parser tests
├── mock_llm_responses.json
├── mock_embeddings.json
└── conftest.py            # Shared pytest fixtures
```

## Fixture Repositories

Minimal real codebases checked into the repo for deterministic parser and indexing tests:

- **python_mini** — 5-10 files covering classes, imports, calls
- **typescript_mini** — interfaces, exports, React component

## Shared Fixtures (conftest.py)

- `mock_llm_provider` — Returns canned LLM responses
- `mock_chroma_repo` — In-memory vector store
- `mock_neo4j_repo` — In-memory graph
- `sample_repository` — Pre-built Repository domain entity
