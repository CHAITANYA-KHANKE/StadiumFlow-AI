import pytest
from backend.app.services.ai_fallback import AIFallbackService

def test_fallback_route_explanation():
    # Test English
    exp_en = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "en")
    assert "Gate A" in exp_en
    assert "Section 101" in exp_en
    assert "120.0" in exp_en
    
    # Test Hindi (Devanagari)
    exp_hi = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "hi")
    assert "Gate A" in exp_hi
    assert "Section 101" in exp_hi
    assert "लगभग 5.5 मिनट" in exp_hi

    # Test Hinglish (Latin script)
    exp_hinglish = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "hinglish")
    assert "Gate A" in exp_hinglish
    assert "Section 101" in exp_hinglish
    assert "5.5 minutes" in exp_hinglish

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
    
    # Shorter queue time saved (Hindi)
    exp_saved_hi = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=8.5,
        reason_codes=["SHORTER_QUEUE"],
        closest_name="Restroom L1",
        lang="hi"
    )
    assert "Restroom L2" in exp_saved_hi
    assert "8.5 मिनट बचेंगे" in exp_saved_hi

    # Shorter queue time saved (Hinglish)
    exp_saved_hinglish = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=8.5,
        reason_codes=["SHORTER_QUEUE"],
        closest_name="Restroom L1",
        lang="hinglish"
    )
    assert "Restroom L2" in exp_saved_hinglish
    assert "8.5 minutes bachenge" in exp_saved_hinglish

def test_fallback_operations_brief():
    nodes = {"gate_a": {"name": "Gate A (North)"}}
    live_state = {
        "active_incidents": [],
        "gate_closures": []
    }
    brief = AIFallbackService.get_operations_brief(live_state, nodes, "en")
    assert "operating normally" in brief

    brief_hinglish = AIFallbackService.get_operations_brief(live_state, nodes, "hinglish")
    assert "Stadium abhi normal" in brief_hinglish

def test_fallback_assistant_answer():
    nodes = {"gate_a": {"name": "Gate A (North)"}}
    live_state = {
        "active_incidents": [],
        "gate_closures": []
    }
    ans = AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "en")
    assert "Facility Explorer" in ans

    ans_hinglish = AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "hinglish")
    assert "toilet dundh" in ans_hinglish
