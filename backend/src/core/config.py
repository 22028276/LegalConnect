from pathlib import Path
from pydantic import computed_field, PostgresDsn, Field
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

from src.core.constants import Environment

BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_ignore_empty=True, extra="ignore"
    )

    # ─────────────── App & Env ───────────────
    APP_KEY: str
    ENVIRONMENT: Environment = Environment.LOCAL

    # ─────────────── Database ───────────────
    # Railway chỉ cần 1 URL; local có thể dùng các field bên dưới
    SQLALCHEMY_DATABASE_URL: str | None = None

    POSTGRES_DB: str | None = None
    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    POSTGRES_PORT: int | None = None
    POSTGRES_HOST: str | None = None

    @computed_field
    @property
    def ASYNC_DATABASE_URI(self) -> PostgresDsn:
        """
        Tự động chọn chuỗi kết nối asyncpg.
        - Nếu SQLALCHEMY_DATABASE_URL được đặt (ví dụ Railway), dùng luôn.
        - Nếu không, build từ các POSTGRES_* cục bộ.
        """
        if self.SQLALCHEMY_DATABASE_URL:
            return self.SQLALCHEMY_DATABASE_URL
        return MultiHostUrl.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    # ─────────────── Mail ───────────────
    MAIL_SERVER: str = "smtp.sendgrid.net"
    MAIL_PORT: int = 587  
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_TLS: bool = True
    FRONTEND_URL: str | None = None  # Optional - nếu không có, sẽ hiển thị token thay vì link

    # ─────────────── Redis ───────────────
    REDIS_URL: str | None = None
    REDIS_HOST: str | None = None
    REDIS_PORT: int | None = None
    REDIS_PASSWORD: str | None = None

    # ─────────────── AWS ───────────────
    AWS_ACCESS_KEY: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    S3_BUCKET: str

    # ─────────────── Chat settings ───────────────
    CHAT_ATTACHMENT_MAX_BYTES: int = 10 * 1024 * 1024
    CHAT_ATTACHMENT_ALLOWED_CONTENT_TYPES: list[str] = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    CHAT_RATE_LIMIT_MAX_EVENTS: int = 30
    CHAT_RATE_LIMIT_WINDOW_SECONDS: int = 10

    # ─────────────── Database pool ───────────────
    DATABASE_POOL_SIZE: int = 16
    DATABASE_POOL_TTL: int = 60 * 20  # 20 minutes
    DATABASE_POOL_PRE_PING: bool = True

    # ─────────────── CORS ───────────────
    CORS_ORIGIN: list[str] = ["http://localhost:8081"]
    CORS_ORIGIN_REGEX: str | None = None
    CORS_HEADERS: list[str] = ["*"]

    # ─────────────── JWT ───────────────
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRES: int = 86400  # seconds
    REFRESH_TOKEN_EXPIRES: int = 30  # days

    # ─────────────── Admin ───────────────
    ADMIN_EMAIL: str = "fallfree498@gmail.com"
    ADMIN_USERNAME: str = "Admin"
    ADMIN_PASSWORD: str = "Admin123!"

    # ─────────────── Legal AI ───────────────
    LEGAL_AI_MODEL_ID: str = "legal-connect-vi-law-qa"
    LEGAL_AI_PROVIDER_BASE_URL: str | None = None
    LEGAL_AI_API_KEY: str | None = None
    LEGAL_AI_TEMPERATURE: float = 0.1
    LEGAL_AI_MAX_OUTPUT_TOKENS: int = 800
    LEGAL_AI_CONFIDENCE_THRESHOLD: float = 0.42
    LEGAL_AI_SUGGESTION_COUNT: int = 3
    LEGAL_AI_DISCLAIMER: str = (
        "Câu trả lời do AI cung cấp chỉ mang tính tham khảo và không thay thế tư vấn pháp lý chuyên nghiệp."
    )
    LEGAL_AI_DATASET_PATH: str = str(Path(__file__).resolve().parents[2] / "data" / "vi-law-qa-3161.csv")
    LEGAL_AI_LOG_SAMPLE_RATE: float = 1.0


settings = Settings()
