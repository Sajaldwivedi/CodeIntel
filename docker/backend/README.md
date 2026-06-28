# Backend Dockerfile

Production image for the FastAPI API server.

## Image Stages (Planned)

1. **base** — Python 3.11 slim, system deps
2. **builder** — Install Python dependencies
3. **runtime** — Copy app, non-root user, expose 8000

## Build

```bash
docker build -f docker/backend/Dockerfile -t ase-backend .
```

## Runtime

- User: non-root `appuser`
- Port: 8000
- Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Health check: `GET /api/v1/health`

## Notes

- Tree-Sitter native libraries require build tools in builder stage
- Multi-stage build keeps final image slim (~200MB target)
