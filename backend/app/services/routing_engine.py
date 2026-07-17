import heapq
from typing import Any, Dict, List, Optional, Tuple

from backend.app.schemas.navigation import RouteRequest, RouteResponse, RouteStep
from backend.app.services.live_state_manager import live_state_manager


class RoutingEngine:
    def __init__(self):
        self.manager = live_state_manager

    def get_edge_cost(self, u: str, v: str, edge: Dict[str, Any], accessibility_mode: bool) -> float:
        """
        Calculates the dynamic travel cost between two nodes u and v.
        The cost is calculated based on:
        1. Closed statuses of the edge or either node (returns float('inf') if closed).
        2. Accessibility settings (returns float('inf') if inaccessible nodes/edges are encountered in accessibility mode).
        3. Base walking distance.
        4. Crowd congestion levels of the concourses.
        5. Gate security queue wait times (translated to distance penalty equivalent).
        """
        node_u = self.manager.nodes.get(u)
        node_v = self.manager.nodes.get(v)

        if not node_u or not node_v:
            return float('inf')

        # 1. Closure Penalty (Infinity if closed)
        if edge.get("status") == "closed":
            return float('inf')
        if u in self.manager.gate_closures or v in self.manager.gate_closures:
            return float('inf')
        if u in self.manager.facility_closures or v in self.manager.facility_closures:
            return float('inf')

        # 2. Accessibility Check
        if accessibility_mode:
            if not edge.get("accessible", True):
                return float('inf')
            if not node_u.get("accessible", True) or not node_v.get("accessible", True):
                return float('inf')

        # Base Distance
        distance = edge.get("distance", 1.0)

        # 3. Crowd Congestion Multiplier
        mult_u = self.manager.concourse_congestion.get(u, 1.0)
        mult_v = self.manager.concourse_congestion.get(v, 1.0)
        congestion_multiplier = max(mult_u, mult_v)

        cost = distance * congestion_multiplier

        # 4. Security Queue wait penalty (if routing starts or goes through a gate)
        # 1 minute wait = 84 meters of walking (based on 1.4 m/s walking speed)
        if node_u.get("category") == "gate":
            wait_time = self.manager.gate_security_wait.get(u, 0.0)
            cost += wait_time * 84.0
        if node_v.get("category") == "gate":
            wait_time = self.manager.gate_security_wait.get(v, 0.0)
            cost += wait_time * 84.0

        return float(cost)

    def solve_dijkstra(self, start: str, end: str, accessibility_mode: bool) -> Tuple[List[str], float]:
        """
        Runs a standard Dijkstra shortest-path search on the stadium graph.

        Parameters:
            start (str): The node ID where the path starts.
            end (str): The destination node ID.
            accessibility_mode (bool): If True, filters out steps with stairs/elevators issues.

        Returns:
            Tuple[List[str], float]: The reconstructed list of node IDs forming the path,
                                     and the total computed dynamic weight.
        """
        # Adjacency list
        adj: Dict[str, List[Tuple[str, Dict[str, Any]]]] = {}
        for node_id in self.manager.nodes:
            adj[node_id] = []

        for edge in self.manager.edges:
            u, v = edge["source"], edge["destination"]
            adj[u].append((v, edge))
            adj[v].append((u, edge)) # Undirected graph

        # Dijkstra distances
        distances = {node_id: float('inf') for node_id in self.manager.nodes}
        previous: Dict[str, Optional[str]] = {node_id: None for node_id in self.manager.nodes}
        distances[start] = 0.0

        # Priority Queue: (cost, node_id)
        pq = [(0.0, start)]

        while pq:
            current_dist, u = heapq.heappop(pq)

            if u == end:
                break

            if current_dist > distances[u]:
                continue

            for v, edge in adj[u]:
                cost = self.get_edge_cost(u, v, edge, accessibility_mode)
                if cost == float('inf'):
                    continue

                new_dist = current_dist + cost
                if new_dist < distances[v]:
                    distances[v] = new_dist
                    previous[v] = u
                    heapq.heappush(pq, (new_dist, v))

        if distances[end] == float('inf'):
            return [], float('inf')

        # Reconstruct path
        path = []
        curr: Optional[str] = end
        while curr is not None:
            path.append(curr)
            curr = previous[curr]
        path.reverse()

        return path, distances[end]

    def calculate_route(self, request: RouteRequest) -> RouteResponse:
        start = request.start_node_id
        end = request.end_node_id
        acc_mode = request.accessibility_mode

        if start not in self.manager.nodes or end not in self.manager.nodes:
            raise ValueError("Invalid start or end node ID")

        path, total_cost = self.solve_dijkstra(start, end, acc_mode)

        if not path:
            return RouteResponse(
                path_nodes=[],
                path_steps=[],
                total_distance=0.0,
                estimated_time=0.0,
                accessible=acc_mode,
                crowd_congestion_level=1.0,
                reason_explanation="No accessible route found."
            )

        # Calculate real physical distance (sum of edge distances)
        total_distance = 0.0
        congestion_multipliers = []
        path_steps = []

        # Build path steps details
        for i, node_id in enumerate(path):
            node = self.manager.nodes[node_id]

            # Simple description generation
            if i == 0:
                desc = f"Start at {node['name']}."
            elif i == len(path) - 1:
                desc = f"Arrive at destination: {node['name']}."
            else:
                desc = f"Proceed through {node['name']}."

            path_steps.append(RouteStep(
                node_id=node_id,
                name=node["name"],
                x=node["x"],
                y=node["y"],
                z=node["z"],
                description=desc
            ))

            # Distance accumulation
            if i > 0:
                u, v = path[i-1], path[i]
                for edge in self.manager.edges:
                    if (edge["source"] == u and edge["destination"] == v) or \
                       (edge["source"] == v and edge["destination"] == u):
                        total_distance += edge["distance"]
                        congestion_multipliers.append(max(
                            self.manager.concourse_congestion.get(u, 1.0),
                            self.manager.concourse_congestion.get(v, 1.0)
                        ))
                        break

        avg_congestion = sum(congestion_multipliers) / len(congestion_multipliers) if congestion_multipliers else 1.0

        # Estimated time: 1.4 m/s walking speed + any gate wait times along the path
        # 1.4 m/s = 84 meters / minute
        walking_time = total_distance / 84.0

        # Check if gate waits are encountered
        total_gate_wait = 0.0
        for node_id in path:
            node = self.manager.nodes[node_id]
            if node["category"] == "gate":
                total_gate_wait += self.manager.gate_security_wait.get(node_id, 0.0)

        estimated_time = round(walking_time + total_gate_wait, 1)

        # GenAI Explanation outline (reason_explanation will be grounded by ai_service or custom formatter)
        explanation = f"Suggested path uses {len(path_steps)} steps. Total distance is {round(total_distance, 1)}m with an estimated travel time of {estimated_time} minutes."

        return RouteResponse(
            path_nodes=path,
            path_steps=path_steps,
            total_distance=round(total_distance, 1),
            estimated_time=estimated_time,
            accessible=acc_mode,
            crowd_congestion_level=round(avg_congestion, 2),
            reason_explanation=explanation
        )

# Global routing engine instance
routing_engine = RoutingEngine()
