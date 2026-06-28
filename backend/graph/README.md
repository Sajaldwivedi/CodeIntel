# LangGraph Agents

Agentic AI workflows powered by LangGraph and LangChain.

## Architecture

LangGraph defines stateful, multi-step agent workflows as directed graphs:

```
User Query → Router Node → [Research | Graph Query | Code Search] → Synthesis → Response
```

## Submodules

| Module    | Purpose                                    |
|-----------|--------------------------------------------|
| `agents/` | Complete agent graph definitions           |
| `nodes/`  | Individual graph node functions            |
| `tools/`  | Tools agents can invoke                    |
| `state/`  | Typed state schemas for graph execution    |

## Planned Agents

| Agent              | Purpose                                   |
|--------------------|-------------------------------------------|
| `router_agent`     | Classify user intent and route            |
| `research_agent`   | Multi-step code research with tools         |
| `analysis_agent`   | Architectural analysis and synthesis        |
| `explore_agent`    | Open-ended codebase exploration             |

## LangSmith

All agent runs traced with:
- Input/output at each node
- Tool call arguments and results
- Token usage and latency per step
- Tagged by agent name and repository ID

## State Management

Graph state is typed (see `state/`) and persisted for multi-turn conversations.
