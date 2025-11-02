from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy import select
from sqlalchemy.orm import aliased, selectinload

from src.auth.dependencies import get_current_user
from src.auth.exceptions import InvalidToken
from src.auth.services import decode_token
from src.chat.exceptions import (
    AttachmentTooLarge,
    AttachmentUploadFailed,
    ConversationAccessForbidden,
)
from src.chat.manager import manager
from src.chat.moderation import (
    validate_attachment_content_type,
    validate_message_content,
)
from src.chat.rate_limit import rate_limiter
from src.chat.models import ChatConversation, ChatMessage, ChatParticipant
from src.chat.schemas import (
    ChatConversationCreate,
    ChatConversationResponse,
    ChatMessageAcknowledge,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatParticipantResponse,
    ChatUserSummary,
    MessageDeliveryStatus,
)
from src.chat.services import ChatService
from src.chat.utils import (
    build_chat_attachment_key,
    generate_attachment_url,
    upload_attachment_to_s3,
)
from src.core.base_model import time_now
from src.core.config import settings
from src.core.database import SessionDep, SessionLocal
from src.user.models import User
from src.user.utils import resolve_avatar_url


chat_route = APIRouter(
    tags=["Chat"],
    prefix="/chat",
)

logger = logging.getLogger("chat")


def _chat_service(db: SessionDep) -> ChatService:
    return ChatService(db)


@chat_route.get("/health")
async def chat_health() -> dict[str, object]:
    online_users = await manager.get_online_user_ids()
    return {
        "status": "ok",
        "online_users": len(online_users),
    }


async def _serialize_participant(
    participant: ChatParticipant,
) -> ChatParticipantResponse:
    avatar_url = await resolve_avatar_url(participant.user.avatar_url)
    return ChatParticipantResponse(
        conversation_id=participant.conversation_id,
        user=ChatUserSummary(
            id=participant.user.id,
            username=participant.user.username,
            email=participant.user.email,
            avatar_url=avatar_url,
        ),
        joined_at=participant.create_at,
        last_read_at=participant.last_read_at,
    )


async def _serialize_message(message: ChatMessage) -> ChatMessageResponse:
    attachment_url = None
    if message.attachment_key:
        attachment_url = await generate_attachment_url(message.attachment_key)
    delivered_to = [
        receipt.user_id
        for receipt in message.receipts
        if receipt.delivered_at is not None
    ]
    read_by = [
        receipt.user_id
        for receipt in message.receipts
        if receipt.read_at is not None
    ]
    return ChatMessageResponse(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        content=message.content,
        created_at=message.create_at,
        attachment_name=message.attachment_name,
        attachment_url=attachment_url,
        attachment_content_type=message.attachment_content_type,
        attachment_size=message.attachment_size,
        delivered_to=delivered_to,
        read_by=read_by,
    )


async def _serialize_conversation(
    db: SessionDep,
    conversation: ChatConversation,
) -> ChatConversationResponse:
    participants_result = await db.execute(
        select(ChatParticipant)
        .options(selectinload(ChatParticipant.user))
        .where(ChatParticipant.conversation_id == conversation.id)
        .order_by(ChatParticipant.create_at.asc())
    )
    participants = [
        await _serialize_participant(participant)
        for participant in participants_result.scalars().all()
    ]

    last_message = None
    if conversation.last_message_at:
        result = await db.execute(
            select(ChatMessage)
            .options(selectinload(ChatMessage.receipts))
            .where(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.create_at.desc())
            .limit(1)
        )
        message = result.scalar_one_or_none()
        if message:
            last_message = await _serialize_message(message)

    return ChatConversationResponse(
        id=conversation.id,
        created_at=conversation.create_at,
        updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at,
        participants=participants,
        last_message=last_message,
    )


async def _user_contact_ids(db: SessionDep, user_id: uuid.UUID) -> set[uuid.UUID]:
    conversation_stmt = select(ChatParticipant.conversation_id).where(
        ChatParticipant.user_id == user_id
    )
    conversation_result = await db.execute(conversation_stmt)
    conversation_ids = [row[0] for row in conversation_result.all()]
    if not conversation_ids:
        return set()

    contacts_stmt = select(ChatParticipant.user_id).where(
        ChatParticipant.conversation_id.in_(conversation_ids),
        ChatParticipant.user_id != user_id,
    )
    contacts_result = await db.execute(contacts_stmt)
    return {row[0] for row in contacts_result.all()}


