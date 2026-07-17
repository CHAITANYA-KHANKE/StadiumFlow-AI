from backend.app.schemas.recommendation import AlternativeOption, RecommendationRequest, RecommendationResponse
from backend.app.services.live_state_manager import live_state_manager
from backend.app.services.routing_engine import routing_engine


class RecommendationEngine:
    def __init__(self):
        self.manager = live_state_manager
        self.router = routing_engine

    def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Recommends the fastest available facility (restroom, food, medical, info)
        from the user's current location, accounting for both walking transit time
        (via Dijkstra routing cost) and dynamic queue wait times.

        Parameters:
            request (RecommendationRequest): User's current location node, desired category,
                                             and accessibility requirements.

        Returns:
            RecommendationResponse: The recommended option, estimated total transit + wait time,
                                   time saved compared to the closest physical facility, and alternative list.
        """
        current_node = request.current_node_id
        category = request.facility_category
        acc_mode = request.accessibility_mode

        if current_node not in self.manager.nodes:
            raise ValueError("Invalid current node ID")

        # Find all facilities of the target category
        facilities = []
        for n_id, node in self.manager.nodes.items():
            if node["category"] == category:
                # Check if closed
                if n_id in self.manager.facility_closures:
                    continue
                # Accessibility check
                if acc_mode and not node.get("accessible", True):
                    continue
                facilities.append(node)

        if not facilities:
            return RecommendationResponse(
                recommended_option="No facilities available",
                facility_id="",
                estimated_total_time=0.0,
                time_saved=0.0,
                reason_codes=["NO_FACILITIES_AVAILABLE"],
                alternatives=[],
                data_timestamp=self.manager.last_updated,
                confidence=1.0,
                reason_explanation="There are no active or accessible facilities of this category.",
            )

        options = []
        for fac in facilities:
            fac_id = fac["id"]
            # Solve Dijkstra from current node to facility node
            path, cost = self.router.solve_dijkstra(current_node, fac_id, acc_mode)
            if not path:
                continue

            # Calculate actual physical distance (meters)
            distance = 0.0
            for i in range(len(path) - 1):
                u, v = path[i], path[i + 1]
                for edge in self.manager.edges:
                    if (edge["source"] == u and edge["destination"] == v) or (edge["source"] == v and edge["destination"] == u):
                        distance += edge["distance"]
                        break

            # Walking time in minutes (84m/min walking speed)
            walking_time = round(distance / 84.0, 1)
            # Queue waiting time
            queue_time = round(self.manager.facility_queues.get(fac_id, 0.0), 1)
            total_time = round(walking_time + queue_time, 1)

            options.append({"facility_id": fac_id, "name": fac["name"], "walking_time": walking_time, "queue_time": queue_time, "total_time": total_time, "accessible": fac.get("accessible", True)})

        if not options:
            return RecommendationResponse(
                recommended_option="No reachable facilities",
                facility_id="",
                estimated_total_time=0.0,
                time_saved=0.0,
                reason_codes=["NO_REACHABLE_FACILITIES"],
                alternatives=[],
                data_timestamp=self.manager.last_updated,
                confidence=1.0,
                reason_explanation="No facilities are reachable from your current location.",
            )

        # Sort options:
        # Sort by total_time to find the best option
        best_options = sorted(options, key=lambda x: x["total_time"])
        # Sort by walking_time (distance) to find the physically closest option
        closest_options = sorted(options, key=lambda x: x["walking_time"])

        best_opt = best_options[0]
        closest_opt = closest_options[0]

        # Calculate time saved by choosing the best option instead of the closest one
        # If best == closest, time saved is 0
        time_saved = round(closest_opt["total_time"] - best_opt["total_time"], 1)
        if time_saved < 0:
            time_saved = 0.0

        reason_codes = []
        if best_opt["facility_id"] == closest_opt["facility_id"]:
            reason_codes.append("CLOSEST_IS_FASTEST")
        else:
            if best_opt["queue_time"] < closest_opt["queue_time"]:
                reason_codes.append("SHORTER_QUEUE")
            if best_opt["walking_time"] > closest_opt["walking_time"]:
                reason_codes.append("LOWER_CONGESTION")  # Walk slightly farther to avoid queues

        # Build alternative options list (excluding the best one)
        alternatives = []
        for opt in best_options[1:]:
            alternatives.append(AlternativeOption(facility_id=opt["facility_id"], name=opt["name"], walking_time=opt["walking_time"], queue_time=opt["queue_time"], total_time=opt["total_time"], accessible=opt["accessible"]))

        # Build grounded explanation
        explanation = f"Recommended {best_opt['name']} (Estimated total time: {best_opt['total_time']} mins)."
        if time_saved > 0:
            explanation += f" Choosing this option saves you approximately {time_saved} minutes compared to the closest facility ({closest_opt['name']}) due to shorter wait times."

        return RecommendationResponse(
            recommended_option=best_opt["name"],
            facility_id=best_opt["facility_id"],
            estimated_total_time=best_opt["total_time"],
            time_saved=time_saved,
            reason_codes=reason_codes,
            alternatives=alternatives,
            data_timestamp=self.manager.last_updated,
            confidence=0.95 if time_saved > 0 else 0.85,
            reason_explanation=explanation,
        )


# Global recommendation engine instance
recommendation_engine = RecommendationEngine()
