class AppException(Exception):
    def __init__(self, message: str, code: str = "error", details: dict | None = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, code="not_found")


class ValidationError(AppException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, code="validation_error", details=details)


class UploadError(AppException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message, code="upload_error", details=details)
