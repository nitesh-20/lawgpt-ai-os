import json
from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agents.research_agent.research_agent import ResearchAgent

router = APIRouter()
research_agent = ResearchAgent()


class ResearchFilters(BaseModel):
    document_id: str | None = None
    category: str | None = None
    act_type: str | None = None
    jurisdiction: str | None = None
    language: str | None = None


class ResearchQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    session_id: str = "default_session"
    filters: ResearchFilters | None = None


async def get_agent() -> ResearchAgent:
    if not research_agent._initialized:
        await research_agent.initialize()
    return research_agent


@router.post("/research/query", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
async def query_research(payload: ResearchQueryRequest):
    """
    Submits a query to the Legal Research Agent to find case laws, statutes, and citations.
    """
    agent = await get_agent()
    try:
        filters_dict = payload.filters.model_dump(exclude_none=True) if payload.filters else None
        task_input = {
            "query": payload.query,
            "session_id": payload.session_id,
            "filters": filters_dict,
        }
        res = await agent.execute(task_input)
        if res.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=res.get("message", "Error executing research query."),
            )
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error executing research query: {e}",
        )


@router.get("/research/history", response_model=list[dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_history():
    """
    Retrieves the legal research query and response history log.
    """
    agent = await get_agent()
    try:
        history_file = agent.history_file
        if history_file.exists():
            with open(history_file, "r") as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve research history: {e}",
        )


@router.get("/research/statistics", response_model=dict[str, Any], status_code=status.HTTP_200_OK)
async def get_statistics():
    """
    Aggregates metrics and returns research usage statistics.
    """
    agent = await get_agent()
    try:
        history_file = agent.history_file
        history = []
        if history_file.exists():
            with open(history_file, "r") as f:
                history = json.load(f)

        if not history:
            return {
                "total_queries": 0,
                "average_confidence": 0.0,
                "average_execution_time_sec": 0.0,
                "most_queried_acts": [],
                "most_queried_sections": [],
            }

        total_queries = len(history)
        total_confidence = 0.0
        total_time = 0.0

        act_counts = {}
        section_counts = {}

        for item in history:
            metrics = item.get("metrics", {})
            total_confidence += metrics.get("confidence_score", 0.0)
            total_time += metrics.get("execution_time_sec", 0.0)

            result = item.get("result", {})
            for act in result.get("Related Acts", []):
                act_counts[act] = act_counts.get(act, 0) + 1
            for sec in result.get("Relevant Sections", []):
                section_counts[sec] = section_counts.get(sec, 0) + 1

        most_queried_acts = sorted(act_counts.items(), key=lambda x: x[1], reverse=True)
        most_queried_sections = sorted(section_counts.items(), key=lambda x: x[1], reverse=True)

        return {
            "total_queries": total_queries,
            "average_confidence": round(total_confidence / total_queries, 3),
            "average_execution_time_sec": round(total_time / total_queries, 3),
            "most_queried_acts": [{"act": act, "count": count} for act, count in most_queried_acts[:5]],
            "most_queried_sections": [{"section": sec, "count": count} for sec, count in most_queried_sections[:5]],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile research statistics: {e}",
        )


@router.post("/research", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def research_endpoint():
    """
    Placeholder endpoint for legal research queries.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Legal research functionality is not implemented yet.",
    )
