# Frontend Dockerfile

Production image serving the React SPA via nginx.

## Image Stages (Planned)

1. **builder** — Node 20, npm ci, vite build
2. **runtime** — nginx:alpine serving `dist/`

## Build

```bash
docker build -f docker/frontend/Dockerfile -t ase-frontend .
```

## nginx Configuration

- SPA fallback: all routes → `index.html`
- `/api` proxied to backend service
- Gzip compression enabled
- Static asset caching headers

## Runtime

- Port: 80 (mapped to 5173 in compose)
- No Node.js in production image
