import os
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_operations_summary_unauthorized():
    response = client.get("/api/operations/summary")
    assert response.status_code == 401

    response = client.get("/api/operations/summary", headers={"X-Admin-Token": "invalid-token"})
    assert response.status_code == 401


def test_operations_summary_authorized_and_cached():
    headers = {"X-Admin-Token": "stadiumflow-admin-secret-token"}
    # Call 1 (Calculates)
    response1 = client.get("/api/operations/summary", headers=headers)
    assert response1.status_code == 200
    data1 = response1.json()
    assert "summary" in data1
    assert data1["cached"] is False

    # Call 2 (Cache hit)
    response2 = client.get("/api/operations/summary", headers=headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert "summary" in data2
    assert data2["cached"] is True


def test_chat_assistant():
    # Success
    response = client.post("/api/assistant", json={"query": "Where is the restroom?", "current_node_id": "gate_a", "language": "en"})
    assert response.status_code == 200
    assert "answer" in response.json()

    # Missing query error
    response_err = client.post("/api/assistant", json={"query": "", "current_node_id": "gate_a"})
    assert response_err.status_code == 400
    assert "required" in response_err.json()["detail"]


def test_simulation_scenario_unauthorized():
    response = client.post("/api/simulation/scenario", json={"scenario_id": "gate_c_closure"})
    assert response.status_code == 401


def test_simulation_scenario_invalid_id():
    headers = {"X-Admin-Token": "stadiumflow-admin-secret-token"}
    response = client.post("/api/simulation/scenario", json={"scenario_id": "invalid_scenario_id"}, headers=headers)
    assert response.status_code == 400
    assert "not found" in response.json()["detail"]


def test_simulation_reset_unauthorized():
    response = client.post("/api/simulation/reset")
    assert response.status_code == 401


def test_feedback_get_unauthorized():
    response = client.get("/api/feedback")
    assert response.status_code == 401


def test_feedback_get_authorized():
    client.post("/api/feedback", json={"location_id": "restroom_l1", "helpful": True, "comment": "Nice."})
    response = client.get("/api/feedback", headers={"X-Admin-Token": "stadiumflow-admin-secret-token"})
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_invalid_node_id_regex():
    # Route with invalid node ID
    response = client.post("/api/route", json={"start_node_id": "gate_a_very_long_node_id_that_violates_regex_pattern_50_chars", "end_node_id": "section_101", "accessibility_mode": False})
    assert response.status_code == 400
    assert "Invalid node ID pattern" in response.json()["detail"]

    # Recommend facility with invalid node ID
    response2 = client.post("/api/recommend-facility", json={"current_node_id": "gate_a_very_long_node_id_that_violates_regex_pattern_50_chars", "facility_category": "restroom", "accessibility_mode": False})
    assert response2.status_code == 400
    assert "Invalid node ID pattern" in response2.json()["detail"]


def test_recommend_facility_invalid_category():
    response = client.post("/api/recommend-facility", json={"current_node_id": "section_101", "facility_category": "invalid_category", "accessibility_mode": False})
    assert response.status_code == 400
    assert "Invalid facility category" in response.json()["detail"]


def test_payload_too_large():
    # Payload > 1MB
    large_data = "a" * (1 * 1024 * 1024 + 100)
    response = client.post("/api/feedback", content=large_data)
    assert response.status_code == 413


def test_invalid_content_length_header():
    # Send request with invalid content-length header
    headers = {"content-length": "not-a-number"}
    # Using raw request mock or direct client call with specific headers
    response = client.post("/api/feedback", json={"helpful": True}, headers=headers)
    assert response.status_code == 400
    assert "Invalid content-length header" in response.json()["detail"]


def test_local_rate_limiter():
    # Trigger rate limit (let's verify the rate limit threshold is 100)
    # To keep test fast, we can mock the rate limiter's internal local_db or call it repeatedly.
    # Actually, we can patch `is_allowed` or manually call it.
    from backend.app.main import limiter

    limiter.local_db.clear()

    # Simulate 101 requests from "test-ip"
    for _ in range(100):
        assert limiter.is_allowed("test-ip", limit=100, window=60) is True

    # 101st request should fail
    assert limiter.is_allowed("test-ip", limit=100, window=60) is False


def test_redis_rate_limiter():
    # Mock environment variables
    with patch.dict(os.environ, {"UPSTASH_REDIS_REST_URL": "http://mock-redis.com", "UPSTASH_REDIS_REST_TOKEN": "mock-token"}):
        from backend.app.main import ServerlessRateLimiter

        mock_limiter = ServerlessRateLimiter()

        # Mock urllib.request.urlopen for success
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"result": 1}'

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__.return_value = mock_response

            # First request (creates expire)
            res = mock_limiter.is_allowed("127.0.0.1", limit=2, window=60)
            assert res is True
            assert mock_urlopen.call_count == 2  # 1 for incr, 1 for expire

            # Second request (count is still below or equal limit)
            mock_response.read.return_value = b'{"result": 2}'
            res2 = mock_limiter.is_allowed("127.0.0.1", limit=2, window=60)
            assert res2 is True

            # Third request (exceeds limit)
            mock_response.read.return_value = b'{"result": 3}'
            res3 = mock_limiter.is_allowed("127.0.0.1", limit=2, window=60)
            assert res3 is False


