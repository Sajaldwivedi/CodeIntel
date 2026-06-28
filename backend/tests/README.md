# Backend Tests

Test suite for the FastAPI backend application.

## Structure

| Directory      | Scope                                    |
|----------------|------------------------------------------|
| `unit/`        | Isolated unit tests with mocked deps     |
| `integration/` | Tests against real ChromaDB/Neo4j (Docker)|
| `fixtures/`    | Shared test data, sample repos, mocks    |

## Conventions

- Framework: **pytest** with **pytest-asyncio**
- Naming: `test_{module}_{behavior}.py`
- Fixtures in `conftest.py` per directory level
- Integration tests marked with `@pytest.mark.integration`
- Use `fixtures/sample_repos/` for parser and indexing tests

## Coverage Targets

| Layer          | Target |
|----------------|--------|
| services/      | 80%+   |
| parser/        | 90%+   |
| repositories/  | 70%+   |
| graph/         | 70%+   |
| api/           | 60%+   |

## Running Tests

```bash
# Unit tests only
pytest backend/tests/unit -v

# Integration (requires Docker services)
pytest backend/tests/integration -v -m integration

# All with coverage
pytest backend/tests --cov=backend --cov-report=html
```

## Mocking Strategy

- LLM calls: mock provider responses (never hit real APIs in CI)
- ChromaDB/Neo4j: use test containers via Docker Compose profile `test`
- GitHub: mock clone with local fixture repositories
