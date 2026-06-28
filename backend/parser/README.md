# Parser Layer

Tree-Sitter based source code parsing for AST extraction and metadata generation.

## Architecture

```
Source File → Language Detection → Tree-Sitter Parse → Extractors → ParsedSymbol[]
```

## Submodules

| Module        | Purpose                                  |
|---------------|------------------------------------------|
| `languages/`  | Tree-Sitter grammar bindings per language|
| `extractors/` | AST node visitors for symbol extraction  |

## Supported Languages (Planned)

| Language   | Grammar Package              | Priority |
|------------|------------------------------|----------|
| Python     | tree-sitter-python           | P0       |
| JavaScript | tree-sitter-javascript       | P0       |
| TypeScript | tree-sitter-typescript       | P0       |
| Go         | tree-sitter-go               | P1       |
| Rust       | tree-sitter-rust             | P1       |
| Java       | tree-sitter-java             | P2       |

## Output

Each parsed file produces:
- List of `Symbol` entities (functions, classes, methods)
- List of `DependencyEdge` (imports, calls)
- File-level metadata (language, line count, hash)

## Error Handling

- Unsupported file extensions: skip silently
- Parse errors: log warning, store raw file content as fallback chunk
- Binary files: skip

## Performance

- Parse files concurrently with asyncio
- Cache Tree-Sitter parsers per language (expensive to initialize)
