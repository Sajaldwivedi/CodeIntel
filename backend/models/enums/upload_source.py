from enum import Enum


class UploadSource(str, Enum):
    GITHUB = "github"
    ZIP = "zip"
    FOLDER = "folder"
