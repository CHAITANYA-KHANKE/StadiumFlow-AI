from backend.app.schemas.navigation import TimelineRequest
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.timeline_engine import timeline_engine


def test_timeline_generation():
    live_state_manager.reset_to_default()

    # 1. Base wait of 5 mins at Gate A
    req = TimelineRequest(ticket_seat_section="Section 104", ticket_seat_row="G", ticket_seat_number="12", arrival_gate_id="gate_a", accessibility_mode=False)
    res = timeline_engine.generate_timeline(req)

    assert len(res.steps) == 7
    # Find departure step time
    dep_step = [s for s in res.steps if s.type == "departure"][0]
    dep_time_normal = timeline_engine.hhmm_to_minutes(dep_step.time)

    # 2. Increase Gate A wait to 25 mins
    live_state_manager.gate_security_wait["gate_a"] = 25.0
    res_congested = timeline_engine.generate_timeline(req)
    dep_step_congested = [s for s in res_congested.steps if s.type == "departure"][0]
    dep_time_congested = timeline_engine.hhmm_to_minutes(dep_step_congested.time)

    # Congested departure time must be exactly 20 minutes earlier (meaning a smaller minute value from midnight)
    assert dep_time_congested == dep_time_normal - 20


def test_timeline_edge_cases():
    live_state_manager.reset_to_default()

    # 1. Invalid seat section
    req = TimelineRequest(ticket_seat_section="Invalid Seat Section", ticket_seat_row="G", ticket_seat_number="12", arrival_gate_id="gate_a", accessibility_mode=False)
    res = timeline_engine.generate_timeline(req)
    assert len(res.steps) == 7

    # 2. exit_transport_block scenario with gate_e
    live_state_manager.current_scenario_id = "exit_transport_block"
    req_exit = TimelineRequest(ticket_seat_section="Section 104", ticket_seat_row="G", ticket_seat_number="12", arrival_gate_id="gate_e", accessibility_mode=False)
    res_exit = timeline_engine.generate_timeline(req_exit)
    exit_step = [s for s in res_exit.steps if s.type == "exit"][0]
    assert "Delay estimate: 40 minutes" in exit_step.description

    # 3. Invalid hh:mm to minutes exception fallback
    mins = timeline_engine.hhmm_to_minutes("invalid_format")
    assert mins == 1040
