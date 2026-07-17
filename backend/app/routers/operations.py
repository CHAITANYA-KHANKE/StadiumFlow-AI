import time
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from backend.app.core.security import verify_admin_token
from backend.app.services.ai_service import ai_service
from backend.app.services.context_builder import ContextBuilder
from backend.app.services.live_state_manager import live_state_manager

router = APIRouter()

cached_ops_summary = None
cached_ops_scenario_id = None
cached_ops_last_updated = None

@router.get("/api/operations/summary")
def get_operations_summary(admin_token: str = Depends(verify_admin_token)):
    """
    Retrieve the real-time AI summary overview of stadium operations.
    Requires a valid operator admin token.
    Uses dynamic caching to prevent redundant Gemini API calls.
    """
    global cached_ops_summary, cached_ops_scenario_id, cached_ops_last_updated
    try:
        live_state = live_state_manager.get_live_state()
        scenario_id = live_state_manager.current_scenario_id
        last_updated = live_state_manager.last_updated

        # Check if cache is still valid
        if cached_ops_summary is not None and cached_ops_scenario_id == scenario_id and cached_ops_last_updated == last_updated:
            return {
                "summary": cached_ops_summary,
                "timestamp": time.time(),
                "cached": True
            }

        context_str = ContextBuilder.build_operations_context(live_state, live_state_manager.nodes)

        brief = ai_service.explain_operations_brief(
            context_str=context_str,
            live_state=live_state,
            nodes=live_state_manager.nodes,
            lang="en"
        )

        # Save to cache
        cached_ops_summary = brief
        cached_ops_scenario_id = scenario_id
        cached_ops_last_updated = last_updated

        return {
            "summary": brief,
            "timestamp": time.time(),
            "cached": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/api/assistant")
def chat_assistant(request: Dict[str, Any]):
    """
    Multilingual conversational assistant for spectators.
    Answers route, match, player, and general stadium questions using grounded context.
    """
    query = request.get("query", "")
    current_node = request.get("current_node_id", "gate_a")
    lang = request.get("language", "en")

    if not query:
        raise HTTPException(status_code=400, detail="Query string is required")

    # Build context
    live_state = live_state_manager.get_live_state()
    context_str = ContextBuilder.build_operations_context(live_state, live_state_manager.nodes)

    answer = ai_service.answer_assistant_query(
        query=query,
        context_str=context_str,
        current_node=current_node,
        live_state=live_state,
        nodes=live_state_manager.nodes,
        lang=lang
    )

    return {
        "query": query,
        "answer": answer,
        "timestamp": time.time()
    }