@chat_route.post("/conversations", response_model=ChatConversationResponse, status_code=201)
async def create_conversation(
    payload: ChatConversationCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> ChatConversationResponse:
    if current_user.id == payload.recipient_id:
        raise HTTPException(status_code=400, detail="Cannot create a conversation with yourself.")

    recipient_result = await db.execute(
        select(User).where(User.id == payload.recipient_id)
    )
    recipient = recipient_result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found.")

    participant_a = aliased(ChatParticipant)
    participant_b = aliased(ChatParticipant)

    existing_stmt = (
        select(ChatConversation)
        .join(participant_a, participant_a.conversation_id == ChatConversation.id)
        .join(participant_b, participant_b.conversation_id == ChatConversation.id)
        .where(participant_a.user_id == current_user.id)
        .where(participant_b.user_id == payload.recipient_id)
    )
    existing_result = await db.execute(existing_stmt)
    conversation = existing_result.scalar_one_or_none()

    if conversation:
        return await _serialize_conversation(db, conversation)

    conversation = ChatConversation()
    db.add(conversation)
    await db.flush()

    db.add_all(
        [
            ChatParticipant(conversation_id=conversation.id, user_id=current_user.id),
            ChatParticipant(conversation_id=conversation.id, user_id=payload.recipient_id),
        ]
    )

    await db.commit()
    await db.refresh(conversation)

    return await _serialize_conversation(db, conversation)


@chat_route.get("/conversations", response_model=list[ChatConversationResponse])
async def list_conversations(
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> list[ChatConversationResponse]:
    stmt = (
        select(ChatConversation)
        .join(ChatParticipant)
        .where(ChatParticipant.user_id == current_user.id)
        .options(
            selectinload(ChatConversation.participants).selectinload(ChatParticipant.user)
        )
        .order_by(ChatConversation.last_message_at.desc(), ChatConversation.create_at.desc())
    )
    result = await db.execute(stmt)
    conversations = result.scalars().unique().all()
    serialized = []
    for conversation in conversations:
        serialized.append(await _serialize_conversation(db, conversation))
    return serialized


@chat_route.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[ChatMessageResponse],
)
async def list_messages(
    conversation_id: uuid.UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
    before: datetime | None = None,
    limit: int = 50,
) -> list[ChatMessageResponse]:
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100.")

    service = _chat_service(db)
    await service.get_conversation(conversation_id)
    await service.ensure_participant(conversation_id, current_user.id)

    stmt = (
        select(ChatMessage)
        .options(selectinload(ChatMessage.receipts))
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.create_at.desc())
        .limit(limit)
    )
    if before:
        stmt = stmt.where(ChatMessage.create_at < before)

    result = await db.execute(stmt)
    messages = list(result.scalars().all())
    messages.reverse()
    updated_ids = await service.mark_messages_delivered(messages, current_user.id)
    if updated_ids:
        await db.commit()
        participant_ids = await service.get_participant_ids(conversation_id)
        receipt_payload = {
            "type": "receipt",
            "data": {
                "message_ids": [str(mid) for mid in updated_ids],
                "status": MessageDeliveryStatus.DELIVERED.value,
                "user_id": str(current_user.id),
            },
        }
        await manager.broadcast(participant_ids, receipt_payload)

    serialized: list[ChatMessageResponse] = []
    for message in messages:
        serialized.append(await _serialize_message(message))
    return serialized


