from backend.app.schemas.navigation import RouteResponse, RouteStep
from backend.app.schemas.recommendation import AlternativeOption, RecommendationResponse
from backend.app.schemas.stadium import IncidentSchema
from backend.app.services.context_builder import ContextBuilder


def test_build_route_context():
    route_res = RouteResponse(
        path_nodes=["gate_a", "section_101"],
        path_steps=[
            RouteStep(node_id="gate_a", name="Gate A", x=0, y=0, z=0, description="Start"),
            RouteStep(node_id="section_101", name="Section 101", x=10, y=10, z=0, description="End")
        ],
        total_distance=120.0,
        estimated_time=5.0,
        accessible=True,
        crowd_congestion_level=1.2,
        reason_explanation="Text explanation"
    )
    ctx = ContextBuilder.build_route_context(route_res, "Gate A", "Section 101")
    assert "Start: Gate A" in ctx
    assert "Destination: Section 101" in ctx
    assert "Total Distance: 120.0 meters" in ctx
    assert "Accessibility Mode: Enabled" in ctx


def test_build_recommendation_context():
    rec_res = RecommendationResponse(
        facility_id="restroom_l1",
        recommended_option="Restroom L1",
        estimated_total_time=4.5,
        time_saved=2.0,
        reason_codes=["SHORTER_QUEUE"],
        alternatives=[
            AlternativeOption(facility_id="restroom_l2", name="Restroom L2", walking_time=3.0, queue_time=5.0, total_time=8.0, accessible=True)
        ],
        data_timestamp=12345.0,
        confidence=0.9,
        reason_explanation="Explanation"
    )
    ctx = ContextBuilder.build_recommendation_context(rec_res, "restroom")
    assert "Category Requested: restroom" in ctx
    assert "Best Option Recommended: Restroom L1" in ctx
    assert "Restroom L2: Walk 3.0 mins + Queue 5.0 mins = Total 8.0 mins" in ctx


def test_build_operations_context():
    live_state = {
        "active_incidents": [
            IncidentSchema(id="1", title="Crowd buildup", severity="high", zone_id="gate_a", message="Heavy crowd")
        ],
        "gate_security_wait": {
            "gate_a": 5.0,
            "gate_b": 10.0
        },
        "gate_closures": ["gate_a"],
        "facility_closures": ["restroom_l1"],
        "concourse_congestion": {
            "concourse_lower_0": 1.5
        }
    }
    nodes = {
        "gate_a": {"name": "Gate A"},
        "gate_b": {"name": "Gate B"},
        "restroom_l1": {"name": "Restroom L1"},
        "concourse_lower_0": {"name": "Concourse Lower 0"}
    }
    ctx = ContextBuilder.build_operations_context(live_state, nodes)
    assert "[HIGH] Crowd buildup" in ctx
    assert "Gate A: CLOSED" in ctx
    assert "Gate B: 10.0 mins wait" in ctx
    assert "Closed Facilities: Restroom L1" in ctx
    assert "Concourse Lower 0: 1.5x congestion multiplier" in ctx


def test_build_player_context():
    players = [
        {
            "name": "Lionel Messi",
            "team": "Argentina",
            "position": "FW",
            "status": "active",
            "fitness": "fit",
            "rating": 95,
            "stats": {"goals": 3, "assists": 2},
            "radar": {"pace": 85, "shooting": 92}
        }
    ]
    ctx = ContextBuilder.build_player_context(players)
    assert "Lionel Messi" in ctx
    assert "Goals: 3" in ctx
    assert "Pace: 85" in ctx


def test_build_match_context():
    matches = [
        {
            "id": "match_1",
            "home_team": "Spain",
            "away_team": "Argentina",
            "stage": "Final",
            "status": "live",
            "datetime": "2026-07-19T20:00:00Z",
            "home_score": 1,
            "away_score": 1,
            "minute": 45,
            "events": [
                {"time": "23'", "type": "goal", "player": "Messi", "detail": "Penalty"}
            ]
        },
        {
            "id": "bracket_structure"
        }
    ]
    ctx = ContextBuilder.build_match_context(matches)
    assert "Match Spain vs Argentina" in ctx
    assert "Score: 1 - 1" in ctx
    assert "Current Minute: 45'" in ctx
    assert "[23'] Goal by Messi (Penalty)" in ctx
