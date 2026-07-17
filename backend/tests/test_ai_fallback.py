import pytest
from backend.app.services.ai_fallback import AIFallbackService

def test_fallback_route_explanation():
    # Test English
    exp_en = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "en")
    assert "Gate A" in exp_en
    assert "Section 101" in exp_en
    assert "120.0" in exp_en
    
    # Test Hinglish
    exp_hi = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "hi")
    assert "Gate A" in exp_hi
    assert "Section 101" in exp_hi
    assert "लगभग 5.5 मिनट" in exp_hi

def test_fallback_recommendation_explanation():
    # Closest is fastest
    exp_closest = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L1",
        category="restroom",
        est_time=4.5,
        time_saved=0.0,
        reason_codes=["CLOSEST_IS_FASTEST"],
        closest_name="Restroom L1",
        lang="en"
    )
    assert "closest and fastest" in exp_closest
    
    # Shorter queue time saved
    exp_saved = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=8.5,
        reason_codes=["SHORTER_QUEUE"],
        closest_name="Restroom L1",
        lang="hinglish"
    )
    assert "Restroom L2" in exp_saved
    assert "8.5 मिनट बचेंगे" in exp_saved

def test_fallback_operations_brief():
    nodes = {"gate_a": {"name": "Gate A (North)"}}
    live_state = {
        "active_incidents": [],
        "gate_closures": []
    }
    brief = AIFallbackService.get_operations_brief(live_state, nodes, "en")
    assert "operating normally" in brief

def test_fallback_assistant_answer():
    nodes = {"gate_a": {"name": "Gate A (North)"}}
    live_state = {
        "active_incidents": [],
        "gate_closures": []
    }
    ans = AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "en")
    assert "Facility Explorer" in ans
