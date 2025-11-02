from enum import StrEnum

class UserRole(StrEnum):
    CLIENT = "client"
    LAWYER = "lawyer"
    ADMIN = "admin"

MAX_USER_ADDRESS_LENGTH = 200
MAX_AVATAR_URL_LENGTH = 512