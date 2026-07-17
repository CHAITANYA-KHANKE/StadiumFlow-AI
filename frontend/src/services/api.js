const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('stadiumflow_admin_token') || 'stadiumflow-admin-secret-token';
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const apiService = {
  // Health
  checkHealth: () => apiRequest('/api/health'),

  // Stadium Topology
  getStadium: () => apiRequest('/api/stadium'),

  // Live State
  getLiveState: () => apiRequest('/api/live-state'),

  // Route Calculation
  calculateRoute: (startNodeId, endNodeId, accessibilityMode = false) => 
    apiRequest('/api/route', 'POST', {
      start_node_id: startNodeId,
      end_node_id: endNodeId,
      accessibility_mode: accessibilityMode
    }),

  // Facility Recommendations
  recommendFacility: (currentNodeId, facilityCategory, accessibilityMode = false) =>
    apiRequest('/api/recommend-facility', 'POST', {
      current_node_id: currentNodeId,
      facility_category: facilityCategory,
      accessibility_mode: accessibilityMode
    }),

  // Timeline Generation
  generateTimeline: (section, row, seatNum, gateId, accessibilityMode = false, currentTime = "17:20") =>
    apiRequest('/api/timeline', 'POST', {
      ticket_seat_section: section,
      ticket_seat_row: row,
      ticket_seat_number: seatNum,
      arrival_gate_id: gateId,
      accessibility_mode: accessibilityMode,
      current_time: currentTime
    }),

  // AI Assistant Chat
  chatAssistant: (query, currentNodeId = "gate_a", language = "en") =>
    apiRequest('/api/assistant', 'POST', {
      query,
      current_node_id: currentNodeId,
      language
    }),

  // Operations Dashboard
  getOperationsSummary: () => apiRequest('/api/operations/summary'),

  // What-If Simulation Scenarios
  triggerScenario: (scenarioId) =>
    apiRequest('/api/simulation/scenario', 'POST', {
      scenario_id: scenarioId
    }),

  // Reset Simulation
  resetSimulation: () => apiRequest('/api/simulation/reset', 'POST'),

  // Fan Feedback Loops
  submitFeedback: (locationId, helpful, comment = "") =>
    apiRequest('/api/feedback', 'POST', {
      location_id: locationId,
      helpful,
      comment
    }),

  getFeedbacks: () => apiRequest('/api/feedback'),

  // Matches and Players Mock Databases
  getMatches: () => apiRequest('/api/matches'),
  getPlayers: () => apiRequest('/api/players'),
};
