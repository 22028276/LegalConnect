import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column

from src.booking.constants import BookingRequestStatus, CaseState
from src.core.base_model import Base, time_now


class LawyerScheduleSlot(Base):
    __tablename__ = "lawyer_schedule_slot"

    lawyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    start_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    is_booked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class BookingRequest(Base):
    __tablename__ = "booking_request"

    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    lawyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    schedule_slot_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("lawyer_schedule_slot.id", 
                   ondelete="SET NULL"),
        nullable=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    short_description: Mapped[str] = mapped_column(String(1000), nullable=False)
    desired_start_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    desired_end_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    attachment_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=BookingRequestStatus.PENDING.value)
    decision_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class CaseHistory(Base):
    __tablename__ = "case_history"

    booking_request_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("booking_request.id", ondelete="SET NULL"),
        nullable=True,
    )
    lawyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    state: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=CaseState.IN_PROGRESS.value,
    )
    attachment_keys: Mapped[list[str]] = mapped_column(
        MutableList.as_mutable(ARRAY(String(255))),
        nullable=False,
        default=list,
    )
    lawyer_note: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    client_note: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=time_now,
    )
    ending_time: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )


class LawyerRating(Base):
    __tablename__ = "lawyer_rating"

    case_history_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("case_history.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    lawyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
    )
    stars: Mapped[int] = mapped_column(Integer, nullable=False)