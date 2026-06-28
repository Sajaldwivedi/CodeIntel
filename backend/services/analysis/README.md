# Analysis Service

Orchestrates architectural analysis queries using retrieval-augmented generation and graph traversal.

## Capabilities (Planned)

- **Module overview** — Summarize a package or directory structure
- **Dependency analysis** — Explain import/call relationships between components
- **Impact analysis** — What breaks if X is changed?
- **Pattern detection** — Identify design patterns, anti-patterns
- **Architecture diagram** — Generate Mermaid/textual architecture views

## Retrieval Strategy

Combines two retrieval paths:

1. **Semantic** — ChromaDB similarity search over code chunks
2. **Structural** — Neo4j Cypher queries for dependency traversal

Results are fused and passed to the LangGraph analysis agent for synthesis.

## LangSmith

All analysis runs are traced under the `analysis` tag for observability.
