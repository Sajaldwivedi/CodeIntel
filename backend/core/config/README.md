# Configuration

Application settings using Pydantic `BaseSettings`.

## Planned Modules

| File            | Contents                                    |
|-----------------|---------------------------------------------|
| `settings.py`   | Root `Settings` class aggregating all config|
| `database.py`   | ChromaDB and Neo4j connection settings      |
| `llm.py`        | LLM provider, model names, API keys         |
| `app.py`        | App name, debug, CORS origins, ports        |

## Usage

```python
from core.config.settings import get_settings

settings = get_settings()  # cached singleton
```

## Environment Loading

- Reads from `.env` file in development
- Environment variables override `.env` values
- Validates required keys at startup (fail fast)

## Required Variables

See root `.env.example` for the full list.
