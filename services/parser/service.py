"""Language-aware source parser.

Scaffolding only: the concrete Tree-sitter integration (grammar loading,
symbol extraction, chunking) is implemented in a later phase. The public
interface is defined now so downstream code can depend on a stable contract.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class ParsedChunk:
    """A single semantically-meaningful unit extracted from a source file."""

    file_path: str
    language: str
    symbol: str | None
    start_line: int
    end_line: int
    content: str


class ParserService:
    """Parse source files into language-aware chunks using Tree-sitter.

    The service is dependency-light at import time so it never breaks the
    backend when optional native grammars are not yet installed.
    """

    def __init__(self) -> None:
        self._ready = False

    @property
    def is_ready(self) -> bool:
        """Whether grammars have been loaded and the parser is usable."""
        return self._ready

    def supported_languages(self) -> Sequence[str]:
        """Return the list of languages this parser can handle.

        Returns an empty sequence until grammars are wired up in a later phase.
        """
        return ()

    def parse_file(self, path: str | Path) -> list[ParsedChunk]:
        """Parse a single file into a list of :class:`ParsedChunk`.

        Raises:
            NotImplementedError: Always, until the parsing phase is built.
        """
        raise NotImplementedError("Tree-sitter parsing is implemented in a later phase.")
