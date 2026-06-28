# Chat Components

UI components for the agentic conversation interface.

## Planned Components

| Component           | Description                                |
|---------------------|--------------------------------------------|
| `ChatWindow`        | Full chat interface container              |
| `MessageList`       | Scrollable message history                 |
| `MessageBubble`     | Single message with role styling           |
| `ChatInput`         | Text input with send button                |
| `StreamingMessage`  | Live token-by-token assistant response     |
| `CitationBadge`     | Clickable source file/line reference       |
| `ToolCallIndicator` | Shows when agent is using a tool           |

## Streaming UX

- Assistant messages render tokens as they arrive (SSE)
- Tool call indicators show spinner during agent research
- Citations appear inline and link to file viewer

## Markdown Support

Assistant responses rendered as Markdown with syntax-highlighted code blocks.
