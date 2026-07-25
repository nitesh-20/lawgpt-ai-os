from fastapi import APIRouter

from app.api.v1.agents import router as agents_router
from app.api.v1.chat import router as chat_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.documents import router as docs_router
from app.api.v1.draft import router as draft_router
from app.api.v1.health import router as health_router
from app.api.v1.research import router as research_router
from app.api.v1.voice import router as voice_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.orchestrator import router as orchestrator_router

api_router = APIRouter()

# Register core health endpoints
api_router.include_router(health_router, tags=["System Health"])

# Register agent info endpoints
api_router.include_router(agents_router, tags=["Agents"])

# Register modular operations
api_router.include_router(chat_router, tags=["Chat Interface"])
api_router.include_router(docs_router, tags=["Document Operations"])
api_router.include_router(research_router, tags=["Legal Research"])
api_router.include_router(compliance_router, tags=["Regulatory Compliance"])
api_router.include_router(draft_router, tags=["Contract Drafting"])
api_router.include_router(voice_router, tags=["Voice Interface"])
api_router.include_router(knowledge_router, tags=["Knowledge Base Ingestion"])
api_router.include_router(orchestrator_router, tags=["Orchestrator Agent"])

