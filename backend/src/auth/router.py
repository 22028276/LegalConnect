from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.future import select
from jose import JWTError

from src.core.database import SessionDep
from src.core.exceptions import NotAuthenticated

from src.auth.services import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password
)
from src.auth.exceptions import (
    InvalidToken, 
    InvalidPassword
)

from src.user.exceptions import UserNotFound
from src.user.models import User
from src.user.utils import resolve_avatar_url

auth_route = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


#      LOGIN ROUTE      #

@auth_route.post('/login')
async def login(db: SessionDep,
                login_request: OAuth2PasswordRequestForm = Depends()):
    
    email = login_request.username.strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise UserNotFound()
    if not verify_password(login_request.password, user.hashed_password):
        raise InvalidPassword()
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    avatar_url = await resolve_avatar_url(user.avatar_url)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "user_email": user.email,
        "phone_number": user.phone_number,
        "address": user.address,
        "role": user.role,
        "avatar_url": avatar_url,
    }

#      END LOGIN ROUTE      #

#---------------------------------------------------------------#

#      REFRESH TOKEN ROUTE      #

@auth_route.post('/refresh')
async def refresh_token(refresh_token: str):
    
    try:
        payload = decode_token(refresh_token)
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if not email or token_type != "refresh":
            raise InvalidToken()
    except JWTError:
        raise NotAuthenticated()

    access_token = create_access_token(data={"sub": email})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

#      END REFRESH TOKEN ROUTE      #
