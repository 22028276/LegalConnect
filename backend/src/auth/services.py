import hashlib

from datetime import timezone, datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError

from src.core.config import settings
from src.core.exceptions import NotAuthenticated
from src.auth.exceptions import InvalidToken

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.ACCESS_TOKEN_EXPIRES)
    to_encode.update({
        "exp": expire, 
        "type": "access"
    })
    jwt_token_encoded = jwt.encode(to_encode, settings.APP_KEY, algorithm=settings.JWT_ALGORITHM)
    return jwt_token_encoded

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRES)
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    jwt_token_encoded = jwt.encode(to_encode, settings.APP_KEY, algorithm=settings.JWT_ALGORITHM)
    return jwt_token_encoded

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.APP_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise NotAuthenticated()
    
def create_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode = {
        "sub": email,
        "exp": expire,
        "type": "reset"
    }
    return jwt.encode(to_encode, settings.APP_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_reset_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.APP_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "reset":
            raise InvalidToken()
        return payload.get("sub")
    except JWTError:
        raise NotAuthenticated()
    
def _ua_fingerprint(user_agent: str) -> str:
    return hashlib.sha256(user_agent.encode("utf-8")).hexdigest()

def verify_trust_token(token: str, user_id: str, user_agent: str) -> bool:
    try:
        data = jwt.decode(token, settings.APP_KEY, algorithms=[settings.JWT_ALGORITHM], audience=settings.TRUST_AUD)
        return data.get("sub") == user_id and data.get("fp") == _ua_fingerprint(user_agent)
    except Exception:
        return False