# AST Extractors

Tree-Sitter AST visitors that extract symbols and dependencies from parse trees.

## Planned Extractors

| File                  | Extracts                                    |
|-----------------------|---------------------------------------------|
| `symbols.py`          | Functions, classes, methods, variables      |
| `imports.py`          | Import/require statements and targets       |
| `calls.py`            | Function/method call expressions            |
| `inheritance.py`      | Class extends/implements relationships      |
| `docstrings.py`       | Docstrings and comments for context         |

## Visitor Pattern

Each extractor walks the AST using Tree-Sitter node types:

```python
# Conceptual (to be implemented)
class SymbolExtractor:
    def visit_function_definition(self, node) -> Symbol: ...
    def visit_class_definition(self, node) -> Symbol: ...
```

## Language-Specific Queries

Tree-Sitter query patterns (`.scm` files) for efficient node matching:

```
languages/queries/
├── python.scm
├── javascript.scm
└── typescript.scm
```

## Output Normalization

All extractors produce unified `Symbol` and `DependencyEdge` domain models regardless of source language.
