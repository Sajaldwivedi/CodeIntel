import logging
from pathlib import Path

from git import Repo

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPOSITORIES_DIR = PROJECT_ROOT / "data" / "repositories"


def extract_repo_name(repo_url: str) -> str:
    cleaned = repo_url.strip().rstrip("/")
    name = cleaned.split("/")[-1]
    if name.endswith(".git"):
        name = name[:-4]
    if not name:
        raise ValueError("Unable to extract repository name from URL")
    return name


def normalize_repo_identifier(value: str) -> str:
    candidate = value.strip()
    if not candidate:
        raise ValueError("Repository name cannot be empty")

    if "/" in candidate:
        return extract_repo_name(candidate)

    if candidate.endswith(".git"):
        candidate = candidate[:-4]

    return candidate


def resolve_repo_path(repo_identifier: str) -> tuple[str, Path]:
    REPOSITORIES_DIR.mkdir(parents=True, exist_ok=True)
    normalized = normalize_repo_identifier(repo_identifier)

    existing_dirs = [path for path in REPOSITORIES_DIR.iterdir() if path.is_dir()]
    exact_lookup = {path.name: path for path in existing_dirs}
    if normalized in exact_lookup:
        matched = exact_lookup[normalized]
        return matched.name, matched

    lowercase_lookup = {path.name.lower(): path for path in existing_dirs}
    matched = lowercase_lookup.get(normalized.lower())
    if matched is not None:
        return matched.name, matched

    direct_path = REPOSITORIES_DIR / normalized
    return normalized, direct_path


def list_available_repositories() -> list[str]:
    REPOSITORIES_DIR.mkdir(parents=True, exist_ok=True)
    return sorted([path.name for path in REPOSITORIES_DIR.iterdir() if path.is_dir()])


def clone_repository(repo_url: str) -> str:
    repo_name = extract_repo_name(repo_url)
    _, destination = resolve_repo_path(repo_name)

    REPOSITORIES_DIR.mkdir(parents=True, exist_ok=True)

    if destination.exists() and any(destination.iterdir()):
        logger.info("Repository already exists. Skipping clone: %s", repo_name)
        return repo_name

    logger.info("Cloning repository %s into %s", repo_url, destination)
    Repo.clone_from(repo_url, destination)
    return repo_name
