from backend.app.schemas.stadium import IncidentSchema
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

    # Test Spanish
    exp_es = AIFallbackService.get_route_explanation("Gate A", "Section 101", 120.0, 5.5, 1.2, "es")
    assert "Gate A" in exp_es
    assert "Section 101" in exp_es
    assert "aproximadamente 5.5 minutos" in exp_es


def test_fallback_recommendation_explanation():
    # Closest is fastest (English)
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

    # Closest is fastest (Hindi)
    exp_closest_hi = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L1",
        category="restroom",
        est_time=4.5,
        time_saved=0.0,
        reason_codes=["CLOSEST_IS_FASTEST"],
        closest_name="Restroom L1",
        lang="hi"
    )
    assert "सबसे पास" in exp_closest_hi

    # Closest is fastest (Hinglish)
    exp_closest_hinglish = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L1",
        category="restroom",
        est_time=4.5,
        time_saved=0.0,
        reason_codes=["CLOSEST_IS_FASTEST"],
        closest_name="Restroom L1",
        lang="hinglish"
    )
    assert "sabse paas" in exp_closest_hinglish

    # Closest is fastest (Spanish)
    exp_closest_es = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L1",
        category="restroom",
        est_time=4.5,
        time_saved=0.0,
        reason_codes=["CLOSEST_IS_FASTEST"],
        closest_name="Restroom L1",
        lang="es"
    )
    assert "más cercana y rápida" in exp_closest_es

    # Shorter queue time saved (English)
    exp_saved_en = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=8.5,
        reason_codes=["SHORTER_QUEUE"],
        closest_name="Restroom L1",
        lang="en"
    )
    assert "save you about 8.5 minutes" in exp_saved_en

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

    # Shorter queue time saved (Spanish)
    exp_saved_es = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=8.5,
        reason_codes=["SHORTER_QUEUE"],
        closest_name="Restroom L1",
        lang="es"
    )
    assert "ahorrará aproximadamente 8.5 minutos" in exp_saved_es

    # Default recommendation (English)
    exp_def_en = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=0.0,
        reason_codes=[],
        closest_name="Restroom L1",
        lang="en"
    )
    assert "recommend using Restroom L2" in exp_def_en

    # Default recommendation (Hindi)
    exp_def_hi = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=0.0,
        reason_codes=[],
        closest_name="Restroom L1",
        lang="hi"
    )
    assert "सुझाव दिया है" in exp_def_hi

    # Default recommendation (Hinglish)
    exp_def_hinglish = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=0.0,
        reason_codes=[],
        closest_name="Restroom L1",
        lang="hinglish"
    )
    assert "suggest kiya hai" in exp_def_hinglish

    # Default recommendation (Spanish)
    exp_def_es = AIFallbackService.get_recommendation_explanation(
        recommended_option="Restroom L2",
        category="restroom",
        est_time=6.2,
        time_saved=0.0,
        reason_codes=[],
        closest_name="Restroom L1",
        lang="es"
    )
    assert "Recomendamos usar Restroom L2" in exp_def_es


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

    brief_hi = AIFallbackService.get_operations_brief(live_state, nodes, "hi")
    assert "सामान्य रूप से काम कर रहा है" in brief_hi

    brief_es = AIFallbackService.get_operations_brief(live_state, nodes, "es")
    assert "operando normalmente" in brief_es

    # Test with incidents and closures
    incident = IncidentSchema(id="1", title="Crowd buildup", severity="high", zone_id="gate_a", message="Heavy crowd")
    live_state_inc = {
        "active_incidents": [incident],
        "gate_closures": ["gate_a"]
    }
    brief_inc_en = AIFallbackService.get_operations_brief(live_state_inc, nodes, "en")
    assert "Crowd Closed" not in brief_inc_en
    assert "Gate Closed: Gate A (North) is currently closed" in brief_inc_en

    brief_inc_hi = AIFallbackService.get_operations_brief(live_state_inc, nodes, "hi")
    assert "गेट बंद: Gate A (North) वर्तमान में बंद है" in brief_inc_hi

    brief_inc_hinglish = AIFallbackService.get_operations_brief(live_state_inc, nodes, "hinglish")
    assert "Gate Closed: Gate A (North) abhi closed hai" in brief_inc_hinglish

    brief_inc_es = AIFallbackService.get_operations_brief(live_state_inc, nodes, "es")
    assert "Puerta Cerrada: Gate A (North) está actualmente cerrada" in brief_inc_es


def test_fallback_assistant_answer():
    nodes = {"gate_a": {"name": "Gate A (North)"}}
    live_state = {
        "active_incidents": [],
        "gate_closures": []
    }
    # Restrooms
    assert "Facility Explorer" in AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "en")
    assert "toilet dundh" in AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "hinglish")
    assert "शौचालय" in AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "hi")
    assert "Explorador de Instalaciones" in AIFallbackService.get_assistant_answer("where is the restroom", "gate_a", live_state, nodes, "es")

    # Food
    assert "food concessions" in AIFallbackService.get_assistant_answer("where is food", "gate_a", live_state, nodes, "en")
    assert "food category choose" in AIFallbackService.get_assistant_answer("where is food", "gate_a", live_state, nodes, "hinglish")
    assert "फूड काउंटर" in AIFallbackService.get_assistant_answer("where is food", "gate_a", live_state, nodes, "hi")
    assert "fila más corta" in AIFallbackService.get_assistant_answer("where is food", "gate_a", live_state, nodes, "es")

    # Gates (No closures)
    assert "All entry gates are open" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state, nodes, "en")
    assert "Sabhi entry gates open" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state, nodes, "hinglish")
    assert "सभी प्रवेश द्वार खुले हैं" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state, nodes, "hi")
    assert "Todas las puertas están abiertas" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state, nodes, "es")

    # Gates (With closures)
    live_state_closed = {
        "active_incidents": [],
        "gate_closures": ["gate_a"]
    }
    assert "closed" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state_closed, nodes, "en")
    assert "closed" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state_closed, nodes, "hinglish")
    assert "बंद हैं" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state_closed, nodes, "hi")
    assert "cerradas" in AIFallbackService.get_assistant_answer("gates", "gate_a", live_state_closed, nodes, "es")

    # Default
    assert "Smart Stadium Assistant" in AIFallbackService.get_assistant_answer("hello", "gate_a", live_state, nodes, "en")
    assert "Smart Stadium assistant" in AIFallbackService.get_assistant_answer("hello", "gate_a", live_state, nodes, "hinglish")
    assert "स्मार्ट स्टेडियम सहायक" in AIFallbackService.get_assistant_answer("hello", "gate_a", live_state, nodes, "hi")
    assert "asistente inteligente" in AIFallbackService.get_assistant_answer("hello", "gate_a", live_state, nodes, "es")
