"""
数据集导入服务 / Dataset import service

从 HuggingFace Hub 或 ModelScope 下载数据集并缓存到本地存储。
Download datasets from HuggingFace Hub or ModelScope and cache to local storage.
"""

import json
import logging
import os
import re
import uuid

from app.services.storage import StorageBackend

logger = logging.getLogger(__name__)

# HuggingFace URL patterns
_HF_URL_RE = re.compile(
    r"(?:https?://huggingface\.co/datasets/)?([^/]+/[^/?#]+)"
)
# ModelScope URL patterns
_MS_URL_RE = re.compile(
    r"(?:https?://(?:www\.)?modelscope\.cn/datasets/)?([^/]+/[^/?#]+)"
)


def _parse_dataset_id(source: str, raw_id: str) -> str:
    """Extract clean dataset_id from URL or bare ID."""
    raw_id = raw_id.strip().rstrip("/")
    if source == "huggingface":
        m = _HF_URL_RE.match(raw_id)
        return m.group(1) if m else raw_id
    else:
        m = _MS_URL_RE.match(raw_id)
        return m.group(1) if m else raw_id


async def import_huggingface(
    dataset_id: str,
    subset: str,
    split: str,
    storage: StorageBackend,
    job_id: str | None = None,
    hf_token: str | None = None,
) -> tuple[str, int, int]:
    """
    从 HuggingFace 下载数据集 / Download dataset from HuggingFace

    Returns:
        (source_uri, row_count, size_bytes)
    """
    from huggingface_hub import hf_hub_download, list_repo_files

    from app.config import settings
    from app.services.import_progress import update_job

    effective_token = hf_token or settings.HF_TOKEN or None

    def _progress(
        status: str = "downloading",
        phase: str = "",
        progress: float = 0.0,
    ) -> None:
        if job_id:
            update_job(job_id, status=status, phase=phase, progress=progress)

    clean_id = _parse_dataset_id("huggingface", dataset_id)
    logger.info(
        "Importing HuggingFace dataset: %s (subset=%s, split=%s)",
        clean_id, subset, split,
    )
    _progress("downloading", "正在连接 HuggingFace...", 0.05)

    # Strategy 1 (preferred): Use the `datasets` library
    try:
        _progress("downloading", "正在通过 datasets 库加载...", 0.1)
        result = await _load_via_datasets_lib(
            clean_id, subset, split, storage,
            hf_token=effective_token,
        )
        _progress("processing", "处理完成", 0.95)
        return result
    except ImportError:
        logger.info("datasets library not installed, falling back")
    except Exception as e:
        logger.warning("datasets library failed for %s: %s", clean_id, e)

    _progress("downloading", "正在查找数据文件...", 0.15)

    # Strategy 2: Try downloading a ready-made split file directly
    target_files = _find_split_files(clean_id, subset, split)
    for i, fname in enumerate(target_files):
        try:
            _progress(
                "downloading",
                f"尝试下载 {fname}...",
                0.2 + (i / max(len(target_files), 1)) * 0.3,
            )
            local_path = hf_hub_download(token=effective_token,
                repo_id=clean_id,
                filename=fname,
                repo_type="dataset",
            )
            _progress("processing", "正在处理文件...", 0.8)
            return await _store_downloaded_file(
                storage, local_path, clean_id,
            )
        except Exception:
            continue

    # Strategy 3: List repo files and download first suitable one
    try:
        _progress("downloading", "正在列举仓库文件...", 0.5)
        files = list_repo_files(clean_id, repo_type="dataset", token=effective_token)
        data_files = [
            f for f in files
            if f.endswith((".jsonl", ".json", ".csv", ".parquet"))
        ]
        if not data_files:
            raise ValueError(
                f"No downloadable data files in '{clean_id}'"
            )
        _progress("downloading", f"正在下载 {data_files[0]}...", 0.6)
        local_path = hf_hub_download(token=effective_token,
            repo_id=clean_id,
            filename=data_files[0],
            repo_type="dataset",
        )
        _progress("processing", "正在处理文件...", 0.85)
        return await _store_downloaded_file(
            storage, local_path, clean_id,
        )
    except Exception as e:
        _progress("failed", str(e), 0.0)
        raise ValueError(
            f"Failed to import HuggingFace dataset '{clean_id}': {e}"
        ) from e


