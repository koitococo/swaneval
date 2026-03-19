"""add dataset subscription fields

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-19
"""
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

from alembic import op

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    columns = [c["name"] for c in sa_inspect(bind).get_columns(table)]
    return column in columns


def upgrade() -> None:
    cols = {
        "auto_update": sa.Column(
            "auto_update", sa.Boolean(), server_default="false", nullable=False,
        ),
        "update_interval_hours": sa.Column(
            "update_interval_hours", sa.Integer(), server_default="24", nullable=False,
        ),
        "last_synced_at": sa.Column("last_synced_at", sa.DateTime(), nullable=True),
        "sync_status": sa.Column("sync_status", sa.String(), server_default="", nullable=False),
        "hf_dataset_id": sa.Column("hf_dataset_id", sa.String(), server_default="", nullable=False),
        "hf_subset": sa.Column("hf_subset", sa.String(), server_default="", nullable=False),
        "hf_split": sa.Column("hf_split", sa.String(), server_default="test", nullable=False),
        "hf_last_sha": sa.Column("hf_last_sha", sa.String(), server_default="", nullable=False),
    }
    for name, col in cols.items():
        if not _has_column("datasets", name):
            op.add_column("datasets", col)


def downgrade() -> None:
    for name in ["hf_last_sha", "hf_split", "hf_subset", "hf_dataset_id",
                  "sync_status", "last_synced_at", "update_interval_hours", "auto_update"]:
        op.drop_column("datasets", name)
