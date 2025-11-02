from enum import StrEnum

ALLOWED_AVATAR_CONTENT_TYPES = {"image/png", "image/jpeg"}
ALLOWED_AVATAR_EXTENSIONS = {".png", ".jpg"}

class UserRole(StrEnum):
    CLIENT = "client"
    LAWYER = "lawyer"
    ADMIN = "admin"

MAX_USER_ADDRESS_LENGTH = 200
MAX_AVATAR_URL_LENGTH = 512