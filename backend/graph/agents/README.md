# Agent Definitions

Complete LangGraph `StateGraph` definitions for each agent workflow.

## Planned Agents

### Router Agent
Classifies incoming queries into categories:
- `architecture` — structural/design questions
- `debugging` — error tracing and root cause
- `exploration` — general codebase navigation
- `dependency` — import/call graph questions

### Research Agent
Multi-step retrieval loop:
1. Decompose question into sub-queries
2. Semantic search (ChromaDB)
3. Graph traversal (Neo4j)
4. Read specific files
5. Synthesize findings

### Analysis Agent
Deep architectural analysis:
1. Gather module-level context
2. Build dependency subgraph
3. Identify patterns and boundaries
4. Generate structured report with Mermaid diagrams

## Graph Compilation

Each agent exports a compiled graph:

```python
# To be implemented
analysis_agent = build_analysis_graph()
result = await analysis_agent.ainvoke(initial_state)
```
