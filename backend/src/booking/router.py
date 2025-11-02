from __future__ import annotations

from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy import select

from src.auth.dependencies import get_current_user
from src.booking.constants import BookingRequestStatus, CaseState
from src.booking.exceptions import (
    AttachmentUploadFailed,
    BookingAlreadyReviewed,
    BookingForbidden,
    BookingNotFound,
    CaseHistoryNotFound,
    CaseStateUpdateForbidden,
    InvalidBookingPayload,
    InvalidScheduleRange,
    InvalidScheduleSelection,
    RatingAlreadySubmitted,
    RatingInvalidStars,
    RatingNotAllowed,
    ScheduleAlreadyBooked,
    ScheduleConflict,
    ScheduleSlotNotFound,
)
from src.booking.models import BookingRequest, CaseHistory, LawyerRating, LawyerScheduleSlot
from src.booking.schemas import (
    BookingDecisionPayload,
    BookingDecisionResponse,
    BookingRequestCreateResponse,
    BookingRequestSummary,
    CaseHistoryResponse,
    CaseNotePayload,
    CaseUpdatePayload,
    RatingPayload,
    RatingResponse,
    ScheduleSlotCreatePayload,
    ScheduleSlotResponse,
)
from src.booking.utils import (
    build_booking_attachment_key,
    build_case_attachment_key,
    build_booking_response,
    build_case_attachment_urls,
    delete_attachment,
    find_available_slot,
    mark_expired_slots,
    generate_attachment_url,
    slot_overlaps,
    upload_attachment,
)
from src.core.database import SessionDep
from src.user.constants import UserRole
from src.user.models import User


booking_route = APIRouter(
    prefix="/booking",
    tags=["Booking"],
)


def _ensure_lawyer(user: User) -> None:
    if user.role != UserRole.LAWYER.value:
        raise BookingForbidden("Only lawyers can manage schedules or cases.")


def _ensure_client(user: User) -> None:
    if user.role != UserRole.CLIENT.value:
        raise BookingForbidden("Only clients can create booking requests.")


async def _get_schedule_slot(db: SessionDep, slot_id: UUID) -> LawyerScheduleSlot:
    slot = await db.get(LawyerScheduleSlot, slot_id)
    if not slot:
        raise ScheduleSlotNotFound()
    return slot


def _build_rating_response(rating: LawyerRating) -> RatingResponse:
    return RatingResponse(
        id=rating.id,
        case_history_id=rating.case_history_id,
        lawyer_id=rating.lawyer_id,
        client_id=rating.client_id,
        stars=rating.stars,
        detailed_review=rating.detailed_review,
        create_at=rating.create_at,
        updated_at=rating.updated_at,
    )


async def _get_booking(db: SessionDep, booking_id: UUID) -> BookingRequest:
    booking = await db.get(BookingRequest, booking_id)
    if not booking:
        raise BookingNotFound()
    return booking


async def _get_case(db: SessionDep, case_id: UUID) -> CaseHistory:
    case = await db.get(CaseHistory, case_id)
    if not case:
        raise CaseHistoryNotFound()
    return case


async def _build_booking_create_response(booking: BookingRequest) -> BookingRequestCreateResponse:
    attachment_url = None
    if booking.attachment_key:
        attachment_url = await generate_attachment_url(booking.attachment_key)
    data = await build_booking_response(booking)
    return BookingRequestCreateResponse(
        attachment_url=attachment_url,
        **data,
    )


async def _build_case_response(case: CaseHistory) -> CaseHistoryResponse:
    attachment_urls = await build_case_attachment_urls(case.attachment_keys or [])
    return CaseHistoryResponse(
        id=case.id,
        booking_request_id=case.booking_request_id,
        lawyer_id=case.lawyer_id,
        client_id=case.client_id,
        title=case.title,
        description=case.description,
        state=CaseState(case.state),
        attachment_urls=attachment_urls,
        lawyer_note=case.lawyer_note,
        client_note=case.client_note,
        started_at=case.started_at,
        ending_time=case.ending_time,
        create_at=case.create_at,
        updated_at=case.updated_at,
    )


