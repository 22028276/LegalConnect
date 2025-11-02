from __future__ import annotations

import logging
import time

import pandas as pd

from fastapi import HTTPException, status

from src.core.base_model import time_now
from src.legal_ai.config import LegalAIConfig
from src.legal_ai.data import (
    build_instruction_examples, 
    clean_dataset, 
    iter_examples, 
    load_dataset
)
from src.legal_ai.knowledge_base import (
    LegalKnowledgeBase, 
    Suggestion
)
from src.legal_ai.llm_client import (
    LLMClient, 
    OpenAICompatibleClient
)
from src.legal_ai.schemas import (
    LegalAIQueryRequest, 
    LegalAIResponse, 
    RelatedQuestion
)

logger = logging.getLogger("legal_ai")


class LegalChatbotService:
    def __init__(
        self,
        *,
        config: LegalAIConfig,
        llm_client: LLMClient | None,
        knowledge_base: LegalKnowledgeBase,
    ) -> None:
        self._config = config
        self._llm_client = llm_client
        self._knowledge_base = knowledge_base

    @property
    def config(self) -> LegalAIConfig:
        return self._config

    @property
    def knowledge_base(self) -> LegalKnowledgeBase:
        return self._knowledge_base

    @classmethod
    def from_settings(cls) -> "LegalChatbotService":
        config = LegalAIConfig.from_settings()
        dataset = clean_dataset(load_dataset(config.dataset_path))
        datasets = [dataset]
        if config.guidance_dataset_path:
            guidance_dataset = clean_dataset(load_dataset(config.guidance_dataset_path))
            datasets.append(guidance_dataset)
        if len(datasets) > 1:
            dataset = clean_dataset(pd.concat(datasets, ignore_index=True))
        knowledge_base = LegalKnowledgeBase(list(iter_examples(dataset)))
        llm_client: LLMClient | None = None
        if config.provider_base_url:
            llm_client = OpenAICompatibleClient(
                base_url=config.provider_base_url,
                api_key=config.api_key,
            )
        return cls(config=config, llm_client=llm_client, knowledge_base=knowledge_base)

    async def answer(self, request: LegalAIQueryRequest) -> LegalAIResponse:
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty.")

        start = time.perf_counter()
        suggestions = self._knowledge_base.suggestions(question, self._config.suggestion_count)
        top_score = self._knowledge_base.best_score(question)
        confidence = max(0.0, min(1.0, top_score))
        asked_at = time_now()

        response_text: str
        is_fallback = confidence < self._config.confidence_threshold

        if is_fallback or not suggestions:
            response_text = self._build_fallback_message(suggestions)
        else:
            response_text = await self._resolve_answer(question, suggestions)

        latency_ms = int((time.perf_counter() - start) * 1000)
        related = [
            RelatedQuestion(question=suggestion.question, score=min(1.0, max(0.0, suggestion.score)))
            for suggestion in suggestions[: self._config.suggestion_count]
        ]

        logger.info(
            "legal_ai.answer",
            extra={
                "question": question,
                "confidence": confidence,
                "is_fallback": is_fallback,
                "latency_ms": latency_ms,
                "model_id": self._config.model_id,
                "suggestion_count": len(related),
                "session_id": str(request.session_id),
            },
        )

        return LegalAIResponse(
            answer=response_text,
            confidence=confidence,
            is_fallback=is_fallback,
            suggestions=related,
            links=[],
            disclaimer=self._config.disclaimer,
            model_id=self._config.model_id,
            model_version=self._config.model_id,
            latency_ms=latency_ms,
            asked_at=asked_at,
        )

    async def _resolve_answer(self, question: str, suggestions: list[Suggestion]) -> str:
        top = suggestions[0]
        if not self._llm_client:
            return top.answer

        prompt_messages = [
            {
                "role": "system",
                "content": (
                    "Bạn là trợ lý pháp lý Việt Nam. Trả lời ngắn gọn, chính xác, trích dẫn nếu có. "
                    "Nếu câu hỏi vượt ngoài phạm vi luật pháp Việt Nam, hãy nói rõ."
                ),
            },
            {
                "role": "system",
                "content": (
                    "Dữ liệu đào tạo tham khảo: "
                    f"Câu hỏi: {top.question}\nTrả lời: {top.answer}"
                ),
            },
            {"role": "user", "content": question},
        ]
        return await self._llm_client.generate(
            messages=prompt_messages,
            model=self._config.model_id,
            temperature=self._config.temperature,
            max_output_tokens=self._config.max_output_tokens,
        )

    def _build_fallback_message(self, suggestions: list[Suggestion]) -> str:
        if not suggestions:
            return (
                "Xin lỗi, tôi chưa có đủ thông tin để trả lời chính xác câu hỏi này. "
                "Vui lòng thử diễn đạt lại hoặc liên hệ luật sư để được hỗ trợ."
            )
        bullets = "\n".join(f"- {suggestion.question}" for suggestion in suggestions)
        return (
            "Xin lỗi, tôi chưa có đủ thông tin để trả lời chính xác câu hỏi này. "
            "Bạn có thể tham khảo các chủ đề liên quan:\n"
            f"{bullets}"
        )

    def export_training_corpus(self) -> list[dict[str, str]]:
        dataset = clean_dataset(load_dataset(self._config.dataset_path))
        return build_instruction_examples(dataset)