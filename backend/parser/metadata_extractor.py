from pathlib import Path
from typing import Any


def infer_language(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()
    if extension == ".py":
        return "python"
    if extension in {".js", ".jsx"}:
        return "javascript"
    if extension in {".ts", ".tsx"}:
        return "typescript"
    return "unknown"


def normalize_entities(
    entities: list[dict[str, Any]],
    file_path: str,
) -> list[dict[str, Any]]:
    language = infer_language(file_path)
    normalized: list[dict[str, Any]] = []

    for entity in entities:
        normalized_entity = {
            "type": entity.get("type", "unknown"),
            "file": entity.get("file", file_path),
            "line": int(entity.get("line", 0) or 0),
            "language": language,
        }

        for field in (
            "name",
            "class",
            "module",
            "base",
            "caller",
            "callee",
            "relationship",
            "source_file",
            "target",
        ):
            value = entity.get(field)
            if value is not None and value != "":
                normalized_entity[field] = str(value)

        normalized.append(normalized_entity)

    return normalized


def entity_to_document(entity: dict[str, Any]) -> str:
    entity_type = entity.get("type", "entity")
    file_name = entity.get("file", "unknown")
    line = entity.get("line")

    if entity_type == "method":
        return (
            f"Method {entity.get('name', 'unknown')} inside class {entity.get('class', 'unknown')} "
            f"defined in {file_name} at line {line}."
        )
    if entity_type == "function":
        return f"Function {entity.get('name', 'unknown')} defined in {file_name} at line {line}."
    if entity_type == "class":
        return f"Class {entity.get('name', 'unknown')} defined in {file_name} at line {line}."
    if entity_type == "import":
        return f"Import {entity.get('module', 'unknown')} used in {file_name} at line {line}."
    if entity_type == "inheritance":
        return (
            f"Class {entity.get('class', 'unknown')} inherits from {entity.get('base', 'unknown')} "
            f"in {file_name} at line {line}."
        )
    if entity_type == "call":
        return (
            f"Call to {entity.get('callee', 'unknown')} from {entity.get('caller', 'unknown')} "
            f"in {file_name} at line {line}."
        )
    if entity_type == "file_relationship":
        return (
            f"File {entity.get('source_file', file_name)} {entity.get('relationship', 'relates_to')} "
            f"{entity.get('target', 'unknown')} at line {line}."
        )

    return f"{entity_type} entity in {file_name} at line {line}."


def summarize_entities(entities: list[dict[str, Any]]) -> dict[str, int]:
    summary = {
        "classes": 0,
        "functions": 0,
        "methods": 0,
        "imports": 0,
    }

    for entity in entities:
        entity_type = entity.get("type")
        if entity_type == "class":
            summary["classes"] += 1
        elif entity_type == "function":
            summary["functions"] += 1
        elif entity_type == "method":
            summary["methods"] += 1
        elif entity_type == "import":
            summary["imports"] += 1

    return summary
