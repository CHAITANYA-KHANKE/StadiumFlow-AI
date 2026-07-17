import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.live_state_manager import live_state_manager

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "gemini_api_active" in response.json()

def test_api_stadium():
    response = client.get("/api/stadium")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_api_route():
    response = client.post("/api/route", json={
        "start_node_id": "gate_a",
        "end_node_id": "section_104",
        "accessibility_mode": False
    })
    assert response.status_code == 200
    data = response.json()
    assert "path_nodes" in data
    assert "estimated_time" in data

def test_api_recommend_facility():
    response = client.post("/api/recommend-facility", json={
        "current_node_id": "section_101",
        "facility_category": "restroom",
        "accessibility_mode": False
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommended_option" in data
    assert "estimated_total_time" in data

def test_api_timeline():
    response = client.post("/api/timeline", json={
        "ticket_seat_section": "Section 104",
        "ticket_seat_row": "G",
        "ticket_seat_number": "12",
        "arrival_gate_id": "gate_a",
        "accessibility_mode": False
    })
    assert response.status_code == 200
    data = response.json()
    assert "steps" in data
    assert len(data["steps"]) > 0

def test_api_simulation_scenario():
    response = client.post("/api/simulation/scenario", json={
        "scenario_id": "gate_c_closure"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_id"] == "gate_c_closure"
    assert len(data["affected_zones"]) > 0

def test_api_simulation_reset():
    response = client.post("/api/simulation/reset")
    assert response.status_code == 200
    assert response.json()["message"] == "Simulation state reset to Normal Operations."

def test_api_feedback():
    response = client.post("/api/feedback", json={
        "location_id": "restroom_l1",
        "helpful": True,
        "comment": "Nice clean facility."
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_api_security_headers():
    response = client.get("/api/health")
    assert "X-Frame-Options" in response.headers
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
