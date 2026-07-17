from pydantic import BaseModel
from typing import List, Dict, Optional

class NodeSchema(BaseModel):
    id: str
    name: str
    category: str
    x: float
    y: float
    z: float
    accessible: bool

class EdgeSchema(BaseModel):
    source: str
    destination: str
    distance: float
    accessible: bool
    status: str

class StadiumSchema(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]

class IncidentSchema(BaseModel):
    id: str
    title: str
    severity: str # "low", "medium", "high"
    zone_id: str
    message: str

class LiveStateSchema(BaseModel):
    gate_security_wait: Dict[str, float]
    gate_closures: List[str]
    concourse_congestion: Dict[str, float]
    facility_closures: List[str]
    active_incidents: List[IncidentSchema]
    last_updated: float

class FeedbackSchema(BaseModel):
    location_id: str
    helpful: bool
    comment: Optional[str] = None
