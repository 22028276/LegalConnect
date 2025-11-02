import fastapi
import subprocess
from contextlib import asynccontextmanager
from pathlib import Path
from arq.connections import create_pool, RedisSettings
from sqlalchemy.future import select
from starlette.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.database import SessionLocal
from src.auth.router import auth_route
from src.auth.services import hash_password
from src.user.constants import UserRole
from src.user.models import User
from src.user.router import user_route
from src.lawyer.router import lawyer_route
from src.chat.router import chat_route
from src.legal_ai.router import legal_ai_route
from src.documentation.router import documentation_route
from src.booking.router import booking_route


THIS_DIR = Path(__file__).parent


# 👑 Tạo tài khoản admin mặc định (nếu chưa có)
async def create_admin() -> None:
    admin_email = settings.ADMIN_EMAIL.strip().lower()

    async with SessionLocal() as session:
        result = await session.execute(select(User).where(User.email == admin_email))
        admin_user = result.scalar_one_or_none()

        if admin_user:
            print("👑 Admin đã tồn tại, bỏ qua.", flush=True)
            return

        new_admin = User(
            username=settings.ADMIN_USERNAME,
            email=admin_email,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN.value,
            is_email_verified=True,
            email_verification_sent_at=None,
        )

        session.add(new_admin)
        await session.commit()
        print("✅ Admin mặc định đã được tạo.", flush=True)


# 🌱 Hàm lifecycle: chỉ tạo Redis, admin và seed data
@asynccontextmanager
async def lifespan(_app: fastapi.FastAPI):
    """Lifecycle: khởi tạo Redis, tạo admin và seed dữ liệu mẫu."""
    # 🧱 Alembic migrations đã được chạy trong Dockerfile
    print("⏩ Skipping Alembic migrations (handled by Dockerfile)", flush=True)

    # ⚙️ 1. Kết nối Redis
    if getattr(settings, "REDIS_URL", None):
        redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    else:
        redis_settings = RedisSettings(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            username="default",
            password=getattr(settings, "REDIS_PASSWORD", None),
            database=0,
        )

    _app.state.arq_pool = await create_pool(redis_settings)

    # 👑 2. Tạo admin mặc định
    await create_admin()

    # 🌱 3. Seed dữ liệu demo (chỉ chạy 1 lần)
    try:
        async with SessionLocal() as session:
            exists = await session.execute(
                select(User).where(User.email == "demo_client@example.com")
            )
            if not exists.first():
                print("🌱 Running seed_data.py ...", flush=True)
                import runpy

                seed_path = Path(__file__).resolve().parents[1] / "scripts" / "seed_data.py"
                if seed_path.exists():
                    runpy.run_path(str(seed_path))
                    print("✅ Seeding completed.", flush=True)
                else:
                    print("⚠️ seed_data.py not found, skipping.", flush=True)
            else:
                print("✅ Demo data already exists, skipping seed.", flush=True)
    except Exception as e:
        print("⚠️ Error running seed_data:", e, flush=True)

    try:
        yield
    finally:
        await _app.state.arq_pool.close()


# 🚀 Khởi tạo FastAPI app
app = fastapi.FastAPI(lifespan=lifespan)

# 🛡️ Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGIN,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"),
    allow_headers=settings.CORS_HEADERS,
)

# 📦 Đăng ký router
app.include_router(auth_route)
app.include_router(user_route)
app.include_router(lawyer_route)
app.include_router(chat_route)
app.include_router(legal_ai_route)
app.include_router(booking_route)
app.include_router(documentation_route)
