# Development Scripts

Helper scripts for local development workflow.

## Planned Scripts

| Script            | Description                              |
|-------------------|------------------------------------------|
| `setup.sh`        | Create venv, install deps, copy .env     |
| `start-infra.sh`  | Start Docker infra (neo4j, chroma, redis)|
| `start-dev.sh`    | Start backend + frontend concurrently    |
| `seed.sh`         | Index a sample repo for development      |
| `generate-types.sh`| Generate TS types from OpenAPI spec     |

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker Desktop
- Git

## First-Time Setup

```bash
./scripts/dev/setup.sh
cp .env.example .env
# Edit .env with API keys
./scripts/dev/start-infra.sh
```
