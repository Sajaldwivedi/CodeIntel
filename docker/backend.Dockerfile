# Backend image. Build context is the repository root so the backend can also
# import the sibling `services/` and `shared/` packages.
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    # Repo root on the path so `import services...` / `import shared...` resolve.
    PYTHONPATH=/app

WORKDIR /app

# Install dependencies first for better layer caching.
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code.
COPY backend /app/backend
COPY services /app/services
COPY shared /app/shared

WORKDIR /app/backend

EXPOSE 8000

# Reload is enabled for the scaffold/dev workflow; disable in production images.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
