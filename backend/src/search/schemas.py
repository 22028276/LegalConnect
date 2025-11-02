from __future__ import annotations

from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SearchResultType(StrEnum):
    LAWYER = "lawyer"
    DOCUMENT = "document"


class SearchLawyerResult(BaseModel):
    type: Literal[SearchResultType.LAWYER] = Field(
        default=SearchResultType.LAWYER, const=True
    )
    lawyer_id: UUID
    username: str
    email: EmailStr
    display_name: str
    average_rating: float | None


class SearchDocumentResult(BaseModel):
    type: Literal[SearchResultType.DOCUMENT] = Field(
        default=SearchResultType.DOCUMENT, const=True
    )
    document_id: UUID
    display_name: str
    original_filename: str
    content_type: str
    uploaded_by: str | None
    download_url: str | None = None


class SearchResponse(BaseModel):
    query: str
    lawyers: list[SearchLawyerResult]
    documents: list[SearchDocumentResult]