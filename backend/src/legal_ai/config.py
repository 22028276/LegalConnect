from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from src.core.config import settings


@dataclass(slots=True)
class LegalAIConfig:
    dataset_path: Path
    model_id: str
    provider_base_url: str | None
    api_key: str | None
    temperature: float
    max_output_tokens: int
    confidence_threshold: float
    suggestion_count: int
    disclaimer: str
    log_sample_rate: float
    guidance_dataset_path: Path | None

    @classmethod
    def from_settings(cls) -> "LegalAIConfig":
        return cls(
            dataset_path=Path(settings.LEGAL_AI_DATASET_PATH),
            model_id=settings.LEGAL_AI_MODEL_ID,
            provider_base_url=settings.LEGAL_AI_PROVIDER_BASE_URL,
            api_key=settings.LEGAL_AI_API_KEY,
            temperature=settings.LEGAL_AI_TEMPERATURE,
            max_output_tokens=settings.LEGAL_AI_MAX_OUTPUT_TOKENS,
            confidence_threshold=settings.LEGAL_AI_CONFIDENCE_THRESHOLD,
            suggestion_count=settings.LEGAL_AI_SUGGESTION_COUNT,
            disclaimer=settings.LEGAL_AI_DISCLAIMER,
            log_sample_rate=settings.LEGAL_AI_LOG_SAMPLE_RATE,
            guidance_dataset_path=(
                    Path(settings.LEGAL_AI_GUIDANCE_DATASET_PATH)
                    if settings.LEGAL_AI_GUIDANCE_DATASET_PATH
                    else None
                ),
            )