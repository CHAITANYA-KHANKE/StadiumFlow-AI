from datetime import datetime, timedelta
from typing import List
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.routing_engine import routing_engine
from backend.app.schemas.navigation import TimelineRequest, TimelineResponse, TimelineStep, RouteRequest

class TimelineEngine:
    def __init__(self):
        self.manager = live_state_manager
        self.router = routing_engine

    def minutes_to_hhmm(self, minutes: float) -> str:
        minutes_int = int(round(minutes))
        hours = (minutes_int // 60) % 24
        mins = minutes_int % 60
        return f"{hours:02d}:{mins:02d}"

    def hhmm_to_minutes(self, hhmm: str) -> int:
        try:
            parts = hhmm.split(":")
            return int(parts[0]) * 60 + int(parts[1])
        except Exception:
            return 1040 # Default 17:20

    def generate_timeline(self, request: TimelineRequest) -> TimelineResponse:
        gate_id = request.arrival_gate_id
        section_str = request.ticket_seat_section.lower().replace(" ", "_")
        acc_mode = request.accessibility_mode
        current_time_min = self.hhmm_to_minutes(request.current_time)

        # 1. Verify seat section node exists
        seat_node_id = section_str
        if seat_node_id not in self.manager.nodes:
            # Fallback to a default section if not found
            seat_node_id = "section_101"

        # 2. Get route from Gate to Seat Section
        route_req = RouteRequest(
            start_node_id=gate_id,
            end_node_id=seat_node_id,
            accessibility_mode=acc_mode
        )
        route_res = self.router.calculate_route(route_req)
        
        # In case route fails, fallback to default times
        total_route_time = route_res.estimated_time if route_res.path_nodes else 15.0
        security_wait = float(self.manager.gate_security_wait.get(gate_id, 5.0))
        walking_time = max(0.0, total_route_time - security_wait)

        # 3. Calculate match schedule milestones
        # Kickoff is at 20:00 (8:00 PM) = 1200 minutes
        kickoff_min = 1200
        
        # Target seat arrival: 30 minutes before kickoff (19:30) = 1170 minutes
        seat_arrival_min = kickoff_min - 30
        
        # Section entry: seat arrival - seat navigation time
        reach_section_min = seat_arrival_min
        
        # Security ends / walking starts:
        walking_start_min = reach_section_min - walking_time
        
        # Security starts / gate arrival:
        gate_arrival_min = walking_start_min - security_wait
        
        # Departure from hotel/location: gate arrival - travel time (default 45 minutes)
        travel_time = 45
        departure_min = gate_arrival_min - travel_time

        # Post-match milestones: match ends at 21:45 (1305 minutes)
        match_end_min = kickoff_min + 105
        exit_gate_wait = 15 # default wait time
        
        # If exit gate has transport delay (part of exit scenario)
        if self.manager.current_scenario_id == "exit_transport_block" and gate_id in ["gate_e", "gate_f"]:
            exit_gate_wait = 40 # extra delay

        # Generate Timeline Steps
        steps = []
        
        # 1. Departure
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(departure_min),
            event_title="Depart for Stadium",
            description=f"Leave your current location. Estimated travel time is {travel_time} minutes via public transit.",
            type="departure"
        ))
        
        # 2. Arrive at Stadium Gates
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(gate_arrival_min),
            event_title=f"Arrive at {self.manager.nodes.get(gate_id, {}).get('name', 'Gate')}",
            description="Prepare your digital ticket and ID. Ensure no prohibited items in bags.",
            node_id=gate_id,
            type="arrival"
        ))
        
        # 3. Security wait
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(gate_arrival_min),
            event_title="Security Screening",
            description=f"Estimated wait time is {int(security_wait)} minutes. Congestion level: {'High' if security_wait > 15 else 'Normal'}.",
            node_id=gate_id,
            type="security"
        ))
        
        # 4. Seat Navigation
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(walking_start_min),
            event_title="Navigate to Seat",
            description=f"Follow route from gate to {request.ticket_seat_section}. Walking distance: {route_res.total_distance}m.",
            node_id=seat_node_id,
            type="seat"
        ))
        
        # 5. Settle in Seat
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(reach_section_min),
            event_title="Reach Seat",
            description=f"Located in {request.ticket_seat_section}, Row {request.ticket_seat_row}, Seat {request.ticket_seat_number}. Settle down and enjoy the pre-match show.",
            node_id=seat_node_id,
            type="seat"
        ))
        
        # 6. Kickoff
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(kickoff_min),
            event_title="Match Kickoff",
            description="FIFA World Cup 2026 match begins! Spain vs Argentina.",
            type="kickoff"
        ))
        
        # 7. Post-Match Exit
        steps.append(TimelineStep(
            time=self.minutes_to_hhmm(match_end_min + exit_gate_wait),
            event_title="Post-Match Smart Exit",
            description=f"Match ends. Exit stadium via Gate {gate_id} or look at live transport boards for alternate routes. Delay estimate: {exit_gate_wait} minutes.",
            node_id=gate_id,
            type="exit"
        ))

        # Adjust timeline dates if timeline calculation pushes past midnight or current time
        # Sort steps by time
        steps = sorted(steps, key=lambda x: self.hhmm_to_minutes(x.time))

        estimated_arrival_str = self.minutes_to_hhmm(seat_arrival_min)
        message = f"Timeline calculated successfully. Based on current gate queue of {int(security_wait)} minutes, you should leave at {self.minutes_to_hhmm(departure_min)} to reach your seat comfortably before kickoff."

        return TimelineResponse(
            steps=steps,
            estimated_seat_arrival=estimated_arrival_str,
            message=message
        )

# Global timeline engine instance
timeline_engine = TimelineEngine()
