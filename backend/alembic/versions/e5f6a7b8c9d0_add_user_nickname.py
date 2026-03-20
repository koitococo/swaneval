"""add nickname to users

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
"""
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

from alembic import op

revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def _has_column(table, column):
    bind = op.get_bind()
    return column in [c["name"] for c in sa_inspect(bind).get_columns(table)]


def upgrade():
    if not _has_column("users", "nickname"):
        op.add_column("users", sa.Column(
            "nickname", sa.String(64), server_default="", nullable=False,
        ))


def downgrade():
    op.drop_column("users", "nickname")
