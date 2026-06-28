# API v1

Version 1 of the public HTTP API. All client-facing routes live here.

## Versioning Strategy

- Prefix: `/api/v1`
- Breaking changes require a new version (`v2`)
- Deprecation headers on sunset endpoints

## Router Aggregation

`router.py` will mount all endpoint routers:

```
/api/v1/health
/api/v1/repositories
/api/v1/analysis
/api/v1/chat
/api/v1/graph
```

## OpenAPI

FastAPI auto-generates OpenAPI docs at `/docs` and `/redoc` once implemented.
