# Unit Tests

Isolated tests for individual modules with all external dependencies mocked.

## Scope

- Domain model behavior and validation
- Service logic with mocked repositories
- Parser extractors against fixture ASTs
- Chunking strategies with sample code
- Schema validation (Pydantic)
- Graph node pure functions

## Conventions

- No network calls — all I/O mocked
- No Docker required — run anywhere
- Fast execution (< 30 seconds total)
- One assertion focus per test where possible

## Example Structure

```
unit/
├── test_symbol_chunker.py
├── test_repository_service.py
├── test_python_extractor.py
└── test_router_node.py
```
