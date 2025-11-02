from __future__ import annotations

from src.user.constants import UserRole
from src.user.models import User
from src.user.schemas import UserResponse
from src.user.utils import resolve_avatar_url


async def serialize_user(user: User) -> UserResponse:
    role = user.role if isinstance(user.role, UserRole) else UserRole(user.role)

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        address=user.address,
        role=role,
        avatar_url=await resolve_avatar_url(user.avatar_url),
    )