async def import_modelscope(
    dataset_id: str,
    subset: str,
    split: str,
    storage: StorageBackend,
    ms_token: str | None = None,
) -> tuple[str, int, int]:
    """
    从 ModelScope 下载数据集 / Download dataset from ModelScope

    Returns:
        (source_uri, row_count, size_bytes)
    """
    clean_id = _parse_dataset_id("modelscope", dataset_id)
    logger.info("Importing ModelScope dataset: %s (subset=%s, split=%s)", clean_id, subset, split)

    try:
        from modelscope.msdatasets import MsDataset

        from app.config import settings
        effective_token = ms_token or settings.MS_TOKEN or None
        if effective_token:
            os.environ["MODELSCOPE_API_TOKEN"] = effective_token

        subset_name = subset or None
        ds = MsDataset.load(clean_id, subset_name=subset_name, split=split)

        # Convert to JSONL
        file_id = uuid.uuid4()
        key = f"uploads/{file_id}.jsonl"
        lines = []
        for item in ds:
            lines.append(json.dumps(item, ensure_ascii=False))
        content = "\n".join(lines)
        content_bytes = content.encode("utf-8")
        uri = await storage.write_file(key, content_bytes)
        return uri, len(lines), len(content_bytes)
    except ImportError:
        # Fallback: try via Git clone / direct file download
        raise ValueError(
            "ModelScope SDK (modelscope) is required to import ModelScope datasets. "
            "Install it with: pip install modelscope"
        )
    except Exception as e:
        raise ValueError(
            f"Failed to import ModelScope dataset '{clean_id}': {e}"
        ) from e


def _find_split_files(repo_id: str, subset: str, split: str) -> list[str]:
    """Try to guess common file paths for a given split."""
    candidates = []
    prefixes = [f"data/{split}", split]
    if subset:
        prefixes = [f"{subset}/{split}", f"data/{subset}/{split}"] + prefixes
    for prefix in prefixes:
        candidates.append(f"{prefix}.jsonl")
        candidates.append(f"{prefix}.json")
        candidates.append(f"{prefix}.csv")
        candidates.append(f"{prefix}.parquet")
    return candidates


async def _store_downloaded_file(
    storage: StorageBackend, local_path: str, dataset_id: str
) -> tuple[str, int, int]:
    """Store a locally downloaded file into the storage backend."""
    ext = os.path.splitext(local_path)[1].lower()
    file_id = uuid.uuid4()
    key = f"uploads/{file_id}{ext}"

    with open(local_path, "rb") as f:
        content = f.read()
    uri = await storage.write_file(key, content)
    size_bytes = len(content)

    # Count rows
    row_count = 0
    try:
        text = content.decode("utf-8")
        if ext == ".json":
            data = json.loads(text)
            row_count = len(data) if isinstance(data, list) else 1
        elif ext in (".jsonl", ""):
            row_count = sum(1 for line in text.splitlines() if line.strip())
        elif ext == ".csv":
            row_count = max(0, text.count("\n") - 1)  # minus header
    except Exception:
        pass

    return uri, row_count, size_bytes


async def _load_via_datasets_lib(
    repo_id: str, subset: str, split: str, storage: StorageBackend,
    hf_token: str | None = None,
) -> tuple[str, int, int]:
    """Load via HuggingFace `datasets` library and convert to JSONL."""
    from datasets import load_dataset

    from app.config import settings

    kwargs: dict = {"path": repo_id, "split": split, "trust_remote_code": True}
    if subset:
        kwargs["name"] = subset
    effective_token = hf_token or settings.HF_TOKEN
    if effective_token:
        kwargs["token"] = effective_token

    ds = load_dataset(**kwargs)
    file_id = uuid.uuid4()
    key = f"uploads/{file_id}.jsonl"

    lines = []
    for item in ds:
        lines.append(json.dumps(dict(item), ensure_ascii=False))
    content = "\n".join(lines)
    content_bytes = content.encode("utf-8")
    uri = await storage.write_file(key, content_bytes)
    return uri, len(lines), len(content_bytes)
