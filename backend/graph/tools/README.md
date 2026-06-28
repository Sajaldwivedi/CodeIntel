# Agent Tools

LangChain tools that agents invoke during graph execution.

## Planned Tools

| Tool                  | Description                              |
|-----------------------|------------------------------------------|
| `semantic_search`     | Vector similarity search in ChromaDB     |
| `graph_query`         | Execute Cypher query against Neo4j       |
| `get_file_content`    | Read source file from cloned repo        |
| `list_directory`      | List files in a directory path           |
| `get_symbol_info`     | Look up function/class definition        |
| `get_dependencies`    | Get imports/calls for a symbol           |
| `get_dependents`      | Reverse dependency lookup                 |
| `search_symbols`      | Find symbols by name across codebase     |

## Tool Design

Each tool:
- Has a clear name and description for LLM tool selection
- Accepts typed arguments (Pydantic model)
- Returns structured JSON (not raw strings)
- Is scoped to a single `repo_id`
- Handles errors gracefully with informative messages

## Registration

Tools registered per-agent based on capability needs:

- Research agent: all tools
- Analysis agent: graph + semantic + symbol tools
- Router agent: no tools (classification only)
