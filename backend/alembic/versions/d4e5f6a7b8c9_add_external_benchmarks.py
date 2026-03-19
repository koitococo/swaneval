"""add external_benchmarks table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-03-19
"""
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

from alembic import op

revision = "d4e5f6a7b8c9"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def _has_table(table: str) -> bool:
    bind = op.get_bind()
    return table in sa_inspect(bind).get_table_names()


def upgrade() -> None:
    if _has_table("external_benchmarks"):
        return
    op.create_table(
        "external_benchmarks",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("model_name", sa.String(length=256), nullable=False),
        sa.Column("provider", sa.String(), server_default="", nullable=False),
        sa.Column("benchmark_name", sa.String(length=256), nullable=False),
        sa.Column("score", sa.Float(), server_default="0", nullable=False),
        sa.Column("score_display", sa.String(), server_default="", nullable=False),
        sa.Column("source_url", sa.String(), server_default="", nullable=False),
        sa.Column("source_platform", sa.String(), server_default="", nullable=False),
        sa.Column("notes", sa.String(), server_default="", nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_external_benchmarks_model_name", "external_benchmarks", ["model_name"])


def downgrade() -> None:
    op.drop_index("ix_external_benchmarks_model_name")
    op.drop_table("external_benchmarks")
