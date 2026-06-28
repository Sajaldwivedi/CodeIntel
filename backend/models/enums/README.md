# Enumerations

Shared enum types used across domain models, schemas, and services.

## Planned Enums

| Enum              | Values                                           |
|-------------------|--------------------------------------------------|
| `IndexStatus`     | pending, cloning, parsing, embedding, graphing, ready, failed |
| `SymbolKind`      | function, class, method, module, variable, interface |
| `ChunkType`       | function, class, module, file, docstring         |
| `EdgeType`        | imports, calls, extends, implements, contains    |
| `Language`        | python, javascript, typescript, go, rust, java, ... |
| `MessageRole`     | user, assistant, system, tool                      |
| `LLMProvider`     | gemini, openai                                     |

## Usage

```python
from models.enums.index_status import IndexStatus

repo.status = IndexStatus.PARSING
```

Keep enums in dedicated files for clean imports and OpenAPI schema generation compatibility.
