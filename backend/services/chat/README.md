# Chat Service

Manages agentic conversations about indexed repositories.

## Features (Planned)

- Multi-turn conversation with memory
- Streaming SSE responses to frontend
- Tool use: semantic search, graph query, file read
- Conversation persistence and history
- Repository-scoped context (user selects which repo to discuss)

## Agent Integration

Delegates to LangGraph agents in `graph/agents/`:

- **Router agent** — Classifies intent (architecture, debugging, exploration)
- **Research agent** — Retrieves relevant code and graph context
- **Synthesis agent** — Generates final answer with citations

## Streaming Protocol

Server-Sent Events (SSE) with event types:

```
event: token       — partial LLM token
event: tool_call   — agent invoked a tool
event: citation    — source file/line reference
event: done        — stream complete
event: error       — recoverable or fatal error
```
