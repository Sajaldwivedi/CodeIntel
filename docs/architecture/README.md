# Architecture Documentation

System design documents, diagrams, and technical specifications.

## Planned Documents

| Document                    | Description                           |
|-----------------------------|---------------------------------------|
| `system-overview.md`        | High-level component diagram          |
| `indexing-pipeline.md`      | Clone → parse → embed → graph flow   |
| `agent-workflows.md`        | LangGraph agent design and routing    |
| `data-model.md`             | Domain entities and relationships     |
| `retrieval-strategy.md`     | Hybrid semantic + graph retrieval     |
| `deployment.md`             | Docker Compose production setup       |

## Diagrams

Architecture diagrams use Mermaid for version control compatibility:

- Component diagram (frontend ↔ backend ↔ databases)
- Sequence diagram (indexing pipeline)
- Agent state machine (LangGraph flows)
