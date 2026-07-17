# Implementation Plan — StadiumFlow AI Enhancements (V2)

This plan outlines the design and integration of new interactive elements for StadiumFlow AI, aligning with both the user's design suggestions (visual crowd levels, quick-navigate controls, matches/brackets, and player cards) and the PRD V2 evaluation blueprint.

---

## Proposed Features & Enhancements

### 1. 3D Background Parallax & Football Theme
- **Background:** Replace the solid dark background with a high-quality stadium theme background. We will use CSS transforms mapped to cursor movement (`mousemove` event listener) to create a subtle, premium 3D shifting effect.
- **Logo:** Replace the simple navigation icon with a custom SVG Soccer Ball logo featuring neon glowing drop-shadows and a cyan/blue gradient ring.

### 2. User-Friendly Quick-Navigation UI
- Add a simplified, clean **Quick-Navigation Widget** in the Fan Dashboard (inspired by the provided `StadiumIQ` layout) containing:
  - "Where are you now?" dropdown.
  - "Destination Type" quick-action buttons: Restroom, Food Stall, First Aid, Prayer Room.
  - A toggle for "Step-free Route".
  - A clean "Step-by-step Directions" panel showing distances and estimated walking times.
- **Map Enhancement:** Add crowd percentage text labels directly over the main concourse segments on the 3D map to make it immediately understandable without relying on color codes alone.

### 3. Matches Explorer & Tournament Bracket
- Add a new **"Match Center"** tab/section in the Fan Dashboard featuring:
  - **Live & Upcoming Match Card:** Displays current World Cup matches (e.g., Spain vs Argentina), live scoreboards, match minute, and key events (goals, yellow cards).
  - **Past Matches Results:** Scoreboards of completed matches.
  - **Interactive Tournament Bracket:** A visual knockout stage bracket showing the progression from Quarterfinals ➜ Semifinals ➜ Finals.

### 4. 3D Player Status Cards
- Create a **Player Roster** containing 3 prominent players (e.g., Lionel Messi, Kylian Mbappé, and Pedri).
- Design glowing 3D cards that flip/tilt on hover (using CSS 3D perspectives).
- Front of Card: Player photo, team, position, and status flag (*Fit / Starting XI / Injured*).
- Back of Card: Radar-like stats (Goals, Assists, Pass Accuracy, Physical Rating).

### 5. Multilingual Support (English, Hindi, and Spanish)
- Add **Spanish (`es`)** translations in `translator.js`.
- Add Spanish to the language dropdown in the landing page, headers, and AI service configurations so that all routes, timelines, recommendations, and AI answers support Spanish dynamically.

### 6. Light / Dark Theme Toggle
- Add a CSS-based **Light Theme** class (`.light-theme`) in `index.css` defining custom light variable tokens (e.g., lighter backgrounds, crisp borders, dark text).
- Integrate a theme toggle button (with a sun/moon icon) in the header in `App.jsx` to switch between Light and Dark modes.

### 7. Grounded AI Companion Expansion (Player/Match Data)
- **Backend Data Stores:** Create static mock data files `backend/app/data/matches.json` and `backend/app/data/players.json`.
- **AI Context Integration:** Modify the `ContextBuilder` and `ai_service.py` to inject matches and player stats into the Gemini system prompt whenever the user asks questions about teams, schedules, or players (e.g., "Messi ki current form kaisi hai?" or "Aaj ka match schedule kya hai?").

### 8. Auto-Polling Sync Loop
- Setup a 5-second background interval polling fetch in both `FanDashboard.jsx` and `OperatorDashboard.jsx` so that scenario changes (e.g., gate closures) are immediately reflected across maps, timelines, and routing calculations.

### 9. Required V2 Evaluation Documents
- Create the 7 required docs under `docs/` to guarantee a 97.5+ evaluation score:
  - `docs/architecture.md`
  - `docs/security.md`
  - `docs/accessibility.md`
  - `docs/genai-usage.md`
  - `docs/performance.md`
  - `docs/testing.md`
  - `docs/evaluation-mapping.md`

---

## Proposed Changes

### [Component: Data & Configuration]
#### [NEW] [matches.json](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/backend/app/data/matches.json)
- Store structured data for live, upcoming, and past matches, and the tournament bracket structure.

#### [NEW] [players.json](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/backend/app/data/players.json)
- Store stats, team info, and current matchday status for key players.

---

### [Component: Backend Services]
#### [MODIFY] [context_builder.py](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/backend/app/services/context_builder.py)
- Add methods to include player and match details in the system prompt context.

#### [MODIFY] [ai_service.py](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/backend/app/services/ai_service.py)
- Update system instructions to enable answering queries about players and schedules in English, Hindi, and Spanish.

---

### [Component: Frontend UI]
#### [MODIFY] [translator.js](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/services/translator.js)
- Expand `DICTIONARY` with `es` (Spanish) language translations.

#### [MODIFY] [LandingPage.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/pages/LandingPage.jsx)
- Implement custom SVG Soccer Ball logo with neon glow.
- Add mousemove listener to apply CSS parallax translate/rotate offsets to a stadium background wrapper.

#### [MODIFY] [App.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/App.jsx)
- Add Light/Dark mode state and toggle control in the header.

#### [MODIFY] [index.css](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/index.css)
- Define variables for `.light-theme`.
- Style the parallax background wrapper and stadium map visual badges.

#### [MODIFY] [FanDashboard.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/pages/FanDashboard.jsx)
- Add tabs for "Stadium Map", "Match Center", and "Player Profiles".
- Implement Quick-Navigation widget inside the map view.
- Setup `setInterval` auto-polling (5s) for live state updates.

#### [MODIFY] [StadiumMap.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/components/StadiumMap.jsx)
- Overlay numeric crowd level percentage badges on concourse sectors.

#### [NEW] [MatchCenter.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/components/MatchCenter.jsx)
- A clean UI rendering live matches, scoreboard, and interactive tournament brackets.

#### [NEW] [PlayerCards.jsx](file:///c:/Users/chait/Documents/HACKATHON/FIFA%20WORLD%20CUP/frontend/src/components/PlayerCards.jsx)
- A component rendering 3D-tilting player cards.

---

## Verification Plan

### Automated Tests
- Run `pytest` to ensure all existing backend tests pass.
- Write new backend tests verifying `/api/assistant` correctly processes player, schedule, and Spanish language contexts.

### Manual Verification
- Launch both servers and verify the landing page's 3D parallax effect shifts smoothly.
- Interact with the Quick-Navigation buttons to see if routes update instantly.
- Inject a scenario from the Operator Dashboard and verify the Fan Dashboard auto-syncs and updates the map within 5 seconds.
- Toggle between Light and Dark mode to confirm consistent, appealing visual styling.
- Switch language to Spanish and check translations across all screens.
- Query the AI Companion: *"Tell me about Lionel Messi"* and *"Today's match schedule"* and check if it answers using the grounded mock data.
