import pytest
from backend.app.services.routing_engine import routing_engine
from backend.app.services.live_state_manager import live_state_manager
from backend.app.schemas.navigation import RouteRequest

def test_routing_normal():
    # Normal operation routing
    live_state_manager.reset_to_default()
    req = RouteRequest(
        start_node_id="gate_a",
        end_node_id="section_101",
        accessibility_mode=False
    )
    res = routing_engine.calculate_route(req)
    assert len(res.path_nodes) > 0
    assert res.total_distance > 0.0
    assert res.estimated_time > 0.0
    assert res.accessible == False

def test_accessibility_routing_stairs_avoided():
    # In accessibility mode, routing through stairs should be impossible (cost = inf)
    # Let's route from concourse_lower_0 to concourse_upper_0
    # The only connection is stairs_north (inaccessible) and elevator_east (accessible, via angle 90)
    live_state_manager.reset_to_default()
    
    # Non-accessibility mode should find a path (likely using stairs since it's closer)
    req_normal = RouteRequest(
        start_node_id="concourse_lower_0",
        end_node_id="concourse_upper_0",
        accessibility_mode=False
    )
    res_normal = routing_engine.calculate_route(req_normal)
    assert len(res_normal.path_nodes) > 0
    assert "stairs_north_bottom" in res_normal.path_nodes
    
    # Accessibility mode should avoid stairs and go via elevator
    req_acc = RouteRequest(
        start_node_id="concourse_lower_0",
        end_node_id="concourse_upper_0",
        accessibility_mode=True
    )
    res_acc = routing_engine.calculate_route(req_acc)
    assert len(res_acc.path_nodes) > 0
    assert "stairs_north_bottom" not in res_acc.path_nodes
    assert "elevator_east_bottom" in res_acc.path_nodes or "elevator_west_bottom" in res_acc.path_nodes

def test_congestion_aware_routing():
    # Set a huge congestion multiplier on the North Hub concourse_lower_0
    live_state_manager.reset_to_default()
    live_state_manager.concourse_congestion["concourse_lower_0"] = 10.0
    
    # Route from gate_a (which connects to concourse_lower_0) to section_103 (via angle 90)
    # The direct path goes through concourse_lower_0. The high multiplier should penalize this path
    # and force it to find a detour if possible, or increase the cost/estimated time
    req = RouteRequest(
        start_node_id="gate_a",
        end_node_id="section_102", # at 45 deg
        accessibility_mode=False
    )
    res = routing_engine.calculate_route(req)
    assert len(res.path_nodes) > 0
    assert res.crowd_congestion_level > 1.0

def test_gate_closure_unreachable():
    # If a gate is closed, routing from/to it should return an empty path
    live_state_manager.reset_to_default()
    live_state_manager.gate_closures.append("gate_c")
    
    req = RouteRequest(
        start_node_id="gate_c",
        end_node_id="section_103",
        accessibility_mode=False
    )
    res = routing_engine.calculate_route(req)
    assert len(res.path_nodes) == 0
    assert res.reason_explanation == "No accessible route found."
