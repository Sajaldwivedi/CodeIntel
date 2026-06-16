from pathlib import Path
from typing import Any

from parser.js_parser import parse_javascript_typescript_code
from parser.python_parser import parse_python_code


def parse_code_file(file_path: str, content: str) -> list[dict[str, Any]]:
    extension = Path(file_path).suffix.lower()

    if extension == ".py":
        return parse_python_code(content=content, file_path=file_path)

    if extension in {".js", ".jsx", ".ts", ".tsx"}:
        return parse_javascript_typescript_code(
            content=content,
            file_path=file_path,
            extension=extension,
        )

    return []
