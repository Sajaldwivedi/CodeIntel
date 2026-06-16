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
    entities_indexed: int


class StructureRepositoryRequest(BaseModel):
    repo_name: str = Field(..., description="Cloned repository name")


class StructureRepositoryResponse(BaseModel):
    repo_name: str
    classes: int
    functions: int
    methods: int
    imports: int
    sample_entities: list[dict[str, str | int]]


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
