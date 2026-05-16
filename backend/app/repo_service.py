import shutil
import uuid
from pathlib import Path
from git import Repo


TEMP_REPO_BASE = Path("backend/temp_repos")
TEMP_REPO_BASE.mkdir(parents=True, exist_ok=True)


def clone_repository(repo_url: str) -> Path:
    repo_id = str(uuid.uuid4())[:8]
    target_path = TEMP_REPO_BASE / f"repo_{repo_id}"

    try:
        Repo.clone_from(repo_url, target_path)
        return target_path
    except Exception as e:
        if target_path.exists():
            shutil.rmtree(target_path, ignore_errors=True)
        raise RuntimeError(f"Failed to clone repository: {str(e)}")


def cleanup_repository(repo_path: Path) -> None:
    if repo_path.exists() and repo_path.is_dir():
        shutil.rmtree(repo_path, ignore_errors=True)