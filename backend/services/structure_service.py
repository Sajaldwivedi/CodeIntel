import logging
from typing import Any

from parser.code_parser import parse_code_file
from parser.metadata_extractor import normalize_entities, summarize_entities
from services.clone_service import resolve_repo_path
from services.file_reader import read_code_files

logger = logging.getLogger(__name__)


def extract_repository_entities(repo_name: str) -> tuple[str, list[dict[str, Any]]]:
    canonical_repo_name, repo_path = resolve_repo_path(repo_name)
    if not repo_path.exists():
        raise FileNotFoundError(f"Repository '{repo_name}' not found in data/repositories")

    files = read_code_files(repo_path)
    entities: list[dict[str, Any]] = []

    for file_data in files:
        file_path = file_data["file"]
        raw_entities = parse_code_file(file_path=file_path, content=file_data["content"])
        normalized = normalize_entities(raw_entities, file_path=file_path)

        for item in normalized:
            item["repo"] = canonical_repo_name
        entities.extend(normalized)

    logger.info(
        "Extracted %d code entities from %d files for repository %s",
        len(entities),
        len(files),
        canonical_repo_name,
    )
    return canonical_repo_name, entities


def get_structure_summary(repo_name: str, sample_size: int = 10) -> dict[str, Any]:
    canonical_repo_name, entities = extract_repository_entities(repo_name)
    summary = summarize_entities(entities)

    return {
        "repo_name": canonical_repo_name,
        "classes": summary["classes"],
        "functions": summary["functions"],
        "methods": summary["methods"],
        "imports": summary["imports"],
        "sample_entities": entities[:sample_size],
    }
