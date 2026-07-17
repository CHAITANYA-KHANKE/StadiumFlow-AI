from unittest.mock import MagicMock, patch

from backend.app.services.ai_service import AIService


def test_ai_service_uninitialized():
    service = AIService()
    service.initialized = False

    # Should fall back to AIFallbackService
    exp_route = service.explain_route("context", "Gate A", "Section 101", 100.0, 5.0, 1.0, "en")
    assert "Gate A" in exp_route

    exp_rec = service.explain_recommendation("context", "Restroom L1", "restroom", 5.0, 0.0, ["CLOSEST_IS_FASTEST"], "Restroom L1", "en")
    assert "Restroom L1" in exp_rec

    exp_brief = service.explain_operations_brief("context", {}, {}, "en")
    assert "operating normally" in exp_brief

    exp_ans = service.answer_assistant_query("where is the restroom", "context", "gate_a", {}, {}, "en")
    assert "Facility Explorer" in exp_ans


def test_ai_service_initialized_success():
    service = AIService()
    service.initialized = True

    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "AI Response Text"
    mock_model.generate_content.return_value = mock_response
    service.model = mock_model

    # Check generate_ai_response directly
    res = service.generate_ai_response("system", "prompt")
    assert res == "AI Response Text"

    # Test explain_route in different languages
    for lang in ["hi", "hinglish", "es", "en"]:
        res_route = service.explain_route("context", "Gate A", "Section 101", 100.0, 5.0, 1.0, lang)
        assert res_route == "AI Response Text"

    # Test explain_recommendation in different languages
    for lang in ["hi", "hinglish", "es", "en"]:
        res_rec = service.explain_recommendation("context", "Restroom L1", "restroom", 5.0, 0.0, ["CLOSEST_IS_FASTEST"], "Restroom L1", lang)
        assert res_rec == "AI Response Text"

    # Test explain_operations_brief in different languages
    for lang in ["hi", "hinglish", "es", "en"]:
        res_brief = service.explain_operations_brief("context", {}, {}, lang)
        assert res_brief == "AI Response Text"

    # Test answer_assistant_query in different languages
    for lang in ["hi", "hinglish", "es", "en"]:
        res_ans = service.answer_assistant_query("where is the restroom", "context", "gate_a", {}, {}, lang)
        assert res_ans == "AI Response Text"


def test_ai_service_initialized_failure():
    service = AIService()
    service.initialized = True

    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("API Error")
    service.model = mock_model

    # Should return empty string and fall back
    res = service.generate_ai_response("system", "prompt")
    assert res == ""

    # Test fallbacks when API fails
    res_route = service.explain_route("context", "Gate A", "Section 101", 100.0, 5.0, 1.0, "en")
    assert "Gate A" in res_route

    res_rec = service.explain_recommendation("context", "Restroom L1", "restroom", 5.0, 0.0, ["CLOSEST_IS_FASTEST"], "Restroom L1", "en")
    assert "Restroom L1" in res_rec

    res_brief = service.explain_operations_brief("context", {}, {}, "en")
    assert "operating normally" in res_brief

    res_ans = service.answer_assistant_query("where is the restroom", "context", "gate_a", {}, {}, "en")
    assert "Facility Explorer" in res_ans


def test_ai_service_init_exception():
    with patch("google.generativeai.GenerativeModel") as mock_gen_model:
        mock_gen_model.side_effect = Exception("Init Error")
        with patch("backend.app.core.config.settings.GEMINI_API_KEY", "dummy_key"):
            service = AIService()
            assert service.initialized is False


def test_ai_service_generate_response_empty_text():
    service = AIService()
    service.initialized = True
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = ""  # empty text
    mock_model.generate_content.return_value = mock_response
    service.model = mock_model
    assert service.generate_ai_response("sys", "prompt") == ""


def test_ai_service_load_json_exceptions():
    service = AIService()
    # Mock open to raise exception
    with patch("builtins.open") as mock_open:
        mock_open.side_effect = Exception("Disk failure")
        # answer_assistant_query should log warning and continue fallback
        res = service.answer_assistant_query("hello", "context", "gate_a", {}, {}, "en")
        assert "Smart Stadium Assistant" in res
