import json
import time
import os
from typing import Dict, List, Any
from backend.app.schemas.stadium import IncidentSchema

class LiveStateManager:
    def __init__(self):
        self.stadium_data_path = r"c:\Users\chait\Documents\HACKATHON\FIFA WORLD CUP\backend\app\data\stadium.json"
        self.scenarios_data_path = r"c:\Users\chait\Documents\HACKATHON\FIFA WORLD CUP\backend\app\data\scenarios.json"
        
        self.nodes = {}
        self.edges = []
        self.scenarios = {}
        self.current_scenario_id = "reset"
        
        # Live State In-Memory
        self.gate_security_wait: Dict[str, float] = {}
        self.gate_closures: List[str] = []
        self.concourse_congestion: Dict[str, float] = {}
        self.facility_closures: List[str] = []
        self.facility_queues: Dict[str, float] = {}
        self.active_incidents: List[Dict[str, Any]] = []
        self.last_updated: float = time.time()
        
        self.load_static_data()
        self.reset_to_default()

    def load_static_data(self):
        # Load Stadium nodes/edges
        if os.path.exists(self.stadium_data_path):
            with open(self.stadium_data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.edges = data.get("edges", [])
                for node in data.get("nodes", []):
                    self.nodes[node["id"]] = node
        
        # Load Scenarios
        if os.path.exists(self.scenarios_data_path):
            with open(self.scenarios_data_path, 'r', encoding='utf-8') as f:
                sc_list = json.load(f)
                for sc in sc_list:
                    self.scenarios[sc["id"]] = sc

    def reset_to_default(self):
        self.current_scenario_id = "reset"
        self.gate_closures = []
        self.facility_closures = []
        self.active_incidents = []
        self.concourse_congestion = {}
        
        # Set default waits (5 mins for all gates)
        for node_id, node in self.nodes.items():
            if node["category"] == "gate":
                self.gate_security_wait[node_id] = 5.0
                
        # Set baseline queues for restrooms and food
        for node_id, node in self.nodes.items():
            if node["category"] == "restroom":
                self.facility_queues[node_id] = 3.0 # baseline 3 mins
            elif node["category"] == "food":
                self.facility_queues[node_id] = 5.0 # baseline 5 mins
            elif node["category"] in ["medical", "info"]:
                self.facility_queues[node_id] = 2.0 # baseline 2 mins
                
        self.last_updated = time.time()

    def apply_scenario(self, scenario_id: str) -> bool:
        if scenario_id not in self.scenarios:
            return False
        
        self.reset_to_default()
        sc = self.scenarios[scenario_id]
        self.current_scenario_id = scenario_id
        
        self.gate_closures = sc.get("gate_closures", [])
        self.facility_closures = sc.get("facility_closures", [])
        self.active_incidents = sc.get("active_incidents", [])
        
        # Apply gate security wait
        gate_waits = sc.get("gate_security_wait", {})
        for g_id, wait in gate_waits.items():
            self.gate_security_wait[g_id] = wait
            
        # Apply concourse congestion multipliers
        congestion = sc.get("concourse_congestion", {})
        for c_id, multiplier in congestion.items():
            self.concourse_congestion[c_id] = multiplier
            
        # Dynamically scale queue times at adjacent facilities during congestion
        for c_id, multiplier in congestion.items():
            for node_id, node in self.nodes.items():
                if node["category"] in ["restroom", "food"]:
                    # If facility is connected to a congested concourse, scale its queue
                    for edge in self.edges:
                        if (edge["source"] == c_id and edge["destination"] == node_id) or \
                           (edge["source"] == node_id and edge["destination"] == c_id):
                            self.facility_queues[node_id] = round(self.facility_queues[node_id] * multiplier, 1)

        self.last_updated = time.time()
        return True

    def get_live_state(self) -> Dict[str, Any]:
        # Formulate active incidents as IncidentSchema
        incidents = []
        for inc in self.active_incidents:
            incidents.append(IncidentSchema(
                id=inc["id"],
                title=inc["title"],
                severity=inc["severity"],
                zone_id=inc["zone_id"],
                message=inc["message"]
            ))
            
        return {
            "gate_security_wait": self.gate_security_wait,
            "gate_closures": self.gate_closures,
            "concourse_congestion": self.concourse_congestion,
            "facility_closures": self.facility_closures,
            "active_incidents": incidents,
            "last_updated": self.last_updated
        }

# Global live state manager instance
live_state_manager = LiveStateManager()
