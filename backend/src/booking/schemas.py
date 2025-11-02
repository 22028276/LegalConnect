from __future__ import annotations
import re

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from src.booking.constants import (
    BookingRequestStatus,
    CaseState,
    MAX_BOOKING_TITLE_LENGTH,
    MAX_BOOKING_DESCRIPTION_LENGTH,
    MAX_NOTE_LENGTH,
    MAX_REVIEW_LENGTH,
    MIN_REVIEW_SENTENCES,
    MAX_REVIEW_SENTENCES,
)


class ScheduleSlotCreatePayload(BaseModel):
    start_time: datetime
    end_time: datetime


class ScheduleSlotResponse(BaseModel):
    id: UUID
    lawyer_id: UUID
    start_time: datetime
    end_time: datetime
    is_booked: bool
    expired: bool
    create_at: datetime
    updated_at: datetime


class BookingRequestCreateResponse(BaseModel):
    id: UUID
    client_id: UUID
    lawyer_id: UUID
    schedule_slot_id: UUID | None
    title: str
    short_description: str
    desired_start_time: datetime
    desired_end_time: datetime
    attachment_url: str | None
    status: BookingRequestStatus
    decision_at: datetime | None
    create_at: datetime
    updated_at: datetime


class BookingRequestSummary(BaseModel):
    id: UUID
    client_id: UUID
    lawyer_id: UUID
    title: str
    short_description: str
    desired_start_time: datetime
    desired_end_time: datetime
    status: BookingRequestStatus
    decision_at: datetime | None
    create_at: datetime
    updated_at: datetime


class BookingDecisionPayload(BaseModel):
    accept: bool


class BookingDecisionResponse(BaseModel):
    booking: BookingRequestSummary
    case: CaseHistoryResponse | None


class CaseHistoryResponse(BaseModel):
    id: UUID
    booking_request_id: UUID | None
    lawyer_id: UUID
    client_id: UUID
    title: str
    description: str | None
    state: CaseState
    attachment_urls: list[str]
    lawyer_note: str | None
    client_note: str | None
    started_at: datetime
    ending_time: datetime | None
    create_at: datetime
    updated_at: datetime


class CaseUpdatePayload(BaseModel):
    title: str | None = Field(default=None, max_length=MAX_BOOKING_TITLE_LENGTH)
    description: str | None = Field(default=None, max_length=MAX_BOOKING_DESCRIPTION_LENGTH)
    state: CaseState | None = None


class CaseNotePayload(BaseModel):
    lawyer_note: str | None = Field(default=None, max_length=MAX_NOTE_LENGTH)
    client_note: str | None = Field(default=None, max_length=MAX_NOTE_LENGTH)


class RatingPayload(BaseModel):
    stars: int = Field(..., ge=1, le=5)
    detailed_review: str = Field(..., min_length=1, max_length=MAX_REVIEW_LENGTH)

    @field_validator("detailed_review")
    @classmethod
    def validate_review_length(cls, value: str) -> str:
        sentences = [segment.strip() for segment in re.split(r"[.!?]+", value) if segment.strip()]
        if not (MIN_REVIEW_SENTENCES <= len(sentences) <= MAX_REVIEW_SENTENCES):
            raise ValueError(
                f"Detailed review must contain between {MIN_REVIEW_SENTENCES} and {MAX_REVIEW_SENTENCES} sentences."
            )
        return value


class RatingResponse(BaseModel):
    id: UUID
    case_history_id: UUID
    lawyer_id: UUID
    client_id: UUID
    stars: int
    detailed_review: str
    create_at: datetime
    updated_at: datetime