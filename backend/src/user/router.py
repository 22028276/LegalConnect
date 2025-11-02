import uuid
from typing import Any

from pathlib import Path
from fastapi import APIRouter, Depends, Body, File, Form, UploadFile, Request
from sqlalchemy.future import select

from src.core.database import SessionDep
from src.core.config import settings

from src.user.models import User
from src.user.schemas import (
    UserCreate, 
    UserResponse,
    UserRoleUpdate,
    ForgetPasswordRequest
)
from src.user.exceptions import (
    UserEmailExist,
    UserNotFound,
    InvalidPasswordMatch,
    UnauthorizedRoleUpdate,
    InvalidRoleTransition,
    InvalidAvatarFile,
    AvatarUploadFailed
)
from src.user.constants import (
    UserRole,
    ALLOWED_AVATAR_CONTENT_TYPES,
    ALLOWED_AVATAR_EXTENSIONS,
)
from src.user.utils import (
    build_avatar_key,
    build_avatar_url,
    delete_avatar_from_s3,
    extract_key_from_avatar_url,
    upload_avatar_to_s3,
)

from src.auth.services import (
    hash_password, 
    generate_reset_otp
)
from src.auth.exceptions import InvalidToken
from src.auth.dependencies import get_current_user

user_route = APIRouter (
    tags=["User"],
    prefix="/users"
)


#       REGISTER ROUTE      #

@user_route.post('/register', response_model=UserResponse)
async def register(user: UserCreate, 
                   db: SessionDep):
    
    email_norm = user.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_norm))
    existed_user = result.scalar_one_or_none()

    if existed_user:
        raise UserEmailExist()

    hashed_pw = hash_password(user.password)
    new_user = User(
        username = user.username,
        email = email_norm,
        hashed_password = hashed_pw,
        role = UserRole.CLIENT.value,
        is_email_verified = True,
        email_verification_sent_at = None,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

#      END REGISTER ROUTE      #

#---------------------------------------------------------------#

#      USER MANAGEMENT ROUTE      #

@user_route.get('/me', response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)):
    return current_user


async def _store_avatar_and_get_key(current_user: User, avatar: UploadFile) -> str:
    file_suffix = Path(avatar.filename or "").suffix.lower()
    content_type = avatar.content_type or ""

    if (
        content_type not in ALLOWED_AVATAR_CONTENT_TYPES
        or file_suffix not in ALLOWED_AVATAR_EXTENSIONS
    ):
        await avatar.close()
        raise InvalidAvatarFile()

    file_bytes = await avatar.read()
    await avatar.close()

    if not file_bytes:
        raise InvalidAvatarFile()

    s3_key = build_avatar_key(current_user.id, avatar.filename)
    uploaded_key = await upload_avatar_to_s3(file_bytes, s3_key, content_type)

    if not uploaded_key:
        raise AvatarUploadFailed()

    return uploaded_key


@user_route.put('/update', response_model=UserResponse)
async def update_user(
    db: SessionDep,
    username: str | None = Form(default=None),
    password: str | None = Form(default=None),
    phone_number: str | None = Form(default=None),
    address: str | None = Form(default=None),
    avatar: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
):
    
    result = await db.execute(select(User).where(User.id == current_user.id))
    curr_user = result.scalar_one_or_none()
    if not curr_user:
        raise UserNotFound()
    
    update_data: dict[str, Any] = {}

    if username is not None:
        update_data["username"] = username.strip()
    if password is not None:
        update_data["hashed_password"] = hash_password(password)
    if phone_number is not None:
        update_data["phone_number"] = phone_number.strip() if phone_number else phone_number
    if address is not None:
        update_data["address"] = address.strip() if address else address

    for key, value in update_data.items():
        setattr(curr_user, key, value)

    if avatar is not None:
        uploaded_key = await _store_avatar_and_get_key(curr_user, avatar)
        new_avatar_url = build_avatar_url(uploaded_key)
        previous_key = extract_key_from_avatar_url(curr_user.avatar_url)
        if previous_key and previous_key != uploaded_key:
            await delete_avatar_from_s3(previous_key)
        curr_user.avatar_url = new_avatar_url

    await db.commit()
    await db.refresh(curr_user)

    return curr_user


@user_route.post('/avatar', response_model=UserResponse)
async def upload_avatar(db: SessionDep,
                        avatar: UploadFile = File(...),
                        current_user: User = Depends(get_current_user)):

    uploaded_key = await _store_avatar_and_get_key(current_user, avatar)

    new_avatar_url = build_avatar_url(uploaded_key)

    previous_key = extract_key_from_avatar_url(current_user.avatar_url)
    if previous_key and previous_key != uploaded_key:
        await delete_avatar_from_s3(previous_key)

    current_user.avatar_url = new_avatar_url

    await db.commit()
    await db.refresh(current_user)

    return current_user


@user_route.patch('/{user_id}/role', response_model=UserResponse)
async def update_user_role(user_id: uuid.UUID,
                           payload: UserRoleUpdate,
                           db: SessionDep,
                           current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN.value:
        raise UnauthorizedRoleUpdate()

    if payload.role != UserRole.LAWYER:
        raise InvalidRoleTransition()

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise UserNotFound()

    if target_user.role != UserRole.CLIENT.value:
        raise InvalidRoleTransition()

    target_user.role = payload.role.value

    await db.commit()
    await db.refresh(target_user)

    return target_user

#      END USER MANAGEMENT ROUTE      #

#---------------------------------------------------------------#

#      FORGET PASSWORD ROUTE      #

@user_route.post('/forget-password')
async def forget_password(request: Request,
                          db: SessionDep,
                          payload: ForgetPasswordRequest):
    email_norm = payload.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_norm))
    user = result.scalar_one_or_none()
    if not user:
        raise UserNotFound()
    
    # Tạo OTP 6 số
    reset_otp = generate_reset_otp()
    
    # Lưu OTP vào Redis với expiry 5 phút (300 seconds)
    redis_client = request.app.state.redis_client
    redis_key = f"reset_otp:{email_norm}"
    await redis_client.setex(redis_key, 300, reset_otp)
    
    # Gửi email với OTP qua ARQ worker
    arq_pool = request.app.state.arq_pool
    await arq_pool.enqueue_job("send_reset_email", user.email, reset_otp)

    return {"message": "Reset email sent"}


@user_route.post('/reset-password', response_model=UserResponse)
async def reset_password(request: Request,
                         db: SessionDep, 
                         otp: str = Body(...),
                         email: str = Body(...),
                         new_password: str = Body(...), 
                         confirm_password: str = Body(...)):
    if new_password != confirm_password:
        raise InvalidPasswordMatch()
    
    email_norm = email.strip().lower()
    
    # Verify OTP từ Redis
    redis_client = request.app.state.redis_client
    redis_key = f"reset_otp:{email_norm}"
    stored_otp = await redis_client.get(redis_key)
    
    if not stored_otp:
        raise InvalidToken()  # OTP đã expire hoặc không tồn tại
    
    # Verify OTP
    if stored_otp != otp:
        raise InvalidToken()  # OTP không đúng
    
    # OTP đúng - xóa OTP khỏi Redis (one-time use)
    await redis_client.delete(redis_key)

    # Tìm user và reset password
    result = await db.execute(select(User).where(User.email == email_norm))
    user = result.scalar_one_or_none()
    if not user:
        raise UserNotFound()
    
    user.hashed_password = hash_password(new_password)
    await db.commit()
    await db.refresh(user)

    return user

#      END FORGET PASSWORD ROUTE      #

#---------------------------------------------------------------#