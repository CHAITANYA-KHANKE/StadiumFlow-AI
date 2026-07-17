import os
import re
import json
from fastapi import APIRouter, HTTPException
from typing import Optional

from backend.app.schemas.stadium import StadiumSchema, LiveStateSchema, NodeSchema, EdgeSchema
from backend.app.schemas.navigation import RouteRequest, RouteResponse, TimelineRequest, TimelineResponse
from backend.app.schemas.recommendation import RecommendationRequest, RecommendationResponse

from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.routing_engine import routing_engine
from backend.app.services.recommendation_engine import recommendation_engine
from backend.app.services.timeline_engine import timeline_engine
from backend.app.services.context_builder import ContextBuilder
from backend.app.services.ai_service import ai_service

router = APIRouter()

cached_stadium_schema: Optional[StadiumSchema] = None
NODE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_]{1,50}$")

@router.get("/api/stadium", response_model=StadiumSchema)
def get_stadium_topology():
    """
    Retrieve the static topology (nodes and edges) representing the World Cup stadium graph.
    Caches the schema in memory to optimize load times.
    """
    global cached_stadium_schema
    if cached_stadium_schema is None:
        cached_stadium_schema = StadiumSchema(
            nodes=[NodeSchema(**n) for n in live_state_manager.nodes.values()],
            edges=[EdgeSchema(**e) for e in live_state_manager.edges]
        )
    return cached_stadium_schema

@router.get("/api/live-state", response_model=LiveStateSchema)
def get_live_state():
    """
    Retrieve the real-time queue times, gate/facility closures, concourse congestions, and active alerts.
    """
    return LiveStateSchema(**live_state_manager.get_live_state())

@router.post("/api/route", response_model=RouteResponse)
def get_route(request: RouteRequest):
    """
    Calculate the optimal pedestrian routing path between two stadium nodes.
    Supports accessibility parameters to bypass staircases/escalators.
    """
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
                lang="en"
            )
            res.reason_explanation = ai_exp
            
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/api/recommend-facility", response_model=RecommendationResponse)
def get_facility_recommendation(request: RecommendationRequest):
    """
    Query the queue-aware recommendation engine for the fastest available restroom, food counter, or information stall.
    Solves for shortest combined walking distance and live queue delay.
    """
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

@router.post("/api/timeline", response_model=TimelineResponse)
def get_timeline(request: TimelineRequest):
    """
    Generate a personalized event day spectator itinerary timeline based on ticket seat and arrival gate parameters.
    """
    try:
        return timeline_engine.generate_timeline(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/api/matches")
def get_all_matches():
    """
    Fetch the list of FIFA World Cup tournament match results, upcoming fixtures, and knockout bracket state.
    """
    try:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "matches.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/players")
def get_all_players():
    """
    Fetch all team squad lists, individual player profiles, and tournament statistics.
    """
    try:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
