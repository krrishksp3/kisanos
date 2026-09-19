import logging
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import requests
from app.core.config import settings

logger = logging.getLogger("kisanos.llm_provider")


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider is properly configured with an API key."""
        pass

    @abstractmethod
    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Generates text from the LLM or returns None on failure / unavailability."""
        pass


class GeminiLLMProvider(BaseLLMProvider):
    """
    Google Gemini API provider implementation.
    Grounded via system instructions and farm context.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.LLM_API_KEY or settings.GEMINI_API_KEY
        self.model = model or settings.LLM_MODEL

    @property
    def name(self) -> str:
        return "gemini"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if not self.is_available():
            logger.info("Gemini LLM Provider is not available (no API key configured).")
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"[System Instructions: {system_instruction}]"}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "Understood. I will strictly follow all agronomic and grounding instructions."}]
            })

        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
            }
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to deterministic agronomy.")

        return None


class DeterministicFallbackProvider(BaseLLMProvider):
    """
    Deterministic rule-based agricultural provider.
    Used when no external LLM API key is configured or when offline.
    """

    @property
    def name(self) -> str:
        return "deterministic_rule_based"

    def is_available(self) -> bool:
        return True

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        # Returns None to trigger the deterministic agronomy synthesis pipeline
        return None


def get_llm_provider() -> BaseLLMProvider:
    """Factory to retrieve the active LLM provider based on environment settings."""
    provider_name = (settings.LLM_PROVIDER or settings.AI_PROVIDER or "").lower().strip()
    api_key = settings.LLM_API_KEY or settings.GEMINI_API_KEY

    if provider_name in ["gemini", "google"] and api_key:
        return GeminiLLMProvider(api_key=api_key, model=settings.LLM_MODEL)

    return DeterministicFallbackProvider()