@booking_route.post("/schedule",
                    response_model=ScheduleSlotResponse,
                    status_code=status.HTTP_201_CREATED)
async def create_schedule_slot(payload: ScheduleSlotCreatePayload, 
                               db: SessionDep, 
                               current_user: User = Depends(get_current_user)
                               ) -> ScheduleSlotResponse:

    _ensure_lawyer(current_user)

    await mark_expired_slots(db)

    if payload.end_time <= payload.start_time:
        raise InvalidScheduleRange()

    overlaps = await slot_overlaps(db, current_user.id, payload.start_time, payload.end_time)
    if overlaps:
        raise ScheduleConflict()

    slot = LawyerScheduleSlot(
        lawyer_id=current_user.id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        expired=payload.end_time <= datetime.now(timezone.utc),
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)

    return ScheduleSlotResponse(
        id=slot.id,
        lawyer_id=slot.lawyer_id,
        start_time=slot.start_time,
        end_time=slot.end_time,
        is_booked=slot.is_booked,
        expired=slot.expired,
        create_at=slot.create_at,
        updated_at=slot.updated_at,
    )


@booking_route.get("/schedule/me", response_model=List[ScheduleSlotResponse])
async def list_my_schedule(db: SessionDep, 
                           current_user: User = Depends(get_current_user)
                           ) -> List[ScheduleSlotResponse]:

    _ensure_lawyer(current_user)

    await mark_expired_slots(db)

    result = await db.execute(
        select(LawyerScheduleSlot).where(LawyerScheduleSlot.lawyer_id == current_user.id)
    )
    slots = result.scalars().all()
    return [
        ScheduleSlotResponse(
            id=slot.id,
            lawyer_id=slot.lawyer_id,
            start_time=slot.start_time,
            end_time=slot.end_time,
            is_booked=slot.is_booked,
            expired=slot.expired,
            create_at=slot.create_at,
            updated_at=slot.updated_at,
        )
        for slot in slots
    ]


@booking_route.get("/lawyers/{lawyer_id}/schedule",
                   response_model=List[ScheduleSlotResponse])
async def list_public_schedule(lawyer_id: UUID, 
                               db: SessionDep
                               ) -> List[ScheduleSlotResponse]:

    await mark_expired_slots(db)

    result = await db.execute(
        select(LawyerScheduleSlot).where(
            LawyerScheduleSlot.lawyer_id == lawyer_id,
            LawyerScheduleSlot.is_booked.is_(False),
            LawyerScheduleSlot.expired.is_(False),
        )
    )
    slots = result.scalars().all()
    return [
        ScheduleSlotResponse(
            id=slot.id,
            lawyer_id=slot.lawyer_id,
            start_time=slot.start_time,
            end_time=slot.end_time,
            is_booked=slot.is_booked,
            expired=slot.expired,
            create_at=slot.create_at,
            updated_at=slot.updated_at,
        )
        for slot in slots
    ]


@booking_route.patch("/schedule/{slot_id}", response_model=ScheduleSlotResponse)
async def update_schedule_slot(slot_id: UUID, 
                               payload: ScheduleSlotCreatePayload, 
                               db: SessionDep, 
                               current_user: User = Depends(get_current_user)
                               ) -> ScheduleSlotResponse:

    _ensure_lawyer(current_user)
    await mark_expired_slots(db)
    slot = await _get_schedule_slot(db, slot_id)

    if slot.lawyer_id != current_user.id:
        raise BookingForbidden()

    if slot.is_booked:
        raise BookingForbidden("Cannot modify a slot that has an active booking.")

    if payload.end_time <= payload.start_time:
        raise InvalidScheduleRange()

    overlaps = await slot_overlaps(db, current_user.id, payload.start_time, payload.end_time, exclude_slot_id=slot_id)
    if overlaps:
        raise ScheduleConflict()

    slot.start_time = payload.start_time
    slot.end_time = payload.end_time
    slot.expired = payload.end_time <= datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(slot)

    return ScheduleSlotResponse(
        id=slot.id,
        lawyer_id=slot.lawyer_id,
        start_time=slot.start_time,
        end_time=slot.end_time,
        is_booked=slot.is_booked,
        expired=slot.expired,
        create_at=slot.create_at,
        updated_at=slot.updated_at,
    )