def test_redis_rate_limiter_failure_fallback():
    with patch.dict(os.environ, {"UPSTASH_REDIS_REST_URL": "http://mock-redis.com", "UPSTASH_REDIS_REST_TOKEN": "mock-token"}):
        from backend.app.main import ServerlessRateLimiter

        mock_limiter = ServerlessRateLimiter()

        with patch("urllib.request.urlopen") as mock_urlopen:
            # Raise exception on urlopen to simulate network error
            mock_urlopen.side_effect = Exception("Connection refused")

            # Should fall back to in-memory rates
            res = mock_limiter.is_allowed("127.0.0.1", limit=2, window=60)
            assert res is True


def test_main_rate_limit_exceeded_response():
    with patch("backend.app.main.limiter.is_allowed") as mock_allowed:
        mock_allowed.return_value = False
        response = client.get("/api/health")
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.json()["detail"]


def test_operations_summary_internal_error():
    headers = {"X-Admin-Token": "stadiumflow-admin-secret-token"}
    with patch("backend.app.services.live_state_manager.live_state_manager.get_live_state") as mock_get_state:
        mock_get_state.side_effect = Exception("Database crash")
        response = client.get("/api/operations/summary", headers=headers)
        assert response.status_code == 500
        assert "Database crash" in response.json()["detail"]


def test_simulation_scenario_internal_error():
    headers = {"X-Admin-Token": "stadiumflow-admin-secret-token"}
    with patch("backend.app.services.simulation_engine.simulation_engine.trigger_scenario") as mock_trigger:
        mock_trigger.side_effect = Exception("Sim panic")
        response = client.post("/api/simulation/scenario", json={"scenario_id": "gate_c_closure"}, headers=headers)
        assert response.status_code == 500
        assert "Sim panic" in response.json()["detail"]


def test_api_live_state_endpoint():
    response = client.get("/api/live-state")
    assert response.status_code == 200
    assert "gate_security_wait" in response.json()


def test_route_endpoint_value_error():
    with patch("backend.app.services.routing_engine.routing_engine.calculate_route") as mock_calc:
        mock_calc.side_effect = ValueError("Invalid nodes path")
        response = client.post("/api/route", json={"start_node_id": "gate_a", "end_node_id": "section_101"})
        assert response.status_code == 400
        assert "Invalid nodes path" in response.json()["detail"]


def test_route_endpoint_internal_error():
    with patch("backend.app.services.routing_engine.routing_engine.calculate_route") as mock_calc:
        mock_calc.side_effect = Exception("Dijkstra crash")
        response = client.post("/api/route", json={"start_node_id": "gate_a", "end_node_id": "section_101"})
        assert response.status_code == 500
        assert "Dijkstra crash" in response.json()["detail"]


def test_recommend_facility_endpoint_errors():
    with patch("backend.app.services.recommendation_engine.recommendation_engine.get_recommendations") as mock_rec:
        mock_rec.side_effect = ValueError("Rec value error")
        response = client.post("/api/recommend-facility", json={"current_node_id": "section_101", "facility_category": "restroom"})
        assert response.status_code == 400
        assert "Rec value error" in response.json()["detail"]

    with patch("backend.app.services.recommendation_engine.recommendation_engine.get_recommendations") as mock_rec:
        mock_rec.side_effect = Exception("Rec system panic")
        response = client.post("/api/recommend-facility", json={"current_node_id": "section_101", "facility_category": "restroom"})
        assert response.status_code == 500
        assert "Rec system panic" in response.json()["detail"]


def test_timeline_endpoint_internal_error():
    with patch("backend.app.services.timeline_engine.timeline_engine.generate_timeline") as mock_timeline:
        mock_timeline.side_effect = Exception("Timeline failed")
        response = client.post("/api/timeline", json={"ticket_seat_section": "Section 104", "ticket_seat_row": "G", "ticket_seat_number": "12", "arrival_gate_id": "gate_a"})
        assert response.status_code == 500
        assert "Timeline failed" in response.json()["detail"]


def test_matches_endpoint():
    # Success
    response = client.get("/api/matches")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Error
    with patch("builtins.open") as mock_open:
        mock_open.side_effect = Exception("Disk error")
        response_err = client.get("/api/matches")
        assert response_err.status_code == 500
        assert "Disk error" in response_err.json()["detail"]


def test_players_endpoint():
    # Success
    response = client.get("/api/players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Error
    with patch("builtins.open") as mock_open:
        mock_open.side_effect = Exception("Disk error")
        response_err = client.get("/api/players")
        assert response_err.status_code == 500
        assert "Disk error" in response_err.json()["detail"]


def test_matches_endpoint_not_exists():
    with patch("os.path.exists") as mock_exists:
        mock_exists.return_value = False
        response = client.get("/api/matches")
        assert response.status_code == 200
        assert response.json() == []


def test_players_endpoint_not_exists():
    with patch("os.path.exists") as mock_exists:
        mock_exists.return_value = False
        response = client.get("/api/players")
        assert response.status_code == 200
        assert response.json() == []
