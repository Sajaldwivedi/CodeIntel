import logging
from pathlib import Path

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx"}
IGNORED_DIRECTORIES = {"node_modules", "venv", ".venv", ".git", "dist", "build"}


def read_code_files(repo_path: Path) -> list[dict[str, str]]:
    if not repo_path.exists():
        raise FileNotFoundError(f"Repository path not found: {repo_path}")

    documents: list[dict[str, str]] = []

    for file_path in repo_path.rglob("*"):
        if not file_path.is_file():
            continue

        if any(part in IGNORED_DIRECTORIES for part in file_path.parts):
            continue

        if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            logger.warning("Skipping undecodable file: %s", file_path)
            continue
        except OSError as exc:
            logger.warning("Skipping unreadable file %s: %s", file_path, exc)
            continue

        documents.append(
            {
                "file": str(file_path.relative_to(repo_path)).replace("\\", "/"),
                "content": content,
            }
        )

    logger.info("Read %d source files from %s", len(documents), repo_path)
    return documents
