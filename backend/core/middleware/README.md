# Middleware

FastAPI middleware for cross-cutting HTTP concerns.

## Planned Middleware

| Middleware          | Purpose                                    |
|---------------------|--------------------------------------------|
| `CORSMiddleware`    | Allow frontend origin (`FRONTEND_URL`)     |
| `RequestIDMiddleware`| Assign/propagate `X-Request-ID` header   |
| `TimingMiddleware`  | Log request duration                       |
| `ErrorMiddleware`   | Catch unhandled exceptions, return 500     |

## Registration Order

Middleware executes in reverse registration order:

1. Error (outermost)
2. Timing
3. Request ID
4. CORS (innermost, before route handler)

## Configuration

CORS origins loaded from settings — allow localhost in dev, specific domain in production.
