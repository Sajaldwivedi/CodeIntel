from pydantic import BaseModel, Field


class CloneRepositoryRequest(BaseModel):
    repo_url: str = Field(..., description="GitHub repository URL")


class CloneRepositoryResponse(BaseModel):
    status: str
    repository: str


class IndexRepositoryRequest(BaseModel):
    repo_name: str = Field(..., description="Cloned repository name")


class IndexRepositoryResponse(BaseModel):
    status: str
    chunks_indexed: int


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
