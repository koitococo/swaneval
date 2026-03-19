"""add gpu_ids and env_vars to eval_tasks

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-19
"""
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

from alembic import op

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    columns = [c["name"] for c in sa_inspect(bind).get_columns(table)]
    return column in columns


def upgrade() -> None:
    t = "eval_tasks"
    if not _has_column(t, "gpu_ids"):
        op.add_column(t, sa.Column(
            "gpu_ids", sa.String(), server_default="", nullable=False,
        ))
    if not _has_column(t, "env_vars"):
        op.add_column(t, sa.Column(
            "env_vars", sa.String(), server_default="", nullable=False,
        ))


def downgrade() -> None:
    op.drop_column("eval_tasks", "env_vars")
    op.drop_column("eval_tasks", "gpu_ids")
