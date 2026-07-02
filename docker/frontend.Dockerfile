# Frontend dev image (Vite dev server). A separate multi-stage build image will
# be introduced for production static hosting in a later phase.
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first for better layer caching.
COPY frontend/package.json /app/package.json
RUN npm install

# Copy the rest of the frontend source.
COPY frontend /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
