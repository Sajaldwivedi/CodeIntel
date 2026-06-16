import ast
import logging
from typing import Any

logger = logging.getLogger(__name__)


class PythonStructureVisitor(ast.NodeVisitor):
    def __init__(self, file_path: str) -> None:
        self.file_path = file_path
        self.entities: list[dict[str, Any]] = []
        self._class_stack: list[str] = []
        self._call_scope_stack: list[str] = []

    def visit_Import(self, node: ast.Import) -> Any:
        for alias in node.names:
            self.entities.append(
                {
                    "type": "import",
                    "module": alias.name,
                    "file": self.file_path,
                    "line": node.lineno,
                }
            )
            self.entities.append(
                {
                    "type": "file_relationship",
                    "relationship": "imports_module",
                    "source_file": self.file_path,
                    "target": alias.name,
                    "file": self.file_path,
                    "line": node.lineno,
                }
            )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> Any:
        module_name = node.module or ""
        for alias in node.names:
            imported_name = alias.name
            full_module = f"{module_name}.{imported_name}" if module_name else imported_name
            self.entities.append(
                {
                    "type": "import",
                    "module": full_module,
                    "file": self.file_path,
                    "line": node.lineno,
                }
            )
            self.entities.append(
                {
                    "type": "file_relationship",
                    "relationship": "imports_module",
                    "source_file": self.file_path,
                    "target": full_module,
                    "file": self.file_path,
                    "line": node.lineno,
                }
            )
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> Any:
        class_name = node.name
        self.entities.append(
            {
                "type": "class",
                "name": class_name,
                "file": self.file_path,
                "line": node.lineno,
            }
        )

        for base in node.bases:
            base_name = self._extract_name(base)
            if base_name:
                self.entities.append(
                    {
                        "type": "inheritance",
                        "class": class_name,
                        "base": base_name,
                        "file": self.file_path,
                        "line": node.lineno,
                    }
                )

        self._class_stack.append(class_name)
        self.generic_visit(node)
        self._class_stack.pop()

    def visit_FunctionDef(self, node: ast.FunctionDef) -> Any:
        self._visit_function_like(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> Any:
        self._visit_function_like(node)

    def visit_Call(self, node: ast.Call) -> Any:
        callee = self._extract_name(node.func)
        if callee:
            caller = self._call_scope_stack[-1] if self._call_scope_stack else "module"
            self.entities.append(
                {
                    "type": "call",
                    "caller": caller,
                    "callee": callee,
                    "file": self.file_path,
                    "line": node.lineno,
                }
            )
        self.generic_visit(node)

    def _visit_function_like(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        class_name = self._class_stack[-1] if self._class_stack else None
        entity_type = "method" if class_name else "function"

        entity: dict[str, Any] = {
            "type": entity_type,
            "name": node.name,
            "file": self.file_path,
            "line": node.lineno,
        }
        if class_name:
            entity["class"] = class_name
            scope_name = f"{class_name}.{node.name}"
        else:
            scope_name = node.name

        self.entities.append(entity)

        self._call_scope_stack.append(scope_name)
        self.generic_visit(node)
        self._call_scope_stack.pop()

    @staticmethod
    def _extract_name(node: ast.AST) -> str | None:
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            left = PythonStructureVisitor._extract_name(node.value)
            return f"{left}.{node.attr}" if left else node.attr
        if isinstance(node, ast.Subscript):
            return PythonStructureVisitor._extract_name(node.value)
        if isinstance(node, ast.Call):
            return PythonStructureVisitor._extract_name(node.func)
        return None


def parse_python_code(content: str, file_path: str) -> list[dict[str, Any]]:
    try:
        tree = ast.parse(content)
    except SyntaxError as exc:
        logger.warning("Skipping Python file with syntax error %s: %s", file_path, exc)
        return []

    visitor = PythonStructureVisitor(file_path=file_path)
    visitor.visit(tree)
    return visitor.entities
