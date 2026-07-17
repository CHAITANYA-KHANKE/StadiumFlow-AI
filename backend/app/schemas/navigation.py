from typing import List, Optional

from pydantic import BaseModel


class RouteRequest(BaseModel):
    start_node_id: str
    end_node_id: str
    accessibility_mode: bool = False

class RouteStep(BaseModel):
    node_id: str
    name: str
    x: float
    y: float
    z: float
    description: str

class RouteResponse(BaseModel):
    path_nodes: List[str]
    path_steps: List[RouteStep]
    total_distance: float
    estimated_time: float # minutes
    accessible: bool
    crowd_congestion_level: float # multiplier (1.0 = normal, etc.)
    reason_explanation: Optional[str] = None

class TimelineRequest(BaseModel):
    ticket_seat_section: str # e.g. "Section 104" or "section_104"
    ticket_seat_row: str
    ticket_seat_number: str
    arrival_gate_id: str
    accessibility_mode: bool = False
    current_time: str = "17:20" # HH:MM format

class TimelineStep(BaseModel):
    time: str
    event_title: str
    description: str
    node_id: Optional[str] = None
    type: str # "departure", "arrival", "gate", "security", "seat", "kickoff", "exit"

class TimelineResponse(BaseModel):
    steps: List[TimelineStep]
    estimated_seat_arrival: str
    message: str
