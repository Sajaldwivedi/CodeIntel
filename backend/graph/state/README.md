# Graph State

Typed state schemas for LangGraph agent execution.

## Base State

```python
class AgentState(TypedDict):
    repo_id: str
    query: str
    messages: list[BaseMessage]
    retrieved_chunks: list[CodeChunk]
    graph_results: list[GraphNode]
    citations: list[Citation]
    answer: str | None
    intent: str | None
    iteration: int
    max_iterations: int
```

## State Schemas (Planned)

| Schema              | Used By          | Additional Fields           |
|---------------------|------------------|-----------------------------|
| `RouterState`       | Router agent     | intent, confidence          |
| `ResearchState`     | Research agent   | sub_queries, tool_calls     |
| `AnalysisState`     | Analysis agent   | diagram, modules_analyzed   |
| `ChatState`         | Chat service     | conversation_id, history    |

## Reducers

LangGraph reducers for list fields:
- `messages` — append new messages
- `retrieved_chunks` — append with deduplication by chunk ID
- `citations` — append unique citations

## Persistence

Chat state persisted between turns via `conversation_id` for multi-turn conversations.
