import shutil
import zipfile
from pathlib import Path

from core.exceptions.app_exceptions import UploadError, ValidationError
from git import Repo

from schemas.requests.repository import GITHUB_URL_PATTERN


class GitHubCloner:
    def parse_url(self, url: str) -> tuple[str, str]:
        match = GITHUB_URL_PATTERN.match(url.strip().rstrip("/"))
        if not match:
            raise ValidationError("Invalid GitHub URL format")
        return match.group("owner"), match.group("repo")

    def clone(
        self,
        url: str,
        dest: Path,
        *,
        branch: str | None = None,
        token: str | None = None,
    ) -> tuple[str, str]:
        owner, repo_name = self.parse_url(url)
        clone_url = url if url.endswith(".git") else f"{url.rstrip('/')}.git"

        if token:
            if clone_url.startswith("https://"):
                clone_url = clone_url.replace(
                    "https://", f"https://{token}@", 1
                )

        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            shutil.rmtree(dest)

        kwargs: dict = {"depth": 1}
        if branch:
            kwargs["branch"] = branch

        try:
            repo = Repo.clone_from(clone_url, dest, **kwargs)
        except Exception as exc:
            raise UploadError(
                f"Failed to clone repository: {exc}",
                details={"owner": owner, "repo": repo_name},
            ) from exc

        active_branch = (
            repo.active_branch.name
            if not repo.head.is_detached
            else (branch or "HEAD")
        )
        commit_hash = repo.head.commit.hexsha
        return active_branch, commit_hash


class ZipExtractor:
    def extract(self, zip_path: Path, dest: Path) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)

        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                for member in zf.namelist():
                    member_path = dest / member
                    resolved = member_path.resolve()
                    if not str(resolved).startswith(str(dest.resolve())):
                        raise UploadError("ZIP archive contains unsafe paths")
                zf.extractall(dest)
        except zipfile.BadZipFile as exc:
            raise UploadError("Invalid or corrupted ZIP file") from exc
        finally:
            if zip_path.exists():
                zip_path.unlink()

        self._flatten_single_root(dest)

    def _flatten_single_root(self, dest: Path) -> None:
        children = [p for p in dest.iterdir() if p.name != "__MACOSX"]
        if len(children) == 1 and children[0].is_dir():
            nested = children[0]
            for item in nested.iterdir():
                shutil.move(str(item), str(dest / item.name))
            shutil.rmtree(nested)


class FolderWriter:
    def write_files(
        self,
        dest: Path,
        files: list[tuple[str, bytes]],
    ) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)

        if not files:
            raise ValidationError("No files provided for folder upload")

        for rel_path, content in files:
            rel_path = rel_path.replace("\\", "/").lstrip("/")
            if ".." in rel_path.split("/"):
                raise UploadError(f"Unsafe path in upload: {rel_path}")

            target = dest / rel_path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
