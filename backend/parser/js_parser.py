import logging
from typing import Any

from tree_sitter import Language, Node, Parser

logger = logging.getLogger(__name__)


def _build_parsers() -> tuple[Parser, Parser]:
    try:
        from tree_sitter_languages import get_parser

        return get_parser("javascript"), get_parser("typescript")
    except Exception:
        import tree_sitter_javascript
        import tree_sitter_typescript

        js_parser = Parser()
        js_parser.language = Language(tree_sitter_javascript.language())

        ts_parser = Parser()
        ts_parser.language = Language(tree_sitter_typescript.language_typescript())

        return js_parser, ts_parser


_JS_PARSER, _TS_PARSER = _build_parsers()


def parse_javascript_typescript_code(content: str, file_path: str, extension: str) -> list[dict[str, Any]]:
    parser = _TS_PARSER if extension in {".ts", ".tsx"} else _JS_PARSER

    try:
        source_bytes = content.encode("utf-8")
        tree = parser.parse(source_bytes)
    except Exception as exc:  # pragma: no cover
        logger.warning("Skipping JS/TS file %s due to parse error: %s", file_path, exc)
        return []

    entities: list[dict[str, Any]] = []
    _walk(tree.root_node, source_bytes, file_path, entities, class_stack=[])
    return entities


def _walk(
    node: Node,
    source_bytes: bytes,
    file_path: str,
    entities: list[dict[str, Any]],
    class_stack: list[str],
) -> None:
    node_type = node.type

    if node_type == "import_statement":
        _extract_import(node, source_bytes, file_path, entities)
    elif node_type == "function_declaration":
        _extract_function(node, source_bytes, file_path, entities)
    elif node_type in {"lexical_declaration", "variable_declaration"}:
        _extract_arrow_functions(node, source_bytes, file_path, entities, class_stack)
    elif node_type == "class_declaration":
        class_name = _extract_class(node, source_bytes, file_path, entities)
        if class_name:
            class_stack.append(class_name)
            for child in node.children:
                _walk(child, source_bytes, file_path, entities, class_stack)
            class_stack.pop()
            return
    elif node_type == "method_definition":
        _extract_method(node, source_bytes, file_path, entities, class_stack)
    elif node_type == "call_expression":
        _extract_call(node, source_bytes, file_path, entities, class_stack)

    for child in node.children:
        _walk(child, source_bytes, file_path, entities, class_stack)


def _extract_import(node: Node, source_bytes: bytes, file_path: str, entities: list[dict[str, Any]]) -> None:
    source_node = node.child_by_field_name("source")
    if source_node is None:
        return

    module_name = _node_text(source_node, source_bytes).strip('"\'')
    line = node.start_point[0] + 1

    entities.append({"type": "import", "module": module_name, "file": file_path, "line": line})
    entities.append(
        {
            "type": "file_relationship",
            "relationship": "imports_module",
            "source_file": file_path,
            "target": module_name,
            "file": file_path,
            "line": line,
        }
    )


def _extract_function(node: Node, source_bytes: bytes, file_path: str, entities: list[dict[str, Any]]) -> None:
    name_node = node.child_by_field_name("name")
    if name_node is None:
        return

    entities.append(
        {
            "type": "function",
            "name": _node_text(name_node, source_bytes),
            "file": file_path,
            "line": node.start_point[0] + 1,
        }
    )


def _extract_arrow_functions(
    node: Node,
    source_bytes: bytes,
    file_path: str,
    entities: list[dict[str, Any]],
    class_stack: list[str],
) -> None:
    for child in node.children:
        if child.type != "variable_declarator":
            continue

        name_node = child.child_by_field_name("name")
        value_node = child.child_by_field_name("value")
        if name_node is None or value_node is None:
            continue

        if value_node.type not in {"arrow_function", "function", "function_expression"}:
            continue

        name = _node_text(name_node, source_bytes)
        line = child.start_point[0] + 1
        if class_stack:
            entities.append(
                {
                    "type": "method",
                    "class": class_stack[-1],
                    "name": name,
                    "file": file_path,
                    "line": line,
                }
            )
        else:
            entities.append({"type": "function", "name": name, "file": file_path, "line": line})


def _extract_class(node: Node, source_bytes: bytes, file_path: str, entities: list[dict[str, Any]]) -> str | None:
    name_node = node.child_by_field_name("name")
    if name_node is None:
        return None

    class_name = _node_text(name_node, source_bytes)
    line = node.start_point[0] + 1
    entities.append({"type": "class", "name": class_name, "file": file_path, "line": line})

    heritage_node = node.child_by_field_name("superclass")
    if heritage_node is not None:
        base_name = _node_text(heritage_node, source_bytes)
        if base_name:
            entities.append(
                {
                    "type": "inheritance",
                    "class": class_name,
                    "base": base_name,
                    "file": file_path,
                    "line": line,
                }
            )

    return class_name


def _extract_method(
    node: Node,
    source_bytes: bytes,
    file_path: str,
    entities: list[dict[str, Any]],
    class_stack: list[str],
) -> None:
    if not class_stack:
        return

    name_node = node.child_by_field_name("name")
    if name_node is None:
        return

    method_name = _node_text(name_node, source_bytes)
    entities.append(
        {
            "type": "method",
            "class": class_stack[-1],
            "name": method_name,
            "file": file_path,
            "line": node.start_point[0] + 1,
        }
    )


def _extract_call(
    node: Node,
    source_bytes: bytes,
    file_path: str,
    entities: list[dict[str, Any]],
    class_stack: list[str],
) -> None:
    function_node = node.child_by_field_name("function")
    if function_node is None:
        return

    callee = _node_text(function_node, source_bytes)
    if not callee:
        return

    caller = class_stack[-1] if class_stack else "module"
    entities.append(
        {
            "type": "call",
            "caller": caller,
            "callee": callee,
            "file": file_path,
            "line": node.start_point[0] + 1,
        }
    )


def _node_text(node: Node, source_bytes: bytes) -> str:
    return source_bytes[node.start_byte : node.end_byte].decode("utf-8", errors="ignore")
