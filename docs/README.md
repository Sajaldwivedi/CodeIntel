# Documentation

Project documentation for architecture, API, and decision records.

## Structure

| Directory       | Contents                                |
|-----------------|-----------------------------------------|
| `architecture/` | System design, data flow, diagrams     |
| `api/`          | API reference and integration guides    |
| `adr/`          | Architecture Decision Records           |

## Architecture Docs (Planned)

- System overview and component diagram
- Indexing pipeline sequence diagram
- Agent workflow graph documentation
- Database schema (ChromaDB + Neo4j)
- Deployment guide

## API Docs

Auto-generated OpenAPI available at `/docs` when backend is running. Manual guides here for integration patterns and streaming protocol.

## ADRs

Architecture Decision Records document significant technical choices:

- ADR-001: Why LangGraph over raw LangChain chains
- ADR-002: ChromaDB vs alternatives for vector storage
- ADR-002: Neo4j for dependency graphs
- ADR-003: Tree-Sitter over regex parsing
