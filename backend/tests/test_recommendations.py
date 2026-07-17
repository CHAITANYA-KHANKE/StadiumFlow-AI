import pytest
from backend.app.services.recommendation_engine import recommendation_engine
from backend.app.services.live_state_manager import live_state_manager
from backend.app.schemas.recommendation import RecommendationRequest

def test_recommendation_closest():
    # Under normal baseline conditions, the closest restroom should be recommended
    live_state_manager.reset_to_default()
    req = RecommendationRequest(
        current_node_id="section_101", # at angle 0
        facility_category="restroom",
        accessibility_mode=False
    )
    res = recommendation_engine.get_recommendations(req)
    assert res.facility_id == "restroom_l1" # Restroom L1 is near angle 0
    assert "CLOSEST_IS_FASTEST" in res.reason_codes
    assert res.time_saved == 0.0

def test_recommendation_shorter_queue():
    # If Restroom L1 has a high queue (e.g. 15 minutes) and Restroom L2 has a low queue (3 minutes)
    # The engine should recommend L2 for someone near Section 101, even though it's farther, saving time
    live_state_manager.reset_to_default()
    live_state_manager.facility_queues["restroom_l1"] = 15.0
    live_state_manager.facility_queues["restroom_l2"] = 3.0
    
    req = RecommendationRequest(
        current_node_id="section_101",
        facility_category="restroom",
        accessibility_mode=False
    )
    res = recommendation_engine.get_recommendations(req)
    # It should recommend restroom_l2 or another option with shorter total time
    assert res.facility_id != "restroom_l1"
    assert res.time_saved > 0.0
    assert "SHORTER_QUEUE" in res.reason_codes

def test_recommendation_closures():
    # If Restroom L1 is closed, the next best reachable restroom should be recommended
    live_state_manager.reset_to_default()
    live_state_manager.facility_closures.append("restroom_l1")
    
    req = RecommendationRequest(
        current_node_id="section_101",
        facility_category="restroom",
        accessibility_mode=False
    )
    res = recommendation_engine.get_recommendations(req)
    assert res.facility_id != "restroom_l1"
    assert res.facility_id != ""
