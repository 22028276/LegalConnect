from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterable
from uuid import uuid4, UUID

from aiobotocore.session import get_session
from botocore.exceptions import ClientError
from sqlalchemy import Select, and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.booking.constants import BookingRequestStatus
from src.booking.models import BookingRequest, LawyerRating, LawyerScheduleSlot
from src.core.config import settings


BOOKING_ATTACHMENT_ROOT = "booking_attachments"
CASE_ATTACHMENT_ROOT = "case_attachments"
DEFAULT_CONTENT_TYPE = "application/octet-stream"


def _build_key(prefix: str, identifier: UUID | None, original_filename: str | None) -> str:
    suffix = Path(original_filename or "").suffix or ""
    unique = uuid4().hex
    ident = identifier.hex if isinstance(identifier, UUID) else uuid4().hex
    return f"{prefix}/{ident}/{unique}{suffix}"


def build_booking_attachment_key(booking_id: UUID | None, original_filename: str | None) -> str:
    return _build_key(BOOKING_ATTACHMENT_ROOT, booking_id, original_filename)


def build_case_attachment_key(case_id: UUID | None, original_filename: str | None) -> str:
    return _build_key(CASE_ATTACHMENT_ROOT, case_id, original_filename)


async def upload_attachment(file_bytes: bytes, key: str, content_type: str | None) -> str | None:
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
                Key=key,
                Body=file_bytes,
                ContentType=content_type or DEFAULT_CONTENT_TYPE,
            )
            return key
        except ClientError:
            return None


async def delete_attachment(key: str) -> bool:
    session = get_session()
    async with session.create_client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as client:
        try:
            await client.delete_object(Bucket=settings.S3_BUCKET, Key=key)
            return True
        except ClientError:
            return False


async def generate_attachment_url(key: str, expires_in: int = 3600) -> str | None:
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
                Params={"Bucket": settings.S3_BUCKET, "Key": key},
                ExpiresIn=expires_in,
            )
        except ClientError:
            return None


async def find_available_slot(
    db: AsyncSession,
    lawyer_id: UUID,
    start_time: datetime,
    end_time: datetime,
) -> LawyerScheduleSlot | None:
    stmt: Select = select(LawyerScheduleSlot).where(
        LawyerScheduleSlot.lawyer_id == lawyer_id,
        LawyerScheduleSlot.is_booked.is_(False),
        LawyerScheduleSlot.start_time <= start_time,
        LawyerScheduleSlot.end_time >= end_time,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def slot_overlaps(
    db: AsyncSession,
    lawyer_id: UUID,
    start_time: datetime,
    end_time: datetime,
    exclude_slot_id: UUID | None = None,
) -> bool:
    conditions = [
        LawyerScheduleSlot.lawyer_id == lawyer_id,
        LawyerScheduleSlot.start_time < end_time,
        LawyerScheduleSlot.end_time > start_time,
    ]
    if exclude_slot_id:
        conditions.append(LawyerScheduleSlot.id != exclude_slot_id)
    stmt: Select = select(func.count()).where(and_(*conditions))
    result = await db.execute(stmt)
    return result.scalar_one() > 0


async def calculate_lawyer_rating(db: AsyncSession, lawyer_id: UUID) -> float | None:
    stmt = select(func.count(LawyerRating.id), func.coalesce(func.sum(LawyerRating.stars), 0)).where(
        LawyerRating.lawyer_id == lawyer_id
    )
    result = await db.execute(stmt)
    count, total = result.one()
    if not count:
        return None
    return round(total / count, 2)


async def build_booking_response(
    booking: BookingRequest,
) -> dict:
    return {
        "id": booking.id,
        "client_id": booking.client_id,
        "lawyer_id": booking.lawyer_id,
        "schedule_slot_id": booking.schedule_slot_id,
        "title": booking.title,
        "short_description": booking.short_description,
        "desired_start_time": booking.desired_start_time,
        "desired_end_time": booking.desired_end_time,
        "status": BookingRequestStatus(booking.status),
        "decision_at": booking.decision_at,
        "create_at": booking.create_at,
        "updated_at": booking.updated_at,
    }


async def build_case_attachment_urls(keys: Iterable[str]) -> list[str]:
    urls: list[str] = []
    for key in keys:
        url = await generate_attachment_url(key)
        urls.append(url or "")
    return urls