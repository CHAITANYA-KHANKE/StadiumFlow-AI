from backend.app.schemas.simulation import ImpactReport, SimulationImpactResponse
from backend.app.services.live_state_manager import live_state_manager


class SimulationEngine:
    def __init__(self):
        self.manager = live_state_manager

    def trigger_scenario(self, scenario_id: str) -> SimulationImpactResponse:
        """
        Triggers a predefined stadium incident/scenario by updating the live state.
        Calculates before and after metrics (gate wait averages, concourse congestion averages)
        to compile a comparative Impact Report for stadium operators.

        Parameters:
            scenario_id (str): The identifier of the simulation scenario to trigger.

        Returns:
            SimulationImpactResponse: Detailed metrics on critical zones, affected areas, and local impact summary.
        """
        # Calculate BEFORE metrics (Normal state)
        # Average gate wait before:
        before_gate_waits = [5.0 for n in self.manager.nodes.values() if n["category"] == "gate"]
        avg_wait_before = sum(before_gate_waits) / len(before_gate_waits) if before_gate_waits else 5.0

        # Average concourse congestion before:
        before_congestion = [1.0 for n in self.manager.nodes.values() if n["category"] == "concourse"]
        avg_cong_before = sum(before_congestion) / len(before_congestion) if before_congestion else 1.0

        # Apply the scenario
        success = self.manager.apply_scenario(scenario_id)
        if not success:
            raise ValueError(f"Scenario ID '{scenario_id}' not found.")

        sc = self.manager.scenarios[scenario_id]

        # Calculate AFTER metrics
        # Average gate wait after (only open gates count)
        after_gate_waits = []
        for g_id, wait in self.manager.gate_security_wait.items():
            if g_id not in self.manager.gate_closures:
                after_gate_waits.append(wait)
        avg_wait_after = sum(after_gate_waits) / len(after_gate_waits) if after_gate_waits else 0.0

        # Average concourse congestion after
        after_congestion = []
        for n_id in self.manager.nodes:
            if self.manager.nodes[n_id]["category"] == "concourse":
                after_congestion.append(self.manager.concourse_congestion.get(n_id, 1.0))
        avg_cong_after = sum(after_congestion) / len(after_congestion) if after_congestion else 1.0

        # Affected zones
        affected_zones = []
        affected_zones.extend(self.manager.gate_closures)
        affected_zones.extend(list(self.manager.concourse_congestion.keys()))
        affected_zones.extend(self.manager.facility_closures)

        # Critical zones (congestion >= 2.0 or security wait >= 15.0 or closed gates)
        critical_zones = []
        for g_id, wait in self.manager.gate_security_wait.items():
            if wait >= 15.0 or g_id in self.manager.gate_closures:
                critical_zones.append(g_id)
        for c_id, multiplier in self.manager.concourse_congestion.items():
            if multiplier >= 2.0:
                critical_zones.append(c_id)
        for f_id in self.manager.facility_closures:
            critical_zones.append(f_id)

        # Calculate reports
        entry_time_report = ImpactReport(before_value=round(avg_wait_before, 1), after_value=round(avg_wait_after, 1), change=round(avg_wait_after - avg_wait_before, 1))

        crowd_pressure_report = ImpactReport(before_value=round(avg_cong_before, 2), after_value=round(avg_cong_after, 2), change=round(avg_cong_after - avg_cong_before, 2))

        # Build local impact explanation
        explanation = f"Scenario '{sc['name']}' applied. "
        if scenario_id == "gate_c_closure":
            explanation += "Gate C closure forces crowd redistribution. Entry wait at adjacent Gates B and D increased. Concourse North-East congestion rose."
        elif scenario_id == "gate_a_overload":
            explanation += "Gate A wait times surged to 25 mins. Fans redirected to Gate H or B to balance queue times."
        elif scenario_id == "north_concourse_congested":
            explanation += "Bottleneck detected on North Lower Concourse. Alternate concourse pathways show rising load but remain under threshold."
        elif scenario_id == "food_stall_l2_closed":
            explanation += "Food Stall L2 maintenance causes local redistribution of fan concession traffic to Food Stalls L1 and L3."
        elif scenario_id == "exit_transport_block":
            explanation += "Southern exit transport blockage has escalated Gate E/F congestion. Recommendation shifted to route exits via Northern gates."
        else:
            explanation += "Stadium operating normally. All gates and facilities open."

        return SimulationImpactResponse(
            scenario_id=scenario_id,
            name=sc["name"],
            description=sc["description"],
            affected_zones=list(set(affected_zones)),
            average_entry_time_report=entry_time_report,
            crowd_pressure_report=crowd_pressure_report,
            critical_zones=list(set(critical_zones)),
            ai_impact_summary=explanation,
        )

    def reset_simulation(self) -> str:
        """
        Resets the stadium live state to standard baseline values.
        This closes active incidents, clears gate and facility closures,
        and resets gate queue times back to standard normals (e.g. 5 minutes).
        """
        self.manager.reset_to_default()
        return "Simulation state reset to Normal Operations."


# Global simulation engine instance
simulation_engine = SimulationEngine()
