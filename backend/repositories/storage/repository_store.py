import json
import sqlite3
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from core.config.settings import Settings
from models.enums.index_status import IndexStatus
from models.enums.upload_source import UploadSource


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class RepositoryRecord:
    id: str
    name: str
    owner: str
    source: UploadSource
    status: IndexStatus
    local_path: str
    url: str | None = None
    branch: str | None = None
    commit_hash: str | None = None
    progress: int = 0
    current_stage: str | None = None
    file_count: int = 0
    total_size_bytes: int = 0
    primary_language: str | None = None
    languages_json: str = "[]"
    description: str | None = None
    error_message: str | None = None
    created_at: datetime = field(default_factory=_utcnow)
    updated_at: datetime = field(default_factory=_utcnow)
    ready_at: datetime | None = None

    @property
    def languages(self) -> list[dict]:
        return json.loads(self.languages_json)

    @languages.setter
    def languages(self, value: list[dict]) -> None:
        self.languages_json = json.dumps(value)


class RepositoryStore:
    def __init__(self, settings: Settings):
        self._db_path = settings.db_path
        self._init_db()

    @contextmanager
    def _conn(self):
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS repositories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    owner TEXT NOT NULL,
                    source TEXT NOT NULL,
                    status TEXT NOT NULL,
                    local_path TEXT NOT NULL,
                    url TEXT,
                    branch TEXT,
                    commit_hash TEXT,
                    progress INTEGER DEFAULT 0,
                    current_stage TEXT,
                    file_count INTEGER DEFAULT 0,
                    total_size_bytes INTEGER DEFAULT 0,
                    primary_language TEXT,
                    languages_json TEXT DEFAULT '[]',
                    description TEXT,
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    ready_at TEXT
                )
                """
            )

    def create(
        self,
        *,
        name: str,
        owner: str,
        source: UploadSource,
        local_path: Path,
        url: str | None = None,
        branch: str | None = None,
        description: str | None = None,
    ) -> RepositoryRecord:
        record = RepositoryRecord(
            id=str(uuid.uuid4()),
            name=name,
            owner=owner,
            source=source,
            status=IndexStatus.PENDING,
            local_path=str(local_path),
            url=url,
            branch=branch,
            description=description,
        )
        self._insert(record)
        return record

    def _insert(self, record: RepositoryRecord) -> None:
        with self._conn() as conn:
            conn.execute(
                """
                INSERT INTO repositories (
                    id, name, owner, source, status, local_path, url, branch,
                    commit_hash, progress, current_stage, file_count, total_size_bytes,
                    primary_language, languages_json, description, error_message,
                    created_at, updated_at, ready_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.id,
                    record.name,
                    record.owner,
                    record.source.value,
                    record.status.value,
                    record.local_path,
                    record.url,
                    record.branch,
                    record.commit_hash,
                    record.progress,
                    record.current_stage,
                    record.file_count,
                    record.total_size_bytes,
                    record.primary_language,
                    record.languages_json,
                    record.description,
                    record.error_message,
                    record.created_at.isoformat(),
                    record.updated_at.isoformat(),
                    record.ready_at.isoformat() if record.ready_at else None,
                ),
            )

    def get(self, repo_id: str) -> RepositoryRecord | None:
        with self._conn() as conn:
            row = conn.execute(
                "SELECT * FROM repositories WHERE id = ?", (repo_id,)
            ).fetchone()
        return self._row_to_record(row) if row else None

    def list_all(self) -> list[RepositoryRecord]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM repositories ORDER BY created_at DESC"
            ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def update(self, record: RepositoryRecord) -> None:
        record.updated_at = _utcnow()
        with self._conn() as conn:
            conn.execute(
                """
                UPDATE repositories SET
                    name=?, owner=?, source=?, status=?, local_path=?, url=?,
                    branch=?, commit_hash=?, progress=?, current_stage=?,
                    file_count=?, total_size_bytes=?, primary_language=?,
                    languages_json=?, description=?, error_message=?,
                    updated_at=?, ready_at=?
                WHERE id=?
                """,
                (
                    record.name,
                    record.owner,
                    record.source.value,
                    record.status.value,
                    record.local_path,
                    record.url,
                    record.branch,
                    record.commit_hash,
                    record.progress,
                    record.current_stage,
                    record.file_count,
                    record.total_size_bytes,
                    record.primary_language,
                    record.languages_json,
                    record.description,
                    record.error_message,
                    record.updated_at.isoformat(),
                    record.ready_at.isoformat() if record.ready_at else None,
                    record.id,
                ),
            )

    def delete(self, repo_id: str) -> None:
        with self._conn() as conn:
            conn.execute("DELETE FROM repositories WHERE id = ?", (repo_id,))

    def _row_to_record(self, row: sqlite3.Row) -> RepositoryRecord:
        return RepositoryRecord(
            id=row["id"],
            name=row["name"],
            owner=row["owner"],
            source=UploadSource(row["source"]),
            status=IndexStatus(row["status"]),
            local_path=row["local_path"],
            url=row["url"],
            branch=row["branch"],
            commit_hash=row["commit_hash"],
            progress=row["progress"],
            current_stage=row["current_stage"],
            file_count=row["file_count"],
            total_size_bytes=row["total_size_bytes"],
            primary_language=row["primary_language"],
            languages_json=row["languages_json"],
            description=row["description"],
            error_message=row["error_message"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
            ready_at=(
                datetime.fromisoformat(row["ready_at"]) if row["ready_at"] else None
            ),
        )
