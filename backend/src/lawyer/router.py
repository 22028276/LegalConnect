from __future__ import annotations
import asyncio

from datetime import datetime, timezone
from typing import Iterable
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import select

from src.auth.dependencies import get_current_user
from src.core.database import SessionDep
from src.lawyer.constants import (
    LawyerVerificationStatus,
    MAX_JOB_POSITION_LENGTH,
)
from src.lawyer.exceptions import (
    RequestAlreadyExists,
    RequestAlreadyReviewed,
    RequestDocumentUnavailable,
    RequestInvalidExperience,
    RequestInvalidJobPosition,
    RequestForbidden,
    RequestNotFound,
    RequestRoleForbidden,
    RequestUploadFailed,
    LawyerProfileForbidden,
    LawyerProfileInvalidField,
    LawyerProfileInvalidLanguages,
    LawyerProfileNotFound,
    InvalidRevocationReason,
    InvalidCurrentRoleRevocation,
    LawyerProfileNotFound,
)
from src.lawyer.models import (
    LawyerProfile,
    LawyerRoleRevocation,
    LawyerVerificationRequest,
)
from src.lawyer.schemas import (
    LawyerProfileResponse,
    LawyerProfileUpdatePayload,
    RequestDetailResponse,
    RequestRejectPayload,
    RequestSummaryResponse,
    LawyerRoleRevocationPayload,
    LawyerRoleRevocationResponse,
)
from src.lawyer.utils import (
    build_verification_document_key,
    delete_file_from_s3,
    generate_presigned_url,
    upload_file_to_s3,
)
from src.booking.utils import calculate_lawyer_rating
from src.user.constants import UserRole
from src.user.models import User
from src.user.schemas import UserResponse


DOCUMENT_COLUMN_NAMES: tuple[str, ...] = (
    "identity_card_front_url",
    "identity_card_back_url",
    "portrait_url",
    "law_certificate_url",
    "bachelor_degree_url",
)


lawyer_route = APIRouter(
    tags=["Lawyer"],
    prefix="/lawyer",
)


async def _generate_document_urls(request: LawyerVerificationRequest) -> dict[str, str]:

    tasks = {
        column: asyncio.create_task(
            generate_presigned_url(getattr(request, column))
        )
        for column in DOCUMENT_COLUMN_NAMES
    }

    results: dict[str, str] = {}
    for column, task in tasks.items():
        url = await task
        if not url:
            raise RequestDocumentUnavailable()
        results[column] = url
    return results


def _build_summary_response(request: LawyerVerificationRequest, user: User) -> RequestSummaryResponse:

    return RequestSummaryResponse(
        id = request.id,
        user_id = request.user_id,
        status = LawyerVerificationStatus(request.status),
        years_of_experience = request.years_of_experience,
        current_job_position = request.current_job_position,
        rejection_reason = request.rejection_reason,
        reviewed_by_admin_id = request.reviewed_by_admin_id,
        reviewed_at = request.reviewed_at,
        create_at = request.create_at,
        updated_at = request.updated_at,
        user = UserResponse.model_validate(user),
    )


async def _build_detail_response(request: LawyerVerificationRequest, user: User) -> RequestDetailResponse:

    summary = _build_summary_response(request, user)
    document_urls = await _generate_document_urls(request)

    return RequestDetailResponse(
        **summary.model_dump(), 
        **document_urls
    )


async def _cleanup_uploaded_documents(keys: Iterable[str]) -> None:

    tasks = [asyncio.create_task(delete_file_from_s3(key)) for key in keys]
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)


def _ensure_admin(user: User) -> None:
    if user.role != UserRole.ADMIN.value:
        raise RequestForbidden()


async def _build_profile_response(db: SessionDep,
                                  profile: LawyerProfile, 
                                  user: User
                                  ) -> LawyerProfileResponse:
    
    rating = await calculate_lawyer_rating(db, profile.user_id)

    return LawyerProfileResponse(
        id = profile.id,
        user_id = profile.user_id,
        display_name = profile.display_name,
        email = user.email,
        phone_number = profile.phone_number,
        website_url = profile.website_url,
        office_address = profile.office_address,
        speaking_languages = profile.speaking_languages,
        education = profile.education,
        current_level = profile.current_level,
        years_of_experience = profile.years_of_experience,
        average_rating = rating,
        create_at = profile.create_at,
        updated_at = profile.updated_at,
    )


