import time
from pathlib import Path
from typing import Any, Dict
from loguru import logger

from app.agents.base import BaseAgent

# Sub-components imports
from app.agents.voice_agent.recognizer import SpeechRecognizer
from app.agents.voice_agent.synthesizer import SpeechSynthesizer
from app.agents.voice_agent.detector import LanguageDetector
from app.agents.voice_agent.translation import TranslationService
from app.agents.voice_agent.session import VoiceSessionManager
from app.agents.voice_agent.processor import AudioProcessor


class VoiceAgent(BaseAgent):
    """
    Voice Agent coordinates Speech-to-Text transcription, language translation,
    agent orchestration, and Text-to-Speech synthesis for legal voice actions.
    """
    def __init__(self) -> None:
        self._initialized = False
        self.recognizer = SpeechRecognizer()
        self.synthesizer = SpeechSynthesizer()
        self.detector = LanguageDetector()
        self.translation_service = TranslationService()
        self.session_manager = VoiceSessionManager()
        self.processor = AudioProcessor()
        
        self.history_file = Path("/Users/niteshsahu/Desktop/lawgpt-ai-os/backend/data/voice_history.json")
        self.collection_name = "voice_history"

    @property
    def metadata(self) -> dict[str, Any]:
        return {
            "id": "voice_agent",
            "name": "Sarvam Voice Agent",
            "description": "Enables multilingual voice interaction with LawGPT AI OS via Sarvam AI.",
            "supported_intents": ["voice_query", "voice_chat"],
            "priority": 3,
            "health": "healthy" if self._initialized else "uninitialized",
            "version": "1.1.0",
            "capabilities": [
                "Multilingual Speech-to-Text (Saaras v3)",
                "Natural Text-to-Speech (Bulbul v3)",
                "Indic Language Translation (Sarvam Translate)",
                "Fast local Unicode language detection",
                "Concurrent voice session recovery",
                "Observability latency logging"
            ]
        }

    async def initialize(self) -> None:
        logger.info("Initializing Sarvam Voice Agent...")
        self._initialized = True
        logger.info("Sarvam Voice Agent initialized successfully.")

    async def execute(self, task_input: dict[str, Any]) -> dict[str, Any]:
        """
        Coordinates the complete voice query processing flow.
        Supported actions:
        - 'chat': End-to-end voice query pipeline
        - 'transcribe': Raw audio transcription
        - 'synthesize': Raw text to voice synthesis
        """
        if not self._initialized:
            raise RuntimeError("Voice Agent is not initialized.")

        action = task_input.get("action", "chat").lower()
        logger.info(f"Voice Agent executing action '{action}'")

        try:
            if action == "transcribe":
                return await self._handle_transcribe(task_input)
            elif action == "synthesize":
                return await self._handle_synthesize(task_input)
            elif action == "chat":
                return await self._handle_chat(task_input)
            else:
                return {
                    "status": "error",
                    "message": f"Unsupported voice action: '{action}'",
                    "agent": "VoiceAgent",
                    "data": {}
                }
        except Exception as e:
            logger.exception(f"Voice Agent failed during action '{action}'")
            return {
                "status": "error",
                "message": f"Voice action failed: {e}",
                "agent": "VoiceAgent",
                "data": {}
            }

    async def _handle_transcribe(self, task_input: dict[str, Any]) -> dict[str, Any]:
        audio_bytes = task_input.get("audio_bytes", b"")
        filename = task_input.get("filename", "audio.wav")
        lang = task_input.get("language_code", "en-IN")

        if not self.processor.validate_audio(audio_bytes):
            raise ValueError("Invalid or empty audio payload.")

        # Speech to text
        res = await self.recognizer.transcribe(audio_bytes, filename, lang)
        detected_lang = self.detector.detect_language(res["transcript"])
        
        return {
            "transcript": res["transcript"],
            "detected_language": detected_lang,
            "confidence": res["confidence"]
        }

    async def _handle_synthesize(self, task_input: dict[str, Any]) -> dict[str, Any]:
        text = task_input.get("text", "")
        lang = task_input.get("language_code", "en-IN")
        speaker = task_input.get("speaker", "shubh")

        if not text:
            raise ValueError("No text provided for synthesis.")

        res = await self.synthesizer.synthesize(text, lang, speaker)
        return {
            "audio": res["audio"],
            "language": lang
        }

    async def _handle_chat(self, task_input: dict[str, Any]) -> dict[str, Any]:
        audio_bytes = task_input.get("audio_bytes", b"")
        session_id = task_input.get("session_id", "default_voice_session")
        language_code = task_input.get("language_code")
        orchestrator = task_input.get("orchestrator")

        if not audio_bytes:
            raise ValueError("No audio payload was provided for voice chat.")

        # 1. Audio check
        audio_meta = self.processor.extract_metadata(audio_bytes)
        
        # 2. Speech recognition (STT)
        stt_start = time.time()
        stt_res = await self.recognizer.transcribe(
            audio_bytes=audio_bytes,
            language_code=language_code or "en-IN"
        )
        stt_latency = round(time.time() - stt_start, 3)

        transcript = stt_res["transcript"]
        
        # 3. Language detection
        detected_lang = language_code or self.detector.detect_language(transcript)

        # 4. Translation to English if needed
        translate_in_latency = 0.0
        query_text_en = transcript
        if not detected_lang.startswith("en"):
            trans_start = time.time()
            trans_res = await self.translation_service.translate(
                text=transcript,
                source_language_code=detected_lang,
                target_language_code="en-IN"
            )
            query_text_en = trans_res["translated_text"]
            translate_in_latency = round(time.time() - trans_start, 3)

        # Update Session history (User message)
        await self.session_manager.get_or_create_session(session_id, detected_lang)
        await self.session_manager.add_history(session_id, "user", transcript)

        # 5. Core Orchestrator execution
        llm_latency = 0.0
        response_text_en = "Sorry, I could not process your query."
        citations = []
        context = []

        if orchestrator is not None:
            llm_start = time.time()
            # Execute standard English query
            orch_res = await orchestrator.execute({
                "message": query_text_en,
                "session_id": session_id
            })
            llm_latency = round(time.time() - llm_start, 3)

            if orch_res.get("status") == "success":
                response_text_en = orch_res.get("message", "")
                citations = orch_res.get("citations", [])
                context = orch_res.get("context", [])
        else:
            logger.warning("No orchestrator was provided in task input. Bypassing LLM execution.")
            response_text_en = f"Received text query: {query_text_en}. (Orchestrator not connected)"

        # 6. Translate response back to user's native language if needed
        translate_out_latency = 0.0
        response_text_native = response_text_en
        if not detected_lang.startswith("en"):
            trans_start = time.time()
            trans_res = await self.translation_service.translate(
                text=response_text_en,
                source_language_code="en-IN",
                target_language_code=detected_lang
            )
            response_text_native = trans_res["translated_text"]
            translate_out_latency = round(time.time() - trans_start, 3)

        # 7. Text to Speech Synthesis (TTS)
        tts_start = time.time()
        tts_res = await self.synthesizer.synthesize(
            text=response_text_native,
            target_language_code=detected_lang
        )
        tts_latency = round(time.time() - tts_start, 3)

        audio_b64 = tts_res["audio"]

        # Update Session history (Assistant message)
        await self.session_manager.add_history(session_id, "assistant", response_text_native, audio_b64)

        # Observability Metrics
        metrics = {
            "stt_latency_sec": stt_latency,
            "stt_confidence": stt_res["confidence"],
            "translation_input_latency_sec": translate_in_latency,
            "llm_latency_sec": llm_latency,
            "translation_output_latency_sec": translate_out_latency,
            "tts_latency_sec": tts_latency,
            "total_latency_sec": round(stt_latency + translate_in_latency + llm_latency + translate_out_latency + tts_latency, 3),
            "detected_language": detected_lang,
            "audio_duration_sec": audio_meta["duration_sec"]
        }

        result = {
            "transcript": transcript,
            "detected_language": detected_lang,
            "response_text": response_text_native,
            "response_audio": audio_b64,
            "citations": citations,
            "context": context,
            "metrics": metrics
        }

        return result

    async def shutdown(self) -> None:
        logger.info("Shutting down Sarvam Voice Agent...")
        self._initialized = False
        logger.info("Sarvam Voice Agent shut down.")

    async def health(self) -> dict[str, Any]:
        return {
            "status": "healthy" if self._initialized else "uninitialized",
            "agent": "VoiceAgent",
            "metadata": self.metadata
        }
