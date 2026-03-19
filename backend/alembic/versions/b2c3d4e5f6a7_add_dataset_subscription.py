"""add dataset subscription fields

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("datasets", sa.Column("auto_update", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("datasets", sa.Column("update_interval_hours", sa.Integer(), server_default="24", nullable=False))
    op.add_column("datasets", sa.Column("last_synced_at", sa.DateTime(), nullable=True))
    op.add_column("datasets", sa.Column("sync_status", sa.String(), server_default="", nullable=False))
    op.add_column("datasets", sa.Column("hf_dataset_id", sa.String(), server_default="", nullable=False))
    op.add_column("datasets", sa.Column("hf_subset", sa.String(), server_default="", nullable=False))
    op.add_column("datasets", sa.Column("hf_split", sa.String(), server_default="test", nullable=False))
    op.add_column("datasets", sa.Column("hf_last_sha", sa.String(), server_default="", nullable=False))


def downgrade() -> None:
    op.drop_column("datasets", "hf_last_sha")
    op.drop_column("datasets", "hf_split")
    op.drop_column("datasets", "hf_subset")
    op.drop_column("datasets", "hf_dataset_id")
    op.drop_column("datasets", "sync_status")
    op.drop_column("datasets", "last_synced_at")
    op.drop_column("datasets", "update_interval_hours")
    op.drop_column("datasets", "auto_update")
