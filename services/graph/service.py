"""Knowledge graph integration backed by Neo4j.

Scaffolding only: driver lifecycle and Cypher execution are added in a later
phase. The interface defines the contract used to build and traverse the code
knowledge graph.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from types import TracebackType
from typing import Any


@dataclass(slots=True)
class GraphNode:
    """A node in the code knowledge graph (e.g. File, Symbol, Module)."""

    id: str
    label: str
    properties: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class GraphRelationship:
    """A directed relationship between two graph nodes (e.g. IMPORTS, CALLS)."""

    start_id: str
    end_id: str
    type: str
    properties: dict[str, Any] = field(default_factory=dict)


class GraphService:
    """Manage a connection to Neo4j and expose graph operations.

    Supports use as a context manager so callers can guarantee the driver is
    closed:

        with GraphService(uri, user, password) as graph:
            graph.upsert_node(...)
    """

    def __init__(self, uri: str, user: str, password: str) -> None:
        self._uri = uri
        self._user = user
        self._password = password
        self._driver: Any | None = None

    @property
    def is_connected(self) -> bool:
        """Whether a live driver has been established."""
        return self._driver is not None

    def connect(self) -> None:
        """Open a Neo4j driver connection.

        Raises:
            NotImplementedError: Always, until the graph phase is built.
        """
        raise NotImplementedError("Neo4j connection is implemented in a later phase.")

    def close(self) -> None:
        """Close the driver connection if open."""
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    def upsert_node(self, node: GraphNode) -> None:
        """Create or update a node."""
        raise NotImplementedError("Graph writes are implemented in a later phase.")

    def upsert_relationship(self, relationship: GraphRelationship) -> None:
        """Create or update a relationship."""
        raise NotImplementedError("Graph writes are implemented in a later phase.")

    def run(self, cypher: str, parameters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        """Execute a Cypher query and return rows as dictionaries."""
        raise NotImplementedError("Cypher execution is implemented in a later phase.")

    def __enter__(self) -> GraphService:
        self.connect()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.close()
