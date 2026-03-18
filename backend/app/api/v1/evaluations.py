"""Evaluation task endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_db
from app.db.models import Evaluation, TaskStatus
from app.security import get_current_user

router = APIRouter()


# Pydantic models
class GenerationConfig(SQLModel):
    """Generation configuration."""
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    top_p: Optional[float] = 0.9
    top_k: Optional[int] = 50


class DatasetArgs(SQLModel):
    """Dataset arguments."""
    limit: Optional[int] = None
    few_shot_num: Optional[int] = 0
    few_shot_random: Optional[bool] = True


class EvalConfig(SQLModel):
    """Evaluation configuration."""
    metrics: Optional[List[str]] = ["exact_match"]
    eval_type: Optional[str] = "native"


class EvaluationCreate(SQLModel):
    """Evaluation create model."""
    name: str
    description: Optional[str] = None
    model_id: int
    dataset_id: int
    generation_config: Optional[GenerationConfig] = None
    dataset_args: Optional[DatasetArgs] = None
    eval_config: Optional[EvalConfig] = None


class EvaluationUpdate(SQLModel):
    """Evaluation update model."""
    status: Optional[str] = None
    progress: Optional[float] = None
    metrics: Optional[dict] = None


class EvaluationResponse(SQLModel):
    """Evaluation response model."""
    id: int
    name: str
    description: Optional[str] = None
    model_id: int
    dataset_id: int
    status: str
    progress: float
    metrics: Optional[dict] = None
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None


class EvaluationDetailResponse(EvaluationResponse):
    """Detailed evaluation response."""
    generation_config: Optional[dict] = None
    dataset_args: Optional[dict] = None
    eval_config: Optional[dict] = None


@router.get("", response_model=List[EvaluationResponse])
async def list_evaluations(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all evaluations."""
    query = select(Evaluation).where(Evaluation.user_id == current_user["id"])
    if status:
        query = query.where(Evaluation.status == TaskStatus(status))
    query = query.order_by(Evaluation.created_at.desc()).offset(skip).limit(limit)

    result = await db.exec(query)
    evaluations = result.all()

    return [EvaluationResponse(
        id=e.id,
        name=e.name,
        description=e.description,
        model_id=e.model_config_id,
        dataset_id=e.dataset_id,
        status=e.status,
        progress=e.progress,
        metrics=e.metrics,
        created_at=e.created_at.isoformat(),
        updated_at=e.updated_at.isoformat(),
        completed_at=e.completed_at.isoformat() if e.completed_at else None
    ) for e in evaluations]


@router.post("", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    evaluation: EvaluationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new evaluation task."""
    db_evaluation = Evaluation(
        name=evaluation.name,
        description=evaluation.description,
        model_config_id=evaluation.model_id,
        dataset_id=evaluation.dataset_id,
        user_id=current_user["id"],
        generation_config=evaluation.generation_config.model_dump() if evaluation.generation_config else None,
        dataset_args=evaluation.dataset_args.model_dump() if evaluation.dataset_args else None,
        eval_config=evaluation.eval_config.model_dump() if evaluation.eval_config else None,
        status=TaskStatus.PENDING,
        progress=0.0,
    )
    db.add(db_evaluation)
    await db.commit()
    await db.refresh(db_evaluation)

    return EvaluationResponse(
        id=db_evaluation.id,
        name=db_evaluation.name,
        description=db_evaluation.description,
        model_id=db_evaluation.model_config_id,
        dataset_id=db_evaluation.dataset_id,
        status=db_evaluation.status,
        progress=db_evaluation.progress,
        metrics=db_evaluation.metrics,
        created_at=db_evaluation.created_at.isoformat(),
        updated_at=db_evaluation.updated_at.isoformat(),
        completed_at=None
    )


@router.get("/{evaluation_id}", response_model=EvaluationDetailResponse)
async def get_evaluation(
    evaluation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get evaluation details."""
    result = await db.exec(
        select(Evaluation).where(
            Evaluation.id == evaluation_id,
            Evaluation.user_id == current_user["id"]
        )
    )
    evaluation = result.first()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    return EvaluationDetailResponse(
        id=evaluation.id,
        name=evaluation.name,
        description=evaluation.description,
        model_id=evaluation.model_config_id,
        dataset_id=evaluation.dataset_id,
        status=evaluation.status,
        progress=evaluation.progress,
        metrics=evaluation.metrics,
        generation_config=evaluation.generation_config,
        dataset_args=evaluation.dataset_args,
        eval_config=evaluation.eval_config,
        created_at=evaluation.created_at.isoformat(),
        updated_at=evaluation.updated_at.isoformat(),
        completed_at=evaluation.completed_at.isoformat() if evaluation.completed_at else None
    )


@router.patch("/{evaluation_id}", response_model=EvaluationResponse)
async def update_evaluation(
    evaluation_id: int,
    update: EvaluationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update an evaluation."""
    result = await db.exec(
        select(Evaluation).where(
            Evaluation.id == evaluation_id,
            Evaluation.user_id == current_user["id"]
        )
    )
    evaluation = result.first()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    if update.status:
        evaluation.status = TaskStatus(update.status)
    if update.progress is not None:
        evaluation.progress = update.progress
    if update.metrics is not None:
        evaluation.metrics = update.metrics

    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)

    return EvaluationResponse(
        id=evaluation.id,
        name=evaluation.name,
        description=evaluation.description,
        model_id=evaluation.model_config_id,
        dataset_id=evaluation.dataset_id,
        status=evaluation.status,
        progress=evaluation.progress,
        metrics=evaluation.metrics,
        created_at=evaluation.created_at.isoformat(),
        updated_at=evaluation.updated_at.isoformat(),
        completed_at=evaluation.completed_at.isoformat() if evaluation.completed_at else None
    )


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evaluation(
    evaluation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete an evaluation."""
    result = await db.exec(
        select(Evaluation).where(
            Evaluation.id == evaluation_id,
            Evaluation.user_id == current_user["id"]
        )
    )
    evaluation = result.first()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    await db.delete(evaluation)
    await db.commit()
