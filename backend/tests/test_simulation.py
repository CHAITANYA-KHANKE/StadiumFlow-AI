import pytest

from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.simulation_engine import simulation_engine


def test_scenario_gate_c_closure():
    # Trigger Gate C closure scenario
    live_state_manager.reset_to_default()
    res = simulation_engine.trigger_scenario("gate_c_closure")

    assert res.scenario_id == "gate_c_closure"
    assert "gate_c" in res.affected_zones
    assert res.average_entry_time_report.after_value > res.average_entry_time_report.before_value
    assert "gate_c" in res.critical_zones
    assert res.ai_impact_summary is not None


def test_all_simulation_scenarios():
    scenarios = [
        "gate_c_closure",
        "gate_a_overload",
        "north_concourse_congested",
        "food_stall_l2_closed",
        "exit_transport_block",
        "normal"
    ]
    for sc in scenarios:
        live_state_manager.reset_to_default()
        if sc == "normal":
            # Test default explanation fallback if we pass a scenario not explicitly checked
            # but still loaded
            res = simulation_engine.trigger_scenario("reset")
            assert "operating normally" in res.ai_impact_summary
        else:
            res = simulation_engine.trigger_scenario(sc)
            assert res.scenario_id == sc

    # Test invalid scenario raises ValueError
    with pytest.raises(ValueError):
        simulation_engine.trigger_scenario("non_existent_scenario_id")


def test_simulation_reset():
    # Apply a scenario, then reset, and check if state returns to default
    live_state_manager.reset_to_default()
    simulation_engine.trigger_scenario("gate_c_closure")
    assert "gate_c" in live_state_manager.gate_closures

    simulation_engine.reset_simulation()
    assert len(live_state_manager.gate_closures) == 0
    assert live_state_manager.gate_security_wait["gate_c"] == 5.0
