import os
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional

from backend.app.schemas.simulation import ScenarioTriggerRequest, SimulationImpactResponse
from backend.app.services.simulation_engine import simulation_engine
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.context_builder import ContextBuilder
from backend.app.services.ai_service import ai_service

router = APIRouter()

def verify_admin_token(x_admin_token: Optional[str] = Header(None)):
    expected_token = os.getenv("ADMIN_SECRET_KEY", "stadiumflow-admin-secret-token")
    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=401, 
            detail="Unauthorized operator token. X-Admin-Token header missing or incorrect."
        )

@router.post("/api/simulation/scenario", response_model=SimulationImpactResponse)
def trigger_scenario(request: ScenarioTriggerRequest, x_admin_token: Optional[str] = Header(None)):
    verify_admin_token(x_admin_token)
    try:
        res = simulation_engine.trigger_scenario(request.scenario_id)
        
        # Ground simulation briefing using AI service
        live_state = live_state_manager.get_live_state()
        context_str = ContextBuilder.build_operations_context(live_state, live_state_manager.nodes)
        
        ai_brief = ai_service.explain_operations_brief(
            context_str=context_str,
            live_state=live_state,
            nodes=live_state_manager.nodes,
            lang="en"
        )
        res.ai_impact_summary = ai_brief
        
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/api/simulation/reset")
def reset_simulation(x_admin_token: Optional[str] = Header(None)):
    verify_admin_token(x_admin_token)
    msg = simulation_engine.reset_simulation()
    return {"message": msg}
