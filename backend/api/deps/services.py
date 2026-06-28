from functools import lru_cache

from services.repository.service import RepositoryService
from core.config.settings import get_settings


@lru_cache
def get_repository_service() -> RepositoryService:
    return RepositoryService(get_settings())
