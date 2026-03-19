"""add description model_name max_tokens to llm_models

Revision ID: 3c480426f2f1
Revises:
Create Date: 2026-03-19
"""
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

from alembic import op

revision = "3c480426f2f1"
down_revision = None
branch_labels = None
depends_on = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    columns = [c["name"] for c in sa_inspect(bind).get_columns(table)]
    return column in columns


def upgrade() -> None:
    t = "llm_models"
    if not _has_column(t, "description"):
        op.add_column(t, sa.Column(
            "description", sa.String(), server_default="", nullable=False,
        ))
    if not _has_column(t, "model_name"):
        op.add_column(t, sa.Column(
            "model_name", sa.String(), server_default="", nullable=False,
        ))
    if not _has_column(t, "max_tokens"):
        op.add_column(t, sa.Column("max_tokens", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("llm_models", "max_tokens")
    op.drop_column("llm_models", "model_name")
    op.drop_column("llm_models", "description")