@booking_route.delete("/schedule/{slot_id}")
async def delete_schedule_slot(
    slot_id: UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> None:

    _ensure_lawyer(current_user)
    await mark_expired_slots(db)
    slot = await _get_schedule_slot(db, slot_id)

    if slot.lawyer_id != current_user.id:
        raise BookingForbidden()

    if slot.is_booked:
        raise BookingForbidden("Cannot delete a slot that has an active booking.")

    await db.delete(slot)
    await db.commit()

    return None


@booking_route.post("/requests",
                    response_model=BookingRequestCreateResponse,
                    status_code=status.HTTP_201_CREATED)
async def create_booking_request(
    db: SessionDep,
    lawyer_id: UUID = Form(...),
    title: str = Form(...),
    short_description: str = Form(...),
    desired_start_time: datetime = Form(...),
    desired_end_time: datetime = Form(...),
    attachment: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
) -> BookingRequestCreateResponse:

    _ensure_client(current_user)
    await mark_expired_slots(db)

    if not title.strip():
        raise InvalidBookingPayload("Title cannot be empty.")
    if not short_description.strip():
        raise InvalidBookingPayload("Short description cannot be empty.")

    if desired_end_time <= desired_start_time:
        raise InvalidScheduleRange()

    slot = await find_available_slot(db, lawyer_id, desired_start_time, desired_end_time)
    if not slot:
        raise InvalidScheduleSelection()

    attachment_key: str | None = None
    if attachment is not None:
        payload = await attachment.read()
        if not payload:
            raise InvalidBookingPayload("Attachment cannot be empty.")
        attachment_key = build_booking_attachment_key(None, attachment.filename)
        stored_key = await upload_attachment(payload, attachment_key, attachment.content_type)
        if not stored_key:
            raise AttachmentUploadFailed()
        attachment_key = stored_key

    booking = BookingRequest(
        client_id=current_user.id,
        lawyer_id=lawyer_id,
        schedule_slot_id=slot.id,
        title=title.strip(),
        short_description=short_description.strip(),
        desired_start_time=desired_start_time,
        desired_end_time=desired_end_time,
        attachment_key=attachment_key,
    )
    slot.is_booked = True

    db.add(booking)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        if attachment_key:
            await delete_attachment(attachment_key)
        raise

    await db.refresh(booking)
    return await _build_booking_create_response(booking)


@booking_route.get("/requests/me", response_model=List[BookingRequestSummary])
async def list_my_requests(db: SessionDep, current_user: User = Depends(get_current_user)) -> List[BookingRequestSummary]:

    _ensure_client(current_user)

    result = await db.execute(
        select(BookingRequest).where(BookingRequest.client_id == current_user.id)
    )
    bookings = result.scalars().all()
    responses: List[BookingRequestSummary] = []
    for booking in bookings:
        data = await build_booking_response(booking)
        responses.append(BookingRequestSummary(**data))
    return responses


@booking_route.get("/requests/incoming", response_model=List[BookingRequestSummary])
async def list_incoming_requests(db: SessionDep, current_user: User = Depends(get_current_user)) -> List[BookingRequestSummary]:

    _ensure_lawyer(current_user)

    result = await db.execute(
        select(BookingRequest).where(BookingRequest.lawyer_id == current_user.id)
    )
    bookings = result.scalars().all()
    responses: List[BookingRequestSummary] = []
    for booking in bookings:
        data = await build_booking_response(booking)
        responses.append(BookingRequestSummary(**data))
    return responses


@booking_route.get("/requests/{booking_id}", response_model=BookingRequestCreateResponse)
async def get_booking_request(
    booking_id: UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> BookingRequestCreateResponse:

    booking = await _get_booking(db, booking_id)
    if current_user.id not in (booking.client_id, booking.lawyer_id) and current_user.role != UserRole.ADMIN.value:
        raise BookingForbidden()

    return await _build_booking_create_response(booking)


@booking_route.post("/requests/{booking_id}/decision",
                    response_model=BookingDecisionResponse)
async def decide_booking_request(
    booking_id: UUID,
    payload: BookingDecisionPayload,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> BookingDecisionResponse:

    await mark_expired_slots(db)
    booking = await _get_booking(db, booking_id)

    if booking.lawyer_id != current_user.id:
        raise BookingForbidden()

    if booking.status != BookingRequestStatus.PENDING.value:
        raise BookingAlreadyReviewed()

    slot = None
    if booking.schedule_slot_id:
        slot = await _get_schedule_slot(db, booking.schedule_slot_id)
        if slot.expired:
            slot = None

    now = datetime.now(timezone.utc)

    case_response: CaseHistoryResponse | None = None

    if payload.accept:
        booking.status = BookingRequestStatus.ACCEPTED.value
        booking.decision_at = now
        if not slot:
            slot = await find_available_slot(db, booking.lawyer_id, booking.desired_start_time, booking.desired_end_time)
        if not slot:
            raise ScheduleAlreadyBooked()
        slot.is_booked = True
        case = CaseHistory(
            booking_request_id=booking.id,
            lawyer_id=booking.lawyer_id,
            client_id=booking.client_id,
            title=booking.title,
            description=booking.short_description,
            state=CaseState.IN_PROGRESS.value,
            attachment_keys=[booking.attachment_key] if booking.attachment_key else [],
            started_at=now,
        )
        db.add(case)
    else:
        booking.status = BookingRequestStatus.DECLINED.value
        booking.decision_at = now
        if slot:
            slot.is_booked = False

    await db.commit()

    await db.refresh(booking)

    if payload.accept:
        case = await db.execute(
            select(CaseHistory).where(CaseHistory.booking_request_id == booking.id)
        )
        created_case = case.scalar_one()
        case_response = await _build_case_response(created_case)

    booking_summary = BookingRequestSummary(**(await build_booking_response(booking)))
    return BookingDecisionResponse(
        booking=booking_summary,
        case=case_response,
    )


@booking_route.get("/cases/me", response_model=List[CaseHistoryResponse])
async def list_my_cases(db: SessionDep, current_user: User = Depends(get_current_user)) -> List[CaseHistoryResponse]:

    role_field = CaseHistory.lawyer_id if current_user.role == UserRole.LAWYER.value else CaseHistory.client_id

    result = await db.execute(select(CaseHistory).where(role_field == current_user.id))
    cases = result.scalars().all()
    responses: List[CaseHistoryResponse] = []
    for case in cases:
        responses.append(await _build_case_response(case))
    return responses


@booking_route.get("/cases/{case_id}", response_model=CaseHistoryResponse)
async def get_case_history(
    case_id: UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> CaseHistoryResponse:

    case = await _get_case(db, case_id)
    if current_user.id not in (case.client_id, case.lawyer_id) and current_user.role != UserRole.ADMIN.value:
        raise BookingForbidden()

    return await _build_case_response(case)


@booking_route.patch("/cases/{case_id}", response_model=CaseHistoryResponse)
async def update_case_history(
    case_id: UUID,
    payload: CaseUpdatePayload,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> CaseHistoryResponse:

    _ensure_lawyer(current_user)
    case = await _get_case(db, case_id)
    if case.lawyer_id != current_user.id:
        raise BookingForbidden()

    update_data = payload.model_dump(exclude_unset=True)

    if "title" in update_data:
        if not update_data["title"].strip():
            raise InvalidBookingPayload("Title cannot be empty.")
        case.title = update_data["title"].strip()
    if "description" in update_data:
        case.description = update_data["description"].strip()
    if "state" in update_data and update_data["state"] is not None:
        new_state = update_data["state"]
        if new_state not in (CaseState.COMPLETED, CaseState.CANCELLED):
            raise CaseStateUpdateForbidden()
        case.ending_time = datetime.now(timezone.utc)
        case.state = new_state.value

    await db.commit()
    await db.refresh(case)
    return await _build_case_response(case)


@booking_route.patch("/cases/{case_id}/notes", response_model=CaseHistoryResponse)
async def update_case_notes(
    case_id: UUID,
    payload: CaseNotePayload,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> CaseHistoryResponse:

    case = await _get_case(db, case_id)

    if current_user.id not in (case.client_id, case.lawyer_id):
        raise BookingForbidden()

    if current_user.role == UserRole.LAWYER.value and payload.lawyer_note is not None:
        case.lawyer_note = payload.lawyer_note.strip() if payload.lawyer_note else None
    if current_user.role == UserRole.CLIENT.value and payload.client_note is not None:
        case.client_note = payload.client_note.strip() if payload.client_note else None

    await db.commit()
    await db.refresh(case)
    return await _build_case_response(case)


@booking_route.post("/cases/{case_id}/attachments",
                    response_model=CaseHistoryResponse,
                    status_code=status.HTTP_201_CREATED)
async def add_case_attachment(
    db: SessionDep,
    case_id: UUID,
    attachment: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> CaseHistoryResponse:

    case = await _get_case(db, case_id)
    if current_user.id not in (case.client_id, case.lawyer_id):
        raise BookingForbidden()

    payload = await attachment.read()
    if not payload:
        raise InvalidBookingPayload("Attachment cannot be empty.")

    key = build_case_attachment_key(case.id, attachment.filename)
    stored_key = await upload_attachment(payload, key, attachment.content_type)
    if not stored_key:
        raise AttachmentUploadFailed()

    attachment_keys = case.attachment_keys or []
    attachment_keys.append(stored_key)
    case.attachment_keys = attachment_keys

    await db.commit()
    await db.refresh(case)

    return await _build_case_response(case)


@booking_route.post("/cases/{case_id}/rating",
                    response_model=RatingResponse,
                    status_code=status.HTTP_201_CREATED)
async def rate_case(
    case_id: UUID,
    payload: RatingPayload,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> RatingResponse:

    case = await _get_case(db, case_id)

    if case.client_id != current_user.id:
        raise BookingForbidden("Only the client associated with the case can rate it.")

    if case.state != CaseState.COMPLETED.value:
        raise RatingNotAllowed()

    stars = payload.stars
    if stars < 1 or stars > 5:
        raise RatingInvalidStars()

    existing_rating = await db.execute(
        select(LawyerRating).where(LawyerRating.case_history_id == case.id)
    )
    if existing_rating.scalar_one_or_none():
        raise RatingAlreadySubmitted()

    rating = LawyerRating(
        case_history_id=case.id,
        lawyer_id=case.lawyer_id,
        client_id=case.client_id,
        stars=stars,
        detailed_review=payload.detailed_review.strip(),
    )
    db.add(rating)
    await db.commit()
    await db.refresh(rating)

    return _build_rating_response(rating)


@booking_route.get("/cases/{case_id}/rating", response_model=RatingResponse | None)
async def get_case_rating(
    case_id: UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> RatingResponse | None:

    case = await _get_case(db, case_id)
    if current_user.id not in (case.client_id, case.lawyer_id) and current_user.role != UserRole.ADMIN.value:
        raise BookingForbidden()

    result = await db.execute(select(LawyerRating).where(LawyerRating.case_history_id == case.id))
    rating = result.scalar_one_or_none()
    if not rating:
        return None

    return _build_rating_response(rating)


@booking_route.get("/lawyers/{lawyer_id}/ratings", response_model=List[RatingResponse])
async def get_lawyer_ratings(
    lawyer_id: UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> List[RatingResponse]:

    ratings_result = await db.execute(
        select(LawyerRating)
        .where(LawyerRating.lawyer_id == lawyer_id)
        .order_by(LawyerRating.create_at.desc())
    )
    ratings = ratings_result.scalars().all()

    return [_build_rating_response(rating) for rating in ratings]