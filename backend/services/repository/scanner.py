import os
from dataclasses import dataclass
from pathlib import Path

EXTENSION_LANGUAGE_MAP: dict[str, str] = {
    ".py": "Python",
    ".pyi": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".kt": "Kotlin",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".cpp": "C++",
    ".cc": "C++",
    ".c": "C",
    ".h": "C",
    ".hpp": "C++",
    ".swift": "Swift",
    ".scala": "Scala",
    ".vue": "Vue",
    ".sql": "SQL",
    ".sh": "Shell",
    ".bash": "Shell",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".json": "JSON",
    ".md": "Markdown",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".dart": "Dart",
    ".lua": "Lua",
    ".r": "R",
    ".m": "Objective-C",
}

SKIP_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".next",
    "target",
    ".idea",
    ".vscode",
    "coverage",
    ".pytest_cache",
    ".mypy_cache",
    "embeddings",
    "chroma_db",
}

SKIP_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".svg",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".mp4",
    ".mp3",
    ".zip",
    ".tar",
    ".gz",
    ".pdf",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    ".pyc",
    ".class",
    ".lock",
}


@dataclass
class ScanResult:
    file_count: int
    total_size_bytes: int
    languages: list[dict]
    primary_language: str | None


class RepositoryScanner:
    def scan(self, root: Path) -> ScanResult:
        lang_bytes: dict[str, int] = {}
        lang_files: dict[str, int] = {}
        file_count = 0
        total_size = 0

        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]

            for filename in filenames:
                path = Path(dirpath) / filename
                ext = path.suffix.lower()

                if ext in SKIP_EXTENSIONS:
                    continue

                try:
                    size = path.stat().st_size
                except OSError:
                    continue

                file_count += 1
                total_size += size

                language = EXTENSION_LANGUAGE_MAP.get(ext, "Other")
                lang_bytes[language] = lang_bytes.get(language, 0) + size
                lang_files[language] = lang_files.get(language, 0) + 1

        languages = self._build_language_stats(lang_bytes, lang_files, total_size)
        primary = languages[0]["language"] if languages else None

        return ScanResult(
            file_count=file_count,
            total_size_bytes=total_size,
            languages=languages,
            primary_language=primary,
        )

    def _build_language_stats(
        self,
        lang_bytes: dict[str, int],
        lang_files: dict[str, int],
        total: int,
    ) -> list[dict]:
        if total == 0:
            return []

        sorted_langs = sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True)
        return [
            {
                "language": lang,
                "bytes": bytes_count,
                "files": lang_files.get(lang, 0),
                "percentage": round((bytes_count / total) * 100, 1),
            }
            for lang, bytes_count in sorted_langs
            if lang != "Other" or len(sorted_langs) == 1
        ]
