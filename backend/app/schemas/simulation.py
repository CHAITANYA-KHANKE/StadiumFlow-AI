from typing import List, Optional

from pydantic import BaseModel


class ScenarioTriggerRequest(BaseModel):
    scenario_id: str


class ImpactReport(BaseModel):
    before_value: float
    after_value: float
    change: float


class SimulationImpactResponse(BaseModel):
    scenario_id: str
    name: str
    description: str
    affected_zones: List[str]
    average_entry_time_report: ImpactReport
    crowd_pressure_report: ImpactReport
    critical_zones: List[str]
    ai_impact_summary: Optional[str] = None
