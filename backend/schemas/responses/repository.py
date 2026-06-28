from datetime import datetime

from pydantic import BaseModel, Field

from models.enums.index_status import IndexStatus
from models.enums.upload_source import UploadSource


class LanguageStat(BaseModel):
    language: str
    percentage: float
    bytes: int
    files: int


class RepositoryResponse(BaseModel):
    id: str
    name: str
    owner: str
    source: UploadSource
    url: str | None = None
    branch: str | None = None
    commit_hash: str | None = None
    status: IndexStatus
    progress: int = Field(ge=0, le=100)
    current_stage: str | None = None
    file_count: int = 0
    total_size_bytes: int = 0
    primary_language: str | None = None
    languages: list[LanguageStat] = Field(default_factory=list)
    description: str | None = None
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    ready_at: datetime | None = None


class RepositoryListResponse(BaseModel):
    items: list[RepositoryResponse]
    total: int


class UploadAcceptedResponse(BaseModel):
    id: str
    status: IndexStatus
    message: str
