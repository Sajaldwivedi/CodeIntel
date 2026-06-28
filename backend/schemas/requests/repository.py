from pydantic import BaseModel, Field, field_validator
import re


GITHUB_URL_PATTERN = re.compile(
    r"^https?://(?:www\.)?github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+?)(?:\.git)?/?$"
)


class GitHubUploadRequest(BaseModel):
    url: str = Field(..., description="GitHub repository URL")
    branch: str | None = Field(default=None, description="Branch to clone; default branch if omitted")
    github_token: str | None = Field(
        default=None,
        description="Personal access token for private repositories",
    )

    @field_validator("url")
    @classmethod
    def validate_github_url(cls, v: str) -> str:
        v = v.strip().rstrip("/")
        if not GITHUB_URL_PATTERN.match(v):
            raise ValueError("Invalid GitHub URL. Expected: https://github.com/owner/repo")
        return v


class FolderUploadMeta(BaseModel):
    name: str | None = Field(default=None, description="Display name for the repository")
