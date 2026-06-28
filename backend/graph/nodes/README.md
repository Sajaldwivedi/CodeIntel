# Graph Nodes

Individual node functions that compose LangGraph agent workflows.

## Node Types

| Node               | Role                                         |
|--------------------|----------------------------------------------|
| `route`            | Classify intent, select next path            |
| `retrieve_semantic`| ChromaDB similarity search                   |
| `retrieve_graph`   | Neo4j Cypher query execution                 |
| `read_file`        | Fetch full file content from clone           |
| `decompose`        | Break complex question into sub-queries      |
| `synthesize`       | Combine retrieved context into answer        |
| `generate_diagram` | Produce Mermaid architecture diagram         |
| `validate`         | Check answer quality, decide to retry        |

## Node Contract

Each node:
- Receives typed state (see `state/`)
- Returns partial state update
- Is a pure function w.r.t. side effects (tools handle I/O)
- Logs input/output for LangSmith tracing

## Conditional Edges

Router node uses conditional edges to branch:

```
route → architecture → retrieve_graph → synthesize
      → exploration  → retrieve_semantic → synthesize
      → debugging    → retrieve_semantic → read_file → synthesize
```

## Error Nodes

Dedicated error handling nodes for graceful degradation when tools fail.
