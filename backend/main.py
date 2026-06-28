import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.v1.router import router as v1_router
from core.config.settings import get_settings
from core.exceptions.app_exceptions import AppException, NotFoundError, ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="CodeMind API",
    description="AI Software Engineer for GitHub Repositories",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api")


@app.exception_handler(NotFoundError)
async def not_found_handler(_: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"error": exc.code, "message": exc.message})


@app.exception_handler(ValidationError)
async def validation_handler(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"error": exc.code, "message": exc.message, "details": exc.details},
    )


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    status = 400 if exc.code != "upload_error" else 502
    return JSONResponse(
        status_code=status,
        content={"error": exc.code, "message": exc.message, "details": exc.details},
    )


@app.get("/")
def root() -> dict:
    return {"name": settings.app_name, "docs": "/docs"}
