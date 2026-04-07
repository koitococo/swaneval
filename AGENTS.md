# SwanEVAL — Agent Guide

## Quick Start

```bash
# Infra only (no app services)
docker compose up -d postgres redis

# Backend (from repo root)
cd backend && uv sync && uv run alembic upgrade head && uv run uvicorn app.main:app --reload --port 8000

# Frontend (from repo root)
cd frontend && pnpm install && pnpm dev
```

**Env file**: `backend/.env` (not committed — create from README examples)

## Verification Commands

```bash
# Backend lint
uv run ruff check backend/

# Backend tests (requires postgres/redis running)
cd backend && uv run pytest

# Frontend typecheck + build
cd frontend && pnpm build

# Migrations
cd backend && uv run alembic upgrade head
uv run alembic revision --autogenerate -m "description"
```

## Architecture

- **Backend entry**: `backend/app/main.py` — FastAPI app with lifespan handler
- **Config**: `backend/app/config.py` — pydantic-settings, env var loading
- **Database**: `backend/app/database.py` — async SQLModel sessions
- **Models**: `backend/app/models/*.py` — one file per domain
- **API routes**: `backend/app/api/v1/*.py` — prefixed `/api/v1/`
- **Preset data**: `backend/app/data/preset_datasets.json`, `preset_criteria.json`
- **EvalScope**: Standalone evaluation engine service (port 9000)
- **Sandbox**: Optional secure code execution service (profile: `sandbox`)

## Key Conventions

### Backend
- **Python package manager**: `uv` (not pip)
- **Database models**: SQLModel with `table=True`, always include `id` (UUID), `created_at`, `updated_at`
- **Migrations**: Alembic — autogenerate with `uv run alembic revision --autogenerate -m "desc"`
- **Auth**: JWT via `python-jose`, password hashing via `passlib[bcrypt]`
- **API deps**: `backend/app/api/deps.py` — `get_db`, `get_current_user`, `require_role()`
- **Lifespan handler** (`main.py`): resets stale deploying models and running tasks from previous crash/restart on startup
- **Embedded worker**: runs inside API process by default (`EMBEDDED_WORKER=true`). Set `false` for standalone worker mode

### Frontend
- **Package manager**: `pnpm@10.32.1`
- **Data fetching**: React Query hooks in `lib/hooks/` — query keys: `['datasets', id, 'preview']`, etc.
- **Auth state**: Zustand store in `lib/stores/auth.ts` — token in localStorage
- **API client**: `lib/api.ts` — Axios with JWT interceptor, 401 → redirect to `/login`
- **Forms**: Zod schemas + `zodResolver` + react-hook-form
- **Components**: shadcn/ui primitives — compose into domain components in `components/` subdirs
- **List views**: DataTable pattern (sortable, filterable, paginated)
- **Error handling**: React Query `onError` → shadcn Toast

## Roles & Permissions

| Role | Capabilities |
|------|-------------|
| admin | Full access, user management |
| data_admin | CRUD datasets & criteria, view all results |
| engineer | Run tasks, view permitted datasets/results |
| viewer | View permitted results & reports only |

Enforced in `deps.py` via `require_role(*roles)` dependency.

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| EvalScope | http://localhost:9000 |

## Monorepo Structure

```
backend/          # FastAPI + SQLModel + Alembic
  app/
    models/       # SQLModel table classes
    schemas/      # Pydantic request/response schemas
    api/v1/       # Route modules
    services/     # Business logic
    tasks/        # Background/scheduled tasks
  tests/          # pytest test suite
  alembic/versions/
frontend/         # Next.js 14 App Router
  app/            # Pages (App Router)
  components/     # React components (ui/ + domain subdirs)
  lib/
    api.ts        # Axios instance
    hooks/        # React Query hooks
    stores/       # Zustand stores
evalscope/        # Standalone evaluation engine service
sandbox/          # Secure code execution sandbox service
```

## Gotchas

- `docker compose up --build -d` builds ALL services (frontend, backend, optional worker). For local dev, use the infra-only command above.
- `EMBEDDED_WORKER=true` (default): worker runs in API process. `false`: run `python -m app.worker` separately or use `--profile worker`
- Storage root: `backend/data/` (gitignored). Preserves uploads, evalscope_outputs.
- Storage backend: `local` (default) or `s3` — configured via `STORAGE_BACKEND` env var
- Frontend API baseURL is `/api/v1` (proxied via Next.js), not `localhost:8000`.
- `preset_datasets.json` and `preset_criteria.json` are loaded at `database.py` import time — if you modify them, restart the backend.
- EvalScope service must be running for evaluation features — started automatically in docker compose
- Sandbox service requires docker.sock mount (security warning in docker-compose.yml) — only use in dev/test
