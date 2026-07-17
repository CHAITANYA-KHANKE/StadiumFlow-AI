from typing import Any, Dict, List

from backend.app.schemas.navigation import RouteResponse
from backend.app.schemas.recommendation import RecommendationResponse


class ContextBuilder:
    @staticmethod
    def build_route_context(response: RouteResponse, start_name: str, end_name: str) -> str:
        steps_summary = ", ".join([step.name for step in response.path_steps])
        return (
            f"Start: {start_name}\n"
            f"Destination: {end_name}\n"
            f"Total Distance: {response.total_distance} meters\n"
            f"Estimated Time: {response.estimated_time} minutes\n"
            f"Accessibility Mode: {'Enabled' if response.accessible else 'Disabled'}\n"
            f"Concourse Congestion Multiplier: {response.crowd_congestion_level}x\n"
            f"Path Walkthrough: {steps_summary}\n"
        )

    @staticmethod
    def build_recommendation_context(response: RecommendationResponse, category: str) -> str:
        alt_str = ""
        for alt in response.alternatives:
            alt_str += f"- {alt.name}: Walk {alt.walking_time} mins + Queue {alt.queue_time} mins = Total {alt.total_time} mins\n"

        return (
            f"Category Requested: {category}\n"
            f"Best Option Recommended: {response.recommended_option} (ID: {response.facility_id})\n"
            f"Expected Travel + Wait Time: {response.estimated_total_time} minutes\n"
            f"Time Saved compared to closest option: {response.time_saved} minutes\n"
            f"Reason Codes: {', '.join(response.reason_codes)}\n"
            f"Alternative Options Evaluated:\n{alt_str if alt_str else 'None'}"
        )

    @staticmethod
    def build_operations_context(live_state: Dict[str, Any], nodes: Dict[str, Any]) -> str:
        active_inc = ""
        for inc in live_state.get("active_incidents", []):
            active_inc += f"- [{inc.severity.upper()}] {inc.title}: {inc.message} (Zone: {nodes.get(inc.zone_id, {}).get('name', inc.zone_id)})\n"

        gate_waits = ""
        for g_id, wait in live_state.get("gate_security_wait", {}).items():
            status = "CLOSED" if g_id in live_state.get("gate_closures", []) else f"{wait} mins wait"
            gate_waits += f"- {nodes.get(g_id, {}).get('name', g_id)}: {status}\n"

        facility_closures = ", ".join([nodes.get(f_id, {}).get('name', f_id) for f_id in live_state.get("facility_closures", [])])
        concourse_congestion = ""
        for c_id, multiplier in live_state.get("concourse_congestion", {}).items():
            concourse_congestion += f"- {nodes.get(c_id, {}).get('name', c_id)}: {multiplier}x congestion multiplier\n"

        return (
            f"--- LIVE OPERATIONS DATA ---\n"
            f"Active Incidents:\n{active_inc if active_inc else 'None'}\n"
            f"Gate Entrances Status:\n{gate_waits}\n"
            f"Closed Facilities: {facility_closures if facility_closures else 'None'}\n"
            f"Congested Concourse Zones:\n{concourse_congestion if concourse_congestion else 'None'}\n"
        )

    @staticmethod
    def build_player_context(players: List[Dict[str, Any]]) -> str:
        ctx = "--- PLAYER ROSTER & STATS ---\n"
        for p in players:
            stats_str = ", ".join([f"{k.replace('_', ' ').title()}: {v}" for k, v in p.get("stats", {}).items()])
            radar_str = ", ".join([f"{k.title()}: {v}" for k, v in p.get("radar", {}).items()])
            ctx += (
                f"- Name: {p['name']}\n"
                f"  Team: {p['team']} | Position: {p['position']}\n"
                f"  Status: {p['status']} | Fitness: {p['fitness']} | Rating: {p['rating']}/100\n"
                f"  Stats: {stats_str}\n"
                f"  Radar Attributes: {radar_str}\n"
            )
        return ctx

    @staticmethod
    def build_match_context(matches: List[Dict[str, Any]]) -> str:
        ctx = "--- MATCH SCHEDULE & BRACKET ---\n"
        for m in matches:
            if m.get("id") == "bracket_structure":
                continue
            events_str = "; ".join([f"[{e['time']}] {e['type'].title()} by {e['player']} ({e['detail']})" for e in m.get("events", [])])
            ctx += (
                f"- Match {m['home_team']} vs {m['away_team']} ({m['stage']})\n"
                f"  Status: {m['status'].upper()} | Date/Time: {m['datetime']}\n"
                f"  Score: {m['home_score']} - {m['away_score']}\n"
            )
            if m.get("status") == "live" and m.get("minute"):
                ctx += f"  Current Minute: {m['minute']}'\n"
            if events_str:
                ctx += f"  Key Events: {events_str}\n"
        return ctx
