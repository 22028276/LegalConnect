import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ChatUserSummary(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    avatar_url: str | None = Field(
        default=None,
        json_schema_extra={"format": "binary"},
    )

    class Config:
        from_attributes = True


class ChatParticipantResponse(BaseModel):
    conversation_id: uuid.UUID
    user: ChatUserSummary
    joined_at: datetime
    last_read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    content: Optional[str] = None
    created_at: datetime
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_content_type: Optional[str] = None
    attachment_size: Optional[int] = None
    delivered_to: list[uuid.UUID] = Field(default_factory=list)
    read_by: list[uuid.UUID] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ChatConversationResponse(BaseModel):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None
    participants: list[ChatParticipantResponse]
    last_message: Optional[ChatMessageResponse] = None

    class Config:
        from_attributes = True


class ChatConversationCreate(BaseModel):
    recipient_id: uuid.UUID


class ChatMessageCreate(BaseModel):
    content: str


class MessageDeliveryStatus(str, Enum):
    DELIVERED = "delivered"
    READ = "read"


class ChatMessageAcknowledge(BaseModel):
    status: MessageDeliveryStatus