FROM node:24 AS frontend-builder

ARG npm_registry=https://registry.npmjs.org/
RUN npm install -g pnpm@latest-10 --registry=${npm_registry}

WORKDIR /app

RUN pnpm config set manage-package-manager-versions false

RUN --mount=type=cache,id=pnpm-cache,target=/cache \
    --mount=type=bind,source=./frontend/pnpm-lock.yaml,target=/app/pnpm-lock.yaml \
    PNPM_HOME=/cache \
    NODE_ENV=production \
    pnpm fetch --registry=${npm_registry}

COPY ./frontend/ /app

RUN --mount=type=cache,id=pnpm-cache,target=/cache \
    --network=none \
    NODE_ENV=production \
    CI=true \
    PNPM_HOME=/cache \
    pnpm install -r --offline --frozen-lockfile --registry=${npm_registry}

RUN NODE_ENV=production \
    CI=true \
    pnpm run build

FROM node:24-slim AS frontend
USER 1000:1000
WORKDIR /app

COPY --from=frontend-builder --chown=1000:1000 /app/.next/standalone /app
COPY --from=frontend-builder --chown=1000:1000 /app/.next/static /app/.next/static
COPY --from=frontend-builder --chown=1000:1000 /app/public /app/public

ENV PORT=3000 HOSTNAME="0.0.0.0" NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
EXPOSE 3000
CMD ["node", "/app/server.js"]
HEALTHCHECK --interval=30s --timeout=2s --start-period=5s --retries=5 CMD [ "node", "-e", "await fetch('http://127.0.0.1:3000')" ]

FROM python:3.12-slim AS backend
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

RUN --mount=type=cache,id=uv-cache,target=/cache,uid=1000,gid=1000 \
    --mount=type=bind,source=./backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=./backend/pyproject.toml,target=pyproject.toml \
    uv --cache-dir=/cache sync --frozen --no-install-project --compile-bytecode --no-dev --allow-insecure-host '*'

COPY ./backend/ .

EXPOSE 8000
CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
