from __future__ import annotations

from pathlib import Path
from typing import Optional
from uuid import UUID, uuid4
from urllib.parse import urlparse

from aiobotocore.session import get_session
from botocore.exceptions import ClientError

from src.core.config import settings


AVATAR_ROOT_FOLDER = "user_avatars"
DEFAULT_CONTENT_TYPE = "application/octet-stream"


def build_avatar_key(user_id: UUID, original_filename: str | None) -> str:
    suffix = Path(original_filename or "").suffix.lower()
    sanitized_suffix = suffix if suffix in {".png", ".jpg"} else ""
    unique_part = uuid4().hex
    return f"{AVATAR_ROOT_FOLDER}/{user_id}/{unique_part}{sanitized_suffix}"


def extract_key_from_avatar_url(avatar_url: str | None) -> str | None:
    if not avatar_url:
        return None

    parsed = urlparse(avatar_url)
    if parsed.scheme and parsed.netloc:
        if settings.S3_BUCKET in parsed.netloc:
            key = parsed.path.lstrip("/")
            return key or None
        return None

    stripped = avatar_url.lstrip("/")
    return stripped or None


async def upload_avatar_to_s3(file_obj: bytes,
                              s3_key: str,
                              content_type: str | None) -> Optional[str]:
    session = get_session()
    async with session.create_client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as client:
        try:
            await client.head_bucket(Bucket=settings.S3_BUCKET)
            await client.put_object(
                Bucket=settings.S3_BUCKET,
                Key=s3_key,
                Body=file_obj,
                ContentType=content_type or DEFAULT_CONTENT_TYPE,
            )
            return s3_key
        except ClientError as exc:
            print("Avatar upload error:", exc)
            return None


async def delete_avatar_from_s3(s3_key: str) -> bool:
    session = get_session()
    async with session.create_client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as client:
        try:
            await client.delete_object(Bucket=settings.S3_BUCKET, Key=s3_key)
            return True
        except ClientError as exc:
            print("Avatar delete error:", exc)
            return False


async def generate_avatar_url(s3_key: str, expires_in: int = 3600) -> Optional[str]:
    session = get_session()
    async with session.create_client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as client:
        try:
            return await client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": settings.S3_BUCKET, "Key": s3_key},
                ExpiresIn=expires_in,
            )
        except ClientError as exc:
            print("Avatar presign error:", exc)
            return None


async def resolve_avatar_url(avatar_value: str | None, expires_in: int = 3600) -> str | None:
    key = extract_key_from_avatar_url(avatar_value)
    if not key:
        return avatar_value

    url = await generate_avatar_url(key, expires_in=expires_in)
    if url:
        return url

    return avatar_value