@chat_route.post(
    "/conversations/{conversation_id}/messages",
    response_model=ChatMessageResponse,
    status_code=201,
)
async def send_message(
    conversation_id: uuid.UUID,
    payload: ChatMessageCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> ChatMessageResponse:
    validate_message_content(payload.content)
    await rate_limiter.hit(current_user.id)

    service = _chat_service(db)
    conversation = await service.get_conversation(conversation_id)
    await service.ensure_participant(conversation_id, current_user.id)
    participant_ids = await service.get_participant_ids(conversation_id)

    message = await service.create_message(
        conversation,
        current_user.id,
        content=payload.content.strip(),
        recipient_ids=participant_ids,
    )

    await db.commit()
    await db.refresh(message, attribute_names=["receipts"])

    response = await _serialize_message(message)
    await manager.broadcast(
        participant_ids,
        {
            "type": "message",
            "data": response.model_dump(),
        },
    )
    logger.info(
        "chat.message.sent",
        extra={
            "conversation_id": str(conversation_id),
            "message_id": str(message.id),
            "sender_id": str(current_user.id),
            "has_attachment": bool(message.attachment_key),
        },
    )
    return response


@chat_route.post(
    "/messages/{message_id}/ack",
    response_model=ChatMessageResponse,
)
async def acknowledge_message(
    message_id: uuid.UUID,
    payload: ChatMessageAcknowledge,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
) -> ChatMessageResponse:
    service = _chat_service(db)
    message = await service.acknowledge_message(
        message_id,
        current_user.id,
        payload.status,
    )

    await db.commit()
    await db.refresh(message, attribute_names=["receipts"])

    response = await _serialize_message(message)
    participant_ids = await service.get_participant_ids(message.conversation_id)
    await manager.broadcast(
        participant_ids,
        {
            "type": "receipt",
            "data": {
                "message_ids": [str(message.id)],
                "status": payload.status.value,
                "user_id": str(current_user.id),
            },
        },
    )
    logger.info(
        "chat.message.acknowledged",
        extra={
            "message_id": str(message.id),
            "conversation_id": str(message.conversation_id),
            "user_id": str(current_user.id),
            "status": payload.status.value,
        },
    )
    return response


@chat_route.post(
    "/conversations/{conversation_id}/attachments",
    response_model=ChatMessageResponse,
    status_code=201,
)
async def upload_attachment(
    conversation_id: uuid.UUID,
    db: SessionDep,
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    caption: str | None = Form(None),
) -> ChatMessageResponse:
    await rate_limiter.hit(current_user.id)

    service = _chat_service(db)
    conversation = await service.get_conversation(conversation_id)
    await service.ensure_participant(conversation_id, current_user.id)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > settings.CHAT_ATTACHMENT_MAX_BYTES:
        raise AttachmentTooLarge(settings.CHAT_ATTACHMENT_MAX_BYTES)

    validate_attachment_content_type(
        file.content_type,
        settings.CHAT_ATTACHMENT_ALLOWED_CONTENT_TYPES,
    )

    caption_text = caption.strip() if caption else None
    if caption_text:
        validate_message_content(caption_text)

    attachment_key = build_chat_attachment_key(conversation_id, file.filename)
    uploaded_key = await upload_attachment_to_s3(file_bytes, attachment_key, file.content_type)

    if not uploaded_key:
        raise AttachmentUploadFailed()

    participant_ids = await service.get_participant_ids(conversation_id)

    message = await service.create_message(
        conversation,
        current_user.id,
        content=caption_text,
        attachment_name=file.filename,
        attachment_key=uploaded_key,
        attachment_content_type=file.content_type,
        attachment_size=len(file_bytes),
        recipient_ids=participant_ids,
    )

    await db.commit()
    await db.refresh(message, attribute_names=["receipts"])

    response = await _serialize_message(message)
    await manager.broadcast(
        participant_ids,
        {
            "type": "message",
            "data": response.model_dump(),
        },
    )
    logger.info(
        "chat.attachment.uploaded",
        extra={
            "conversation_id": str(conversation_id),
            "message_id": str(message.id),
            "sender_id": str(current_user.id),
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(file_bytes),
        },
    )
    return response


@chat_route.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str | None = None) -> None:
    if not token:
        await websocket.close(code=4401)
        return

    async with SessionLocal() as db:
        try:
            payload = decode_token(token)
        except InvalidToken:
            await websocket.close(code=4403)
            return

        if not payload or payload.get("type") != "access":
            await websocket.close(code=4403)
            return

        email = payload.get("sub")
        if not email:
            await websocket.close(code=4403)
            return

        result = await db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()
        if not user:
            await websocket.close(code=4403)
            return

        await websocket.accept()
        await manager.connect(user.id, websocket)

        service = _chat_service(db)
        contacts = await _user_contact_ids(db, user.id)
        now = time_now()
        await manager.broadcast(
            contacts,
            {
                "type": "presence",
                "data": {
                    "user_id": str(user.id),
                    "status": "online",
                    "last_seen_at": now.isoformat(),
                },
            },
        )

        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_payload = json.loads(data)
                except json.JSONDecodeError:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "message": "Invalid JSON payload.",
                            }
                        )
                    )
                    continue

                event_type = message_payload.get("type")
                if event_type == "message":
                    conversation_id_raw = message_payload.get("conversation_id")
                    content = (message_payload.get("content") or "").strip()

                    try:
                        conversation_uuid = uuid.UUID(conversation_id_raw)
                    except (ValueError, TypeError):
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": "Invalid conversation id.",
                                }
                            )
                        )
                        continue

                    try:
                        validate_message_content(content)
                    except HTTPException as exc:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": exc.detail,
                                }
                            )
                        )
                        continue

                    await rate_limiter.hit(user.id)

                    try:
                        conversation = await service.get_conversation(conversation_uuid)
                        await service.ensure_participant(conversation_uuid, user.id)
                    except ConversationAccessForbidden:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": "You are not a member of this conversation.",
                                }
                            )
                        )
                        continue

                    participant_ids = await service.get_participant_ids(conversation_uuid)
                    contacts.update(pid for pid in participant_ids if pid != user.id)

                    message = await service.create_message(
                        conversation,
                        user.id,
                        content=content,
                        recipient_ids=participant_ids,
                    )

                    await db.commit()
                    await db.refresh(message, attribute_names=["receipts"])

                    response = await _serialize_message(message)
                    await manager.broadcast(
                        participant_ids,
                        {
                            "type": "message",
                            "data": response.model_dump(),
                        },
                    )
                    logger.info(
                        "chat.message.sent",
                        extra={
                            "conversation_id": str(conversation_uuid),
                            "message_id": str(message.id),
                            "sender_id": str(user.id),
                            "has_attachment": bool(message.attachment_key),
                        },
                    )
                elif event_type == "typing":
                    conversation_id_raw = message_payload.get("conversation_id")
                    is_typing = bool(message_payload.get("is_typing", True))
                    try:
                        conversation_uuid = uuid.UUID(conversation_id_raw)
                    except (ValueError, TypeError):
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": "Invalid conversation id.",
                                }
                            )
                        )
                        continue

                    try:
                        await service.ensure_participant(conversation_uuid, user.id)
                    except ConversationAccessForbidden:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": "You are not a member of this conversation.",
                                }
                            )
                        )
                        continue

                    participant_ids = await service.get_participant_ids(conversation_uuid)
                    await manager.broadcast(
                        participant_ids,
                        {
                            "type": "typing",
                            "data": {
                                "conversation_id": str(conversation_uuid),
                                "user_id": str(user.id),
                                "is_typing": is_typing,
                            },
                        },
                    )
                elif event_type == "ack":
                    message_id_raw = message_payload.get("message_id")
                    status_raw = message_payload.get("status")
                    try:
                        message_uuid = uuid.UUID(message_id_raw)
                        status = MessageDeliveryStatus(status_raw)
                    except (ValueError, TypeError):
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "message": "Invalid acknowledgement payload.",
                                }
                            )
                        )
                        continue

                    message = await service.acknowledge_message(
                        message_uuid,
                        user.id,
                        status,
                    )
                    await db.commit()
                    await db.refresh(message, attribute_names=["receipts"])
                    participant_ids = await service.get_participant_ids(message.conversation_id)
                    await manager.broadcast(
                        participant_ids,
                        {
                            "type": "receipt",
                            "data": {
                                "message_ids": [str(message.id)],
                                "status": status.value,
                                "user_id": str(user.id),
                            },
                        },
                    )
                    logger.info(
                        "chat.message.acknowledged",
                        extra={
                            "message_id": str(message.id),
                            "conversation_id": str(message.conversation_id),
                            "user_id": str(user.id),
                            "status": status.value,
                        },
                    )
                else:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "message": "Unsupported event type.",
                            }
                        )
                    )
        except WebSocketDisconnect:
            pass
        finally:
            await manager.disconnect(user.id, websocket)
            last_seen = await manager.get_last_seen(user.id)
            await manager.broadcast(
                contacts,
                {
                    "type": "presence",
                    "data": {
                        "user_id": str(user.id),
                        "status": "offline",
                        "last_seen_at": (last_seen or time_now()).isoformat(),
                    },
                },
            )