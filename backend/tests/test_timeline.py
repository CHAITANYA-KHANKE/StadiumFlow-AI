import pytest
from backend.app.services.timeline_engine import timeline_engine
from backend.app.services.live_state_manager import live_state_manager
from backend.app.schemas.navigation import TimelineRequest

def test_timeline_generation():
    live_state_manager.reset_to_default()
    
    # 1. Base wait of 5 mins at Gate A
    req = TimelineRequest(
        ticket_seat_section="Section 104",
        ticket_seat_row="G",
        ticket_seat_number="12",
        arrival_gate_id="gate_a",
        accessibility_mode=False
    )
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
