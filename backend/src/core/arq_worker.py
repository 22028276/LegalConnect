from arq import cron
from arq.connections import RedisSettings

from src.auth.utils import send_reset_email
from src.core.config import settings


class WorkerSettings:
    functions = {
        send_reset_email,
    }

    @property
    def redis_settings(self) -> RedisSettings:
        """Cấu hình Redis - xử lý cả REDIS_URL và REDIS_HOST/PORT"""
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