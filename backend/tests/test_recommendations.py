import pytest

from backend.app.schemas.recommendation import RecommendationRequest
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.recommendation_engine import recommendation_engine


def test_recommendation_closest():
    # Under normal baseline conditions, the closest restroom should be recommended
    live_state_manager.reset_to_default()
    req = RecommendationRequest(
        current_node_id="section_101",  # at angle 0
        facility_category="restroom",
        accessibility_mode=False,
    )
    res = recommendation_engine.get_recommendations(req)
    assert res.facility_id == "restroom_l1"  # Restroom L1 is near angle 0
    assert "CLOSEST_IS_FASTEST" in res.reason_codes
    assert res.time_saved == 0.0


def test_recommendation_shorter_queue():
    # If Restroom L1 has a high queue (e.g. 15 minutes) and Restroom L2 has a low queue (3 minutes)
    # The engine should recommend L2 for someone near Section 101, even though it's farther, saving time
    live_state_manager.reset_to_default()
    live_state_manager.facility_queues["restroom_l1"] = 15.0
    live_state_manager.facility_queues["restroom_l2"] = 3.0

    req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=False)
    res = recommendation_engine.get_recommendations(req)
    # It should recommend restroom_l2 or another option with shorter total time
    assert res.facility_id != "restroom_l1"
    assert res.time_saved > 0.0
    assert "SHORTER_QUEUE" in res.reason_codes


def test_recommendation_closures():
    # If Restroom L1 is closed, the next best reachable restroom should be recommended
    live_state_manager.reset_to_default()
    live_state_manager.facility_closures.append("restroom_l1")

    req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=False)
    res = recommendation_engine.get_recommendations(req)
    assert res.facility_id != "restroom_l1"
    assert res.facility_id != ""


def test_recommendation_invalid_node():
    # Test invalid current_node_id raises ValueError
    req = RecommendationRequest(current_node_id="non_existent_node_id", facility_category="restroom", accessibility_mode=False)
    with pytest.raises(ValueError):
        recommendation_engine.get_recommendations(req)


def test_recommendation_no_facilities():
    # Test category with no active facilities (e.g. all closed or category empty)
    live_state_manager.reset_to_default()

    # Close all restrooms
    for n_id, node in live_state_manager.nodes.items():
        if node["category"] == "restroom":
            live_state_manager.facility_closures.append(n_id)

    req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=False)
    res = recommendation_engine.get_recommendations(req)
    assert res.recommended_option == "No facilities available"
    assert res.facility_id == ""
    assert "NO_FACILITIES_AVAILABLE" in res.reason_codes


def test_recommendation_accessibility():
    # Test inaccessible facility filtered out in accessibility_mode
    live_state_manager.reset_to_default()

    # Let's make restroom_l1 inaccessible
    live_state_manager.nodes["restroom_l1"]["accessible"] = False

    req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=True)
    res = recommendation_engine.get_recommendations(req)
    # restroom_l1 should be skipped, so it should recommend restroom_l2 or l3
    assert res.facility_id != "restroom_l1"

    # Reset restroom_l1 to accessible
    live_state_manager.nodes["restroom_l1"]["accessible"] = True


def test_recommendation_no_reachable():
    # Test where no facilities are reachable (e.g. disconnect from the graph)
    # We can simulate this by setting all edges to closed
    live_state_manager.reset_to_default()

    original_edges = live_state_manager.edges
    live_state_manager.edges = []

    req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=False)
    try:
        res = recommendation_engine.get_recommendations(req)
        assert res.recommended_option == "No reachable facilities"
        assert "NO_REACHABLE_FACILITIES" in res.reason_codes
    finally:
        live_state_manager.edges = original_edges


def test_recommendation_time_saved_negative():
    # Force time_saved < 0 path
    from unittest.mock import patch

    with patch("backend.app.services.recommendation_engine.sorted") as mock_sorted:
        mock_sorted.side_effect = [
            [{"facility_id": "r1", "name": "R1", "walking_time": 5.0, "queue_time": 5.0, "total_time": 10.0}],  # best_options
            [{"facility_id": "r2", "name": "R2", "walking_time": 1.0, "queue_time": 1.0, "total_time": 2.0}],  # closest_options
        ]
        # This will calculate: closest_opt["total_time"] (2.0) - best_opt["total_time"] (10.0) = -8.0 < 0
        req = RecommendationRequest(current_node_id="section_101", facility_category="restroom", accessibility_mode=False)
        res = recommendation_engine.get_recommendations(req)
        assert res.time_saved == 0.0
