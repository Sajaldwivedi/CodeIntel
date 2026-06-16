import logging

from dotenv import load_dotenv
from fastapi import FastAPI

from routes.chat import router as chat_router
from routes.repository import router as repository_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="GitHub Codebase RAG Assistant",
    version="0.1.0"
)

app.include_router(repository_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "GitHub RAG Assistant"
    }
