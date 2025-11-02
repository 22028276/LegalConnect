from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, or_, select

from src.auth.dependencies import get_current_user
from src.booking.utils import calculate_lawyer_rating
from src.core.database import SessionDep
from src.documentation.models import LawDocumentation
from src.documentation.utils import generate_document_url
from src.lawyer.models import LawyerProfile
from src.search.schemas import SearchDocumentResult, SearchLawyerResult, SearchResponse
from src.user.constants import UserRole
from src.user.models import User


search_route = APIRouter(
    prefix="/search",
    tags=["Search"],
)

_ALLOWED_ROLES: set[str] = {
    UserRole.CLIENT.value,
    UserRole.LAWYER.value,
    UserRole.ADMIN.value,
}


def _lawyer_display_name(user: User | None) -> str:
    if user and user.username:
        normalized = user.username.strip()
        if normalized:
            return normalized
    return "Lawyer"

@search_route.get("/", response_model=SearchResponse)
async def search_resources(
    db: SessionDep,
    q: str = Query(..., min_length=1, max_length=200, alias="query"),
    lawyer_limit: int = Query(10, ge=1, le=50),
    document_limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    if current_user.role not in _ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Search is not available for this role.",
        )

    term = q.strip()
    if not term:
        return SearchResponse(query=term, lawyers=[], documents=[])

    normalized = term.lower()
    pattern = f"%{normalized}%"

    languages_field = func.lower(
        func.coalesce(func.array_to_string(LawyerProfile.speaking_languages, ","), "")
    )

    lawyer_rank = case(
        (func.lower(User.username) == normalized, 0),
        (func.lower(User.email) == normalized, 1),
        else_=2,
    )

    lawyer_stmt = (
        select(LawyerProfile, User, lawyer_rank)
        .join(User, LawyerProfile.user_id == User.id)
        .where(User.role == UserRole.LAWYER.value)
        .where(
            or_(
                func.lower(User.username).like(pattern),
                func.lower(User.email).like(pattern),
                func.lower(func.coalesce(LawyerProfile.current_level, "")).like(pattern),
                func.lower(func.coalesce(LawyerProfile.office_address, "")).like(pattern),
                func.lower(func.coalesce(LawyerProfile.education, "")).like(pattern),
                languages_field.like(pattern),
            )
        )
        .order_by(lawyer_rank, func.lower(User.username))
        .limit(lawyer_limit)
    )

    lawyer_records = await db.execute(lawyer_stmt)
    lawyer_results: list[SearchLawyerResult] = []
    display_updates = False
    for profile, user, _ in lawyer_records.all():
        desired_display = _lawyer_display_name(user)
        if profile.display_name != desired_display:
            profile.display_name = desired_display
            display_updates = True
        rating = await calculate_lawyer_rating(db, user.id)
        lawyer_results.append(
            SearchLawyerResult(
                lawyer_id=user.id,
                username=desired_display,
                email=user.email,
                display_name=desired_display,
                average_rating=rating,
            )
        )

    if display_updates:
        await db.commit()

    document_rank = case(
        (func.lower(LawDocumentation.display_name) == normalized, 0),
        (func.lower(LawDocumentation.original_filename) == normalized, 1),
        else_=2,
    )

    document_stmt = (
        select(LawDocumentation, User, document_rank)
        .join(User, LawDocumentation.uploaded_by_id == User.id, isouter=True)
        .where(
            or_(
                func.lower(LawDocumentation.display_name).like(pattern),
                func.lower(LawDocumentation.original_filename).like(pattern),
                func.lower(func.coalesce(LawDocumentation.content_type, "")).like(pattern),
            )
        )
        .order_by(document_rank, func.lower(LawDocumentation.display_name))
        .limit(document_limit)
    )

    document_records = await db.execute(document_stmt)
    document_results: list[SearchDocumentResult] = []
    for document, uploader, _ in document_records.all():
        uploaded_by = None
        if uploader and uploader.username:
            uploaded_by = uploader.username.strip() or None
        download_url = await generate_document_url(document.s3_key)
        document_results.append(
            SearchDocumentResult(
                document_id=document.id,
                display_name=document.display_name,
                original_filename=document.original_filename,
                content_type=document.content_type,
                uploaded_by=uploaded_by,
                download_url=download_url,
            )
        )

    return SearchResponse(
        query=term,
        lawyers=lawyer_results,
        documents=document_results,
    )