import time
import re
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

# Import Config, Schemas and Services
from backend.app.core.config import settings
from backend.app.schemas.stadium import StadiumSchema, LiveStateSchema, FeedbackSchema, NodeSchema, EdgeSchema
from backend.app.schemas.navigation import RouteRequest, RouteResponse, TimelineRequest, TimelineResponse
from backend.app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from backend.app.schemas.simulation import ScenarioTriggerRequest, SimulationImpactResponse

from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.routing_engine import routing_engine
from backend.app.services.recommendation_engine import recommendation_engine
from backend.app.services.timeline_engine import timeline_engine
from backend.app.services.simulation_engine import simulation_engine
from backend.app.services.context_builder import ContextBuilder
from backend.app.services.ai_service import ai_service

app = FastAPI(
    title="StadiumFlow AI",
    description="Real-Time Decision Intelligence API for Smart Stadiums & Tournament Experiences",
    version="1.0.0"
)

# CORS Setup
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware for Security Headers, Payload Size Checks & Basic Rate Limiting
# Simple in-memory rate limiting dictionary: IP -> [timestamps]
rate_limit_db: Dict[str, List[float]] = {}

@app.middleware("http")
async def add_security_headers_and_rate_limit(request: Request, call_next):
    # 1. Payload Size Check (Max 1MB)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1 * 1024 * 1024:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": "Payload too large. Maximum allowed size is 1MB."}
                )
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid content-length header."}
            )

    # 2. Rate Limiting Check (Max 100 requests per minute per IP)
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Clean old timestamps
    if client_ip in rate_limit_db:
        rate_limit_db[client_ip] = [t for t in rate_limit_db[client_ip] if current_time - t < 60]
    else:
        rate_limit_db[client_ip] = []
        
    if len(rate_limit_db[client_ip]) >= 100: # 100 requests/min
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
        
    rate_limit_db[client_ip].append(current_time)

    # Proceed with request
    response = await call_next(request)
    
    # 3. Security Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self';"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response

# Cached static stadium topology
cached_stadium_schema: Optional[StadiumSchema] = None

# API ENDPOINTS

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "gemini_api_active": ai_service.initialized
    }

@app.get("/api/stadium", response_model=StadiumSchema)
def get_stadium_topology():
    global cached_stadium_schema
    if cached_stadium_schema is None:
        cached_stadium_schema = StadiumSchema(
            nodes=[NodeSchema(**n) for n in live_state_manager.nodes.values()],
            edges=[EdgeSchema(**e) for e in live_state_manager.edges]
        )
    return cached_stadium_schema

@app.get("/api/live-state", response_model=LiveStateSchema)
def get_live_state():
    return LiveStateSchema(**live_state_manager.get_live_state())

NODE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_]{1,50}$")

@app.post("/api/route", response_model=RouteResponse)
def get_route(request: RouteRequest):
    if not NODE_ID_REGEX.match(request.start_node_id) or not NODE_ID_REGEX.match(request.end_node_id):
        raise HTTPException(status_code=400, detail="Invalid node ID pattern. Node IDs must be alphanumeric and under 50 characters.")
    try:
        res = routing_engine.calculate_route(request)
        
        # Ground explanation using AI service
        if res.path_nodes:
            start_node = live_state_manager.nodes[request.start_node_id]
            end_node = live_state_manager.nodes[request.end_node_id]
            context_str = ContextBuilder.build_route_context(res, start_node["name"], end_node["name"])
            
            # Ground with Gemini
            ai_exp = ai_service.explain_route(
                context_str=context_str,
                start_name=start_node["name"],
                end_name=end_node["name"],
                total_dist=res.total_distance,
                est_time=res.estimated_time,
                avg_cong=res.crowd_congestion_level,
                lang="en" # default lang
            )
            res.reason_explanation = ai_exp
            
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/recommend-facility", response_model=RecommendationResponse)
def get_facility_recommendation(request: RecommendationRequest):
    if not NODE_ID_REGEX.match(request.current_node_id):
        raise HTTPException(status_code=400, detail="Invalid node ID pattern. Node IDs must be alphanumeric and under 50 characters.")
    if request.facility_category not in ["restroom", "food", "medical", "info"]:
        raise HTTPException(status_code=400, detail="Invalid facility category.")
    try:
        res = recommendation_engine.get_recommendations(request)
        
        # Ground explanation using AI service if reachable option exists
        if res.facility_id:
            context_str = ContextBuilder.build_recommendation_context(res, request.facility_category)
            closest_name = ""
            for node_id, node in live_state_manager.nodes.items():
                if node["category"] == request.facility_category and node_id not in live_state_manager.facility_closures:
                    closest_name = node["name"]
                    break
                    
            ai_exp = ai_service.explain_recommendation(
                context_str=context_str,
                recommended_option=res.recommended_option,
                category=request.facility_category,
                est_time=res.estimated_total_time,
                time_saved=res.time_saved,
                reason_codes=res.reason_codes,
                closest_name=closest_name,
                lang="en"
            )
            res.reason_explanation = ai_exp
            
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/timeline", response_model=TimelineResponse)
def get_timeline(request: TimelineRequest):
    try:
        return timeline_engine.generate_timeline(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/assistant")
def chat_assistant(request: Dict[str, Any]):
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

cached_ops_summary = None
cached_ops_scenario_id = None
cached_ops_last_updated = None

@app.get("/api/operations/summary")
def get_operations_summary():
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

@app.post("/api/simulation/scenario", response_model=SimulationImpactResponse)
def trigger_scenario(request: ScenarioTriggerRequest):
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

@app.post("/api/simulation/reset")
def reset_simulation():
    msg = simulation_engine.reset_simulation()
    return {"message": msg}

# Prototype feedback collection
feedbacks_db: List[Dict[str, Any]] = []

@app.post("/api/feedback")
def submit_feedback(request: FeedbackSchema):
    feedbacks_db.append({
        "location_id": request.location_id,
        "helpful": request.helpful,
        "comment": request.comment,
        "timestamp": time.time()
    })
    return {"status": "success", "message": "Feedback submitted successfully."}

@app.get("/api/feedback")
def get_all_feedbacks():
    return feedbacks_db

@app.get("/api/matches")
def get_all_matches():
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "matches.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/players")
def get_all_players():
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "players.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
