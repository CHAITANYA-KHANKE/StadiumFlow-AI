from fastapi import APIRouter, HTTPException, Depends

from backend.app.schemas.simulation import ScenarioTriggerRequest, SimulationImpactResponse
from backend.app.services.simulation_engine import simulation_engine
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.context_builder import ContextBuilder
from backend.app.services.ai_service import ai_service
from backend.app.core.security import verify_admin_token

router = APIRouter()

@router.post("/api/simulation/scenario", response_model=SimulationImpactResponse)
def trigger_scenario(request: ScenarioTriggerRequest, admin_token: str = Depends(verify_admin_token)):
    """
    Trigger a 'What-If' incident scenario to simulate stadium network adjustments.
    Requires a valid operator admin token.
    Renders live impact reports and updates routing parameters.
    """
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
def reset_simulation(admin_token: str = Depends(verify_admin_token)):
    """
    Reset all active incident simulations and restore stadium state parameters to default.
    Requires a valid operator admin token.
    """
    msg = simulation_engine.reset_simulation()
    return {"message": msg}
