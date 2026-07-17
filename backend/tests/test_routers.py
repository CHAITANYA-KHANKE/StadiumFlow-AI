import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_operations_summary_unauthorized():
    response = client.get("/api/operations/summary")
    assert response.status_code == 401
    
    response = client.get("/api/operations/summary", headers={"X-Admin-Token": "invalid-token"})
    assert response.status_code == 401

def test_operations_summary_authorized():
    response = client.get("/api/operations/summary", headers={"X-Admin-Token": "stadiumflow-admin-secret-token"})
    assert response.status_code == 200
    assert "summary" in response.json()

def test_simulation_scenario_unauthorized():
    response = client.post("/api/simulation/scenario", json={"scenario_id": "gate_c_closure"})
    assert response.status_code == 401

def test_simulation_reset_unauthorized():
    response = client.post("/api/simulation/reset")
    assert response.status_code == 401

def test_feedback_get_unauthorized():
    response = client.get("/api/feedback")
    assert response.status_code == 401

def test_feedback_get_authorized():
    client.post("/api/feedback", json={
        "location_id": "restroom_l1",
        "helpful": True,
        "comment": "Nice."
    })
    response = client.get("/api/feedback", headers={"X-Admin-Token": "stadiumflow-admin-secret-token"})
    assert response.status_code == 200
    assert len(response.json()) > 0
