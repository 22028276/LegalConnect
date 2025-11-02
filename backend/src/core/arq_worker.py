from arq import cron
from arq.connections import RedisSettings

from src.auth.utils import send_reset_email
from src.core.config import settings


def _get_redis_settings() -> RedisSettings:
    """Tạo RedisSettings từ config"""
    if settings.REDIS_URL:
        return RedisSettings.from_dsn(settings.REDIS_URL)
    else:
        return RedisSettings(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            username="default",
            password=settings.REDIS_PASSWORD,
            database=0
        )


class WorkerSettings:
    functions = {
        send_reset_email,
    }
    
    # ARQ yêu cầu redis_settings phải là class attribute, không phải property
    redis_settings = _get_redis_settings()