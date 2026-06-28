# Language Grammars

Tree-Sitter grammar bindings and parser initialization per supported language.

## Planned Files

| File              | Language   | tree-sitter package          |
|-------------------|------------|------------------------------|
| `python.py`       | Python     | tree-sitter-python           |
| `javascript.py`   | JavaScript | tree-sitter-javascript       |
| `typescript.py`   | TypeScript | tree-sitter-typescript       |
| `go.py`           | Go         | tree-sitter-go               |
| `rust.py`         | Rust       | tree-sitter-rust             |
| `registry.py`     | —          | Language → Parser factory    |

## Registry Pattern

```python
# To be implemented
registry = LanguageRegistry()
parser = registry.get_parser("python")
tree = parser.parse(source_bytes)
```

## Extension Mapping

`registry.py` maps file extensions to language parsers:

```
.py → python
.js, .jsx → javascript
.ts, .tsx → typescript
.go → go
.rs → rust
```

## Parser Lifecycle

Tree-Sitter `Parser` objects are created once per language and reused across files for performance.
