from fastapi import APIRouter

from api.v1.endpoints import health, repositories

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(repositories.router)
