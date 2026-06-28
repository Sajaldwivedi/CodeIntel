from enum import Enum


class IndexStatus(str, Enum):
    PENDING = "pending"
    VALIDATING = "validating"
    CLONING = "cloning"
    EXTRACTING = "extracting"
    SCANNING = "scanning"
    READY = "ready"
    FAILED = "failed"