async def _get_lawyer_profile(
    db: SessionDep,
    user_id: UUID,
) -> LawyerProfile | None:
    result = await db.execute(
        select(LawyerProfile).where(LawyerProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


@lawyer_route.post("/verification-requests", 
                   response_model=RequestDetailResponse, 
                   status_code=status.HTTP_201_CREATED)
async def create_lawyer_verification_request(db: SessionDep, 
                                             identity_card_front: UploadFile = File(...),
                                             identity_card_back: UploadFile = File(...),
                                             portrait: UploadFile = File(...),
                                             law_certificate: UploadFile = File(...),
                                             bachelor_degree: UploadFile = File(...),
                                             years_of_experience: int = Form(...),
                                             current_job_position: str | None = Form(default=None),
                                             current_user: User = Depends(get_current_user)
                                             ) -> RequestDetailResponse:
    
    if current_user.role != UserRole.CLIENT.value:
        raise RequestRoleForbidden()

    if years_of_experience < 0:
        raise RequestInvalidExperience()

    job_position_value = current_job_position.strip() if current_job_position else None
    if job_position_value and len(job_position_value) > MAX_JOB_POSITION_LENGTH:
        raise RequestInvalidJobPosition()
    current_job_position = job_position_value

    existing_request_result = await db.execute(
        select(LawyerVerificationRequest).where(
            LawyerVerificationRequest.user_id == current_user.id,
            LawyerVerificationRequest.status == LawyerVerificationStatus.PENDING.value,
        )
    )
    existing_request = existing_request_result.scalar_one_or_none()

    if existing_request:
        raise RequestAlreadyExists()

    documents = {
        "identity_card_front_url": identity_card_front,
        "identity_card_back_url": identity_card_back,
        "portrait_url": portrait,
        "law_certificate_url": law_certificate,
        "bachelor_degree_url": bachelor_degree,
    }

    uploaded_keys: dict[str, str] = {}

    try:
        for column, upload in documents.items():
            file_content = await upload.read()
            s3_key = build_verification_document_key(
                current_user.id,
                column.replace("_url", ""),
                upload.filename,
            )
            stored_key = await upload_file_to_s3(
                file_content,
                s3_key,
                upload.content_type or "application/octet-stream",
            )

            if not stored_key:
                raise RequestUploadFailed()
            uploaded_keys[column] = stored_key

    except RequestUploadFailed:
        await _cleanup_uploaded_documents(uploaded_keys.values())
        raise

    except Exception as exc:
        await _cleanup_uploaded_documents(uploaded_keys.values())
        raise RequestUploadFailed() from exc

    new_request = LawyerVerificationRequest(
        user_id = current_user.id,
        years_of_experience = years_of_experience,
        current_job_position = current_job_position,
        status = LawyerVerificationStatus.PENDING.value,
        **uploaded_keys,
    )

    db.add(new_request)
    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        await _cleanup_uploaded_documents(uploaded_keys.values())
        raise RequestUploadFailed() from exc

    await db.refresh(new_request)

    return await _build_detail_response(new_request, current_user)


@lawyer_route.get("/verification-requests/me",
                  response_model=list[RequestSummaryResponse])
async def list_my_lawyer_verification_requests(db: SessionDep,
                                               current_user: User = Depends(get_current_user)
                                               ) -> list[RequestSummaryResponse]:
    
    result = await db.execute(
        select(LawyerVerificationRequest)
        .where(LawyerVerificationRequest.user_id == current_user.id)
        .order_by(LawyerVerificationRequest.create_at.desc())
    )

    requests = result.scalars().all()

    return [_build_summary_response(request, current_user) for request in requests]


@lawyer_route.get("/verification-requests", 
                  response_model=list[RequestSummaryResponse])
async def list_lawyer_verification_requests(db: SessionDep,
                                            status_filter: LawyerVerificationStatus | None = Query(default=None, alias="status"),
                                            current_user: User = Depends(get_current_user)
                                            ) -> list[RequestSummaryResponse]:
    
    _ensure_admin(current_user)

    stmt = select(LawyerVerificationRequest)
    if status_filter:
        stmt = stmt.where(LawyerVerificationRequest.status == status_filter.value)

    stmt = stmt.order_by(LawyerVerificationRequest.create_at.desc())

    result = await db.execute(stmt)
    requests = result.scalars().all()

    if not requests:
        return []

    user_ids = {request.user_id for request in requests}
    users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = {user.id: user for user in users_result.scalars().all()}

    missing_user_ids = user_ids.difference(users.keys())
    if missing_user_ids:
        raise RequestNotFound()

    return [
        _build_summary_response(request, users[request.user_id])
        for request in requests
    ]


@lawyer_route.get("/verification-requests/{request_id}",
                  response_model=RequestDetailResponse)
async def get_lawyer_verification_request(request_id: UUID,
                                          db: SessionDep,
                                          current_user: User = Depends(get_current_user)
                                          ) -> RequestDetailResponse:
    
    request = await db.get(LawyerVerificationRequest, request_id)
    if not request:
        raise RequestNotFound()

    if current_user.role != UserRole.ADMIN.value and request.user_id != current_user.id:
        raise RequestForbidden()

    user = await db.get(User, request.user_id)
    if not user:
        raise RequestNotFound()

    return await _build_detail_response(request, user)



@lawyer_route.patch("/verification-requests/{request_id}/approve",
                    response_model=RequestDetailResponse)
async def approve_lawyer_verification_request(request_id: UUID,
                                              db: SessionDep,
                                              current_user: User = Depends(get_current_user)
                                              ) -> RequestDetailResponse:
    
    _ensure_admin(current_user)

    request = await db.get(LawyerVerificationRequest, request_id)
    if not request:
        raise RequestNotFound()

    if request.status != LawyerVerificationStatus.PENDING.value:
        raise RequestAlreadyReviewed()

    request.status = LawyerVerificationStatus.APPROVED.value
    request.rejection_reason = None
    request.reviewed_by_admin_id = current_user.id
    request.reviewed_at = datetime.now(timezone.utc)

    user = await db.get(User, request.user_id)
    if user:
        user.role = UserRole.LAWYER.value

    profile = await _get_lawyer_profile(db, request.user_id)
    if not profile:
        display_name = (user.username if user else "Lawyer").strip() or "Lawyer"
        profile = LawyerProfile(
            user_id=request.user_id,
            display_name=display_name,
            phone_number=user.phone_number if user else None,
            office_address=user.address if user else None,
            current_level=request.current_job_position,
            years_of_experience=request.years_of_experience,
        )
        db.add(profile)
    else:
        profile.current_level = request.current_job_position
        profile.years_of_experience = request.years_of_experience

    await db.commit()
    await db.refresh(request)

    if not user:
        raise RequestNotFound()

    return await _build_detail_response(request, user)


@lawyer_route.patch("/verification-requests/{request_id}/reject",
                    response_model=RequestDetailResponse)
async def reject_lawyer_verification_request(request_id: UUID,
                                             payload: RequestRejectPayload,
                                             db: SessionDep,
                                             current_user: User = Depends(get_current_user)
                                             ) -> RequestDetailResponse:
    
    _ensure_admin(current_user)

    request = await db.get(LawyerVerificationRequest, request_id)
    if not request:
        raise RequestNotFound()

    if request.status != LawyerVerificationStatus.PENDING.value:
        raise RequestAlreadyReviewed()

    request.status = LawyerVerificationStatus.REJECTED.value
    request.rejection_reason = payload.rejection_reason
    request.reviewed_by_admin_id = current_user.id
    request.reviewed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(request)

    user = await db.get(User, request.user_id)
    if not user:
        raise RequestNotFound()

    return await _build_detail_response(request, user)


@lawyer_route.post("/lawyers/{lawyer_id}/revoke",
                   response_model=LawyerRoleRevocationResponse,
                   status_code=status.HTTP_201_CREATED)
async def revoke_lawyer_role(lawyer_id: UUID,
                             payload: LawyerRoleRevocationPayload,
                             db: SessionDep,
                             current_user: User = Depends(get_current_user)
                             ) -> LawyerRoleRevocationResponse:
    
    _ensure_admin(current_user)

    user = await db.get(User, lawyer_id)
    if not user:
        raise LawyerProfileNotFound()
    if user.role != UserRole.LAWYER.value:
        raise InvalidCurrentRoleRevocation()

    reason = payload.reason.strip()
    if not reason:
        raise InvalidRevocationReason()

    result = await db.execute(
        select(LawyerVerificationRequest).where(
            LawyerVerificationRequest.user_id == lawyer_id
        )
    )
    requests = result.scalars().all()

    document_keys = {
        getattr(request, column)
        for request in requests
        for column in DOCUMENT_COLUMN_NAMES
        if getattr(request, column, None)
    }

    reviewable_statuses = {
        LawyerVerificationStatus.APPROVED.value,
        LawyerVerificationStatus.PENDING.value,
    }
    now = datetime.now(timezone.utc)
    for request in requests:
        if request.status in reviewable_statuses:
            request.status = LawyerVerificationStatus.REVOKED.value
            request.rejection_reason = reason
            request.reviewed_by_admin_id = current_user.id
            request.reviewed_at = now

    profile = await _get_lawyer_profile(db, lawyer_id)
    if profile:
        await db.delete(profile)

    user.role = UserRole.CLIENT.value

    revocation = LawyerRoleRevocation(
        user_id=lawyer_id,
        revoked_by_admin_id=current_user.id,
        reason=reason,
    )
    db.add(revocation)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(revocation)

    if document_keys:
        await _cleanup_uploaded_documents(document_keys)

    return LawyerRoleRevocationResponse(
        id=revocation.id,
        user_id=revocation.user_id,
        revoked_by_admin_id=revocation.revoked_by_admin_id,
        reason=revocation.reason,
        create_at=revocation.create_at,
        updated_at=revocation.updated_at,
    )

@lawyer_route.get("/profile",
                  response_model=list[LawyerProfileResponse])
async def list_lawyer_profiles(db: SessionDep,
                               ) -> list[LawyerProfileResponse]:

    result = await db.execute(
        select(LawyerProfile, User)
        .join(User, LawyerProfile.user_id == User.id)
        .where(User.role == UserRole.LAWYER.value)
    )

    records = result.all()

    profiles: list[LawyerProfileResponse] = []
    updated = False
    for profile, user in records:
        profiles.append(await _build_profile_response(db, profile, user))

    profiles.sort(
        key=lambda item: (
            item.average_rating is None,
            -(item.average_rating or 0),
            item.display_name.lower(),
        )
    )

    return profiles


@lawyer_route.get("/profile/{lawyer_id}",
                  response_model=LawyerProfileResponse)
async def get_public_lawyer_profile(lawyer_id: UUID,
                                    db: SessionDep
                                    ) -> LawyerProfileResponse:
    
    profile = await _get_lawyer_profile(db, lawyer_id)
    if not profile:
        raise LawyerProfileNotFound()

    user = await db.get(User, lawyer_id)
    if not user or user.role != UserRole.LAWYER.value:
        raise LawyerProfileNotFound()

    return await _build_profile_response(db, profile, user)


@lawyer_route.get("/profile/me",
                  response_model=LawyerProfileResponse)
async def get_my_lawyer_profile(db: SessionDep,
                                current_user: User = Depends(get_current_user)
                                ) -> LawyerProfileResponse:
    
    if current_user.role != UserRole.LAWYER.value:
        raise LawyerProfileForbidden()

    profile = await _get_lawyer_profile(db, current_user.id)
    if not profile:
        raise LawyerProfileNotFound()

    user = await db.get(User, current_user.id) or current_user
    return await _build_profile_response(db, profile, user)


@lawyer_route.patch("/profile/me",
                    response_model=LawyerProfileResponse)
async def update_my_lawyer_profile(payload: LawyerProfileUpdatePayload,
                                   db: SessionDep,
                                   current_user: User = Depends(get_current_user)
                                   ) -> LawyerProfileResponse:
    
    if current_user.role != UserRole.LAWYER.value:
        raise LawyerProfileForbidden()

    profile = await _get_lawyer_profile(db, current_user.id)
    if not profile:
        raise LawyerProfileNotFound()

    update_data = payload.model_dump(exclude_unset=True)

    if "speaking_languages" in update_data:
        languages = update_data["speaking_languages"]
        sanitized_languages = [
            language.strip()
            for language in languages
            if isinstance(language, str) and language.strip()
        ]
        if not sanitized_languages:
            raise LawyerProfileInvalidLanguages()
        profile.speaking_languages = sanitized_languages

    def _normalize(value: str, field_label: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise LawyerProfileInvalidField(f"{field_label} cannot be empty.")
        return normalized

    str_mappings = {
        "display_name": "Display name",
        "phone_number": "Phone number",
        "website_url": "Website URL",
        "office_address": "Office address",
        "education": "Education",
    }

    for field, label in str_mappings.items():
        if field not in update_data:
            continue

        value = update_data[field]
        if value is None:
            if field == "display_name":
                raise LawyerProfileInvalidField("Display name is required.")
            setattr(profile, field, None)
            continue

        normalized = _normalize(value, label)
        setattr(profile, field, normalized)

    await db.commit()
    await db.refresh(profile)

    user = await db.get(User, current_user.id) or current_user
    return await _build_profile_response(db, profile, user)