"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.db.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description="Enterprise-grade GUI for EvalScope model evaluation framework",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Import and include routers
from app.api.v1 import models, datasets, evaluations, results, tasks, auth

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["datasets"])
app.include_router(evaluations.router, prefix="/api/v1/evaluations", tags=["evaluations"])
app.include_router(results.router, prefix="/api/v1/results", tags=["results"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}