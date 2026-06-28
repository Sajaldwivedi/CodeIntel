# Core Layer

Cross-cutting infrastructure shared across the application. No business logic.

## Submodules

| Module         | Purpose                                         |
|----------------|-------------------------------------------------|
| `config/`      | Settings management via Pydantic Settings       |
| `llm/`         | LLM provider abstraction (Gemini, OpenAI-compat)|
| `logging/`     | Structured logging configuration                |
| `exceptions/`  | Domain and HTTP exception hierarchy             |
| `middleware/`  | FastAPI middleware (CORS, timing, request ID)   |

## Design Principles

- Loaded once at application startup via lifespan events
- Environment-driven configuration (12-factor app)
- Provider pattern for swappable LLM backends
- All secrets from environment variables, never hardcoded

## Application Factory

`main.py` (to be implemented) will:

1. Load settings from `core/config/`
2. Configure logging
3. Register middleware
4. Mount API routers
5. Initialize connection pools on startup, close on shutdown
