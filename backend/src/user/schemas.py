import uuid

from typing import Optional
from pydantic import BaseModel, EmailStr

from src.user.constants import UserRole


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    phone_number: str | None
    address: str | None
    role: UserRole
    avatar_url: str | None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: UserRole

class ForgetPasswordRequest(BaseModel):
    email: EmailStr