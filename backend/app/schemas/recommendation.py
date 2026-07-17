from typing import List, Optional

from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    current_node_id: str
    facility_category: str # "restroom", "food", "medical", "info"
    accessibility_mode: bool = False

class AlternativeOption(BaseModel):
    facility_id: str
    name: str
    walking_time: float
    queue_time: float
    total_time: float
    accessible: bool

class RecommendationResponse(BaseModel):
    recommended_option: str # Display name
    facility_id: str
    estimated_total_time: float # minutes
    time_saved: float # minutes saved compared to the closest/worst option
    reason_codes: List[str] # e.g. ["LOWER_CONGESTION", "SHORTER_QUEUE"]
    alternatives: List[AlternativeOption]
    data_timestamp: float
    confidence: float
    reason_explanation: Optional[str] = None
