from datetime import datetime
from uuid import UUID
import json
from typing import Any

from fastapi import Form
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from src.lawyer.constants import (
    LawyerVerificationStatus,
    MAX_DISPLAY_NAME_LENGTH,
    MAX_EDUCATION_LENGTH,
    MAX_OFFICE_ADDRESS_LENGTH,
    MAX_PHONE_NUMBER_LENGTH,
    MAX_WEBSITE_LENGTH,
    MAX_REVOCATION_REASON_LENGTH,
)
from src.user.constants import MAX_USER_ADDRESS_LENGTH


_FORM_UNSET = object()
from src.user.schemas import UserResponse


class RequestSummaryResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: LawyerVerificationStatus
    years_of_experience: int
    current_job_position: str | None
    rejection_reason: str | None
    reviewed_by_admin_id: UUID | None
    reviewed_at: datetime | None
    create_at: datetime
    updated_at: datetime
    user: UserResponse


class RequestDetailResponse(RequestSummaryResponse):
    identity_card_front_url: str
    identity_card_back_url: str
    portrait_url: str
    law_certificate_url: str
    bachelor_degree_url: str


class RequestRejectPayload(BaseModel):
    rejection_reason: str | None = Field(default=None, max_length=500)

    @field_validator("rejection_reason")
    @classmethod
    def _strip_reason(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class LawyerProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    email: EmailStr
    avatar_url: str | None = Field(
        default=None,
        json_schema_extra={"format": "binary"},
    )
    phone_number: str | None
    website_url: str | None
    office_address: str | None
    speaking_languages: list[str]
    education: str | None
    current_level: str | None
    years_of_experience: int
    average_rating: float | None = Field(default=None)
    create_at: datetime
    updated_at: datetime


class LawyerProfileUpdatePayload(BaseModel):
    phone_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_PHONE_NUMBER_LENGTH,
    )
    website_url: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_WEBSITE_LENGTH,
    )
    office_address: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_OFFICE_ADDRESS_LENGTH,
    )
    speaking_languages: list[str] | None = Field(default=None, min_length=1)
    education: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_EDUCATION_LENGTH,
    )
    address: str | None = Field(
        default=None,
        min_length=1,
        max_length=MAX_USER_ADDRESS_LENGTH,
    )

    model_config = ConfigDict(populate_by_name=True)
    
    @classmethod
    def as_form(
        cls,
        phone_number: str | None = Form(default=_FORM_UNSET),
        website_url: str | None = Form(default=_FORM_UNSET),
        office_address: str | None = Form(default=_FORM_UNSET),
        speaking_languages: list[str] | None = Form(default=_FORM_UNSET),
        education: str | None = Form(default=_FORM_UNSET),
        address: str | None = Form(default=_FORM_UNSET),
    ) -> "LawyerProfileUpdatePayload":
        data: dict[str, Any] = {}

        def _clean(value: Any) -> Any:
            if isinstance(value, str):
                stripped = value.strip()
                if stripped == "":
                    return None
                if stripped.lower() == "null":
                    return None
                return value
            return value

        if phone_number is not _FORM_UNSET:
            data["phone_number"] = _clean(phone_number)
        if website_url is not _FORM_UNSET:
            data["website_url"] = _clean(website_url)
        if office_address is not _FORM_UNSET:
            data["office_address"] = _clean(office_address)
        if speaking_languages is not _FORM_UNSET:
            if isinstance(speaking_languages, str):
                try:
                    parsed = json.loads(speaking_languages)
                except json.JSONDecodeError:
                    parsed = [speaking_languages]
                else:
                    if isinstance(parsed, list):
                        data["speaking_languages"] = parsed
                    elif parsed is None:
                        data["speaking_languages"] = None
                    else:
                        data["speaking_languages"] = [str(parsed)]
            else:
                data["speaking_languages"] = speaking_languages
        if education is not _FORM_UNSET:
            data["education"] = _clean(education)
        if address is not _FORM_UNSET:
            data["address"] = _clean(address)

        return cls(**data)
    
    @field_validator("speaking_languages")
    @classmethod
    def validate_languages(
        cls, value: list[str] | None
    ) -> list[str] | None:
        if value is None:
            return None

        cleaned = [language.strip() for language in value if language.strip()]
        if not cleaned:
            raise ValueError("speaking_languages must contain non-empty values")
        return cleaned


class LawyerRoleRevocationPayload(BaseModel):
    reason: str = Field(..., min_length=1, max_length=MAX_REVOCATION_REASON_LENGTH)


class LawyerRoleRevocationResponse(BaseModel):
    id: UUID
    user_id: UUID
    revoked_by_admin_id: UUID | None
    reason: str
    create_at: datetime
    updated_at: datetime