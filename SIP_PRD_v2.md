# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Space Intelligence Platform (SIP)

---

| Field | Details |
|---|---|
| **Product Name** | Space Intelligence Platform (SIP) |
| **Version** | 2.1 — Advanced Production Grade |
| **Date** | May 2026 |
| **Owner** | Shubham |
| **Status** | Ready for Engineering |
| **Document Purpose** | Complete implementation reference for LLM-assisted development |

---

## HOW TO USE THIS DOCUMENT

This PRD is structured for direct LLM consumption. Each section is self-contained and can be passed individually with a targeted prompt. Use the following pattern:

```
"You are a senior full-stack engineer. I am building a production-grade Space Intelligence Platform.
Here is the complete PRD: [paste PRD].
Your task: [specific task, e.g., implement Section 4.2 using FastAPI + PostgreSQL + React].
Follow all constraints in Section 5 (Technical Architecture). Return production-ready code."
```

---

## TABLE OF CONTENTS

1. Executive Summary
2. Problem Statement
3. Target Users & Personas
4. Product Vision & Philosophy
5. Core Modules Overview
6. Detailed Feature Specifications
   - 6.1 Satellite Intelligence Module
   - 6.2 Mission Intelligence & Live Tracker
   - 6.3 Rocket Systems Explorer
   - 6.4 Failure Intelligence Engine
   - 6.5 AI Explanation & Verification Layer
   - 6.6 Space Analytics Dashboard
   - 6.7 3D Visualization Engine
   - 6.8 Alerts & Awareness System
   - 6.9 Interactive Learning System
   - 6.10 Owner Intelligence Module (Private)
   - 6.11 Community Notes & Ideas Board
   - 6.12 Space News & Media Aggregator
   - 6.13 Astronaut Intelligence Module
   - 6.14 Space Weather & Geomagnetic Monitor
   - 6.15 Exoplanet & Deep Space Explorer
   - 6.16 API Marketplace & Developer Hub
   - 6.17 Mission Timeline Builder (Visual)
   - 6.18 Compare Engine
   - 6.19 Asteroid Threat & Near-Earth Object Monitor
   - 6.20 Lunar & Martian Base Explorer
   - 6.21 Space Economy & Market Intelligence Module
   - 6.22 AI "Mission Architect" Agent
   - 6.23 WebXR / AR Integration (Virtual Space)
   - 6.24 Space Law, Policy & Sustainability Monitor
   - 6.25 Real-Time Amateur Radio / Comms Intercept
7. Technical Architecture
   - 7.1 Backend
   - 7.2 Frontend
   - 7.3 Database Schema
   - 7.4 External APIs & Data Sources
   - 7.5 Infrastructure & DevOps
   - 7.6 Security
   - 7.7 Performance Requirements
8. Development Phases & Milestones
9. Non-Functional Requirements
10. Constraints & Assumptions
11. Success Metrics & KPIs
12. Unique Selling Points
13. Glossary

---

## 1. EXECUTIVE SUMMARY

The Space Intelligence Platform (SIP) is a production-grade, full-stack web application that serves as the most comprehensive public-facing space intelligence system available. It transforms raw space data into deeply understandable, visually rich, and AI-powered intelligence for general users, students, researchers, and educators — while providing the product owner (Shubham) with a private, real-time rocket telemetry and personal intelligence dashboard.

SIP aggregates data from 15+ authoritative space APIs, applies AI-powered explanations via Groq (LLaMA 3), and delivers interactive 3D visualizations, live launch tracking, failure analysis, space weather monitoring, astronaut tracking, exoplanet data, and a community-driven ideas board.

**Core differentiator:** SIP is not a data dump. Every piece of data surfaces with context, explanation, historical significance, and interactivity. The Failure Intelligence Engine — a forensic breakdown of every major rocket/mission failure — is a USP found nowhere else at this depth.

---

## 2. PROBLEM STATEMENT

### 2.1 Current Landscape Gaps

| Problem | Impact |
|---|---|
| Space data exists across dozens of fragmented APIs and websites | Users spend hours piecing together information |
| Rocket/mission failures are rarely explained with engineering depth publicly | Loss of educational and safety value |
| Live launch tracking is limited to official webcasts with no interactivity | Passive consumption, no context |
| AI tools answer space questions without verification from authoritative sources | Risk of hallucination and misinformation |
| No single platform visualizes satellite positions, rocket anatomy, mission timelines, and failure history together | Disconnected user experience |
| Space weather impacts on satellites/humans are not communicated clearly to non-experts | Public unaware of real risks |

### 2.2 Opportunity

A unified, AI-augmented, visually immersive platform can become the definitive public resource for space intelligence — not just for enthusiasts but for students, journalists, policy researchers, and anyone curious about humanity's activity in space.

---

## 3. TARGET USERS & PERSONAS

### Persona 1: The Curious Explorer (Primary, 60%)
- Age: 16–35
- Background: General public, science enthusiasts, students
- Goal: Understand space in plain language with visuals
- Pain point: Wikipedia is text-heavy; space agency sites are jargon-heavy

### Persona 2: The Researcher / Educator (15%)
- Age: 25–55
- Background: Teachers, science communicators, junior researchers
- Goal: Access structured, citable data about missions, failures, and satellites
- Pain point: Data is scattered, inconsistent, and lacks analytical context

### Persona 3: The Space Nerd / Enthusiast (20%)
- Age: 18–45
- Background: Rocketry hobbyists, aerospace engineering students
- Goal: Deep-dive into rocket systems, telemetry, failure engineering
- Pain point: Technical information exists but is siloed across forums, papers, and wikis

### Persona 4: The Owner — Shubham (Private, 1%)
- Goal: Personal real-time intelligence during live launches, private dashboard, and build/manage the platform
- Access: Exclusive Owner Intelligence Module with telemetry simulation, private notes, and admin controls

---

## 4. PRODUCT VISION & PHILOSOPHY

> **"Not just data — but understanding. Not just facts — but intelligence."**

SIP operates on four pillars:

1. **Comprehensiveness** — Every active satellite, every rocket family, every major mission failure, every astronaut in space.
2. **Clarity** — Every technical concept explained in plain language via AI, with sources.
3. **Interactivity** — 3D models, live sliders, orbit visualizers, comparison tools — users explore, not just read.
4. **Integrity** — All AI-generated explanations are verified against primary sources. Hallucination prevention is built into the AI layer.

---

## 5. CORE MODULES OVERVIEW

| # | Module | Access | Priority |
|---|---|---|---|
| 1 | Satellite Intelligence | Public | P0 |
| 2 | Mission Intelligence & Live Tracker | Public | P0 |
| 3 | Rocket Systems Explorer | Public | P0 |
| 4 | Failure Intelligence Engine | Public | P0 (USP) |
| 5 | AI Explanation & Verification Layer | Public | P0 |
| 6 | Space Analytics Dashboard | Public | P1 |
| 7 | 3D Visualization Engine | Public | P1 |
| 8 | Alerts & Awareness System | Public | P1 |
| 9 | Interactive Learning System | Public | P2 |
| 10 | Owner Intelligence Module | Private (Owner only) | P0 |
| 11 | Community Notes & Ideas Board | Public + Private | P2 |
| 12 | Space News & Media Aggregator | Public | P1 |
| 13 | Astronaut Intelligence Module | Public | P1 |
| 14 | Space Weather & Geomagnetic Monitor | Public | P1 |
| 15 | Exoplanet & Deep Space Explorer | Public | P2 |
| 16 | API Marketplace & Developer Hub | Public | P3 |
| 17 | Mission Timeline Builder | Public | P2 |
| 18 | Compare Engine | Public | P2 |
| 19 | Asteroid Threat & NEO Monitor | Public | P2 |
| 20 | Lunar & Martian Base Explorer | Public | P2 |
| 21 | Space Economy & Market Intelligence | Public | P2 |
| 22 | AI "Mission Architect" Agent | Public | P3 |
| 23 | WebXR / AR Integration | Public | P3 |
| 24 | Space Law & Sustainability Monitor | Public | P2 |
| 25 | Real-Time Amateur Radio Intercept | Public | P3 |

---

## 6. DETAILED FEATURE SPECIFICATIONS

---

### 6.1 SATELLITE INTELLIGENCE MODULE

**Purpose:** Real-time tracking and intelligence for all active, inactive, and debris satellites in Earth orbit.

#### Features

**6.1.1 Live Satellite Map**
- Interactive 2D world map (Leaflet.js) + optional 3D globe (Three.js/CesiumJS) showing real-time satellite positions.
- Color-coded by satellite type: weather, communications, ISS, military (publicly known), debris, GPS, Earth observation.
- Click any satellite to open its intelligence card (see 6.1.3).
- Orbit trace: display the next 90-minute ground track.
- Filters: by country, agency, orbit type (LEO/MEO/GEO/HEO), launch year, operational status.

**6.1.2 Satellite Database**
- Full database powered by CelesTrak TLE data (auto-refreshed every 6 hours).
- Fields per satellite: NORAD ID, name, COSPAR ID, launch date, country of origin, operator, orbit type, altitude (perigee/apogee), inclination, period, operational status, decay date (if known), estimated mass, dimensions (where available), mission type, notes.
- Searchable and filterable table with pagination.
- Sort by: altitude, launch date, country, type, operational status.

**6.1.3 Satellite Intelligence Card**
- Auto-generated card per satellite with:
  - Current position (lat/long/altitude), velocity, footprint radius.
  - Real-time pass predictions for the user's location (next 5 passes with time, max elevation, direction).
  - Historical context: launch mission, notable events, anomalies.
  - AI-generated summary of the satellite's purpose and importance (via Groq).
  - Link to relevant failure events (if applicable).
  - TLE data display with explanation of what each field means (interactive tooltip).

**6.1.4 ISS Tracker (Dedicated)**
- Full-page ISS tracker with: real-time position, altitude, velocity, current crew (names, nationalities, duration in space), current experiment roster, docking status (Soyuz/Crew Dragon/HTV), orbital parameters, next pass for user location.
- AI-powered "What's happening on the ISS right now?" summary updated every 30 minutes.

**6.1.5 Space Debris Intelligence**
- Dedicated debris layer on the satellite map.
- Statistics dashboard: total tracked objects, debris by origin event (Fengyun-1C ASAT, Cosmos 954, etc.), conjunction analysis (publicly known near-misses).
- AI explanation of the Kessler Syndrome and current debris risk.

**Data Sources:** CelesTrak (TLE), N2YO API (pass predictions, position), NASA Horizons (ephemeris), ISS-mimic public data.

---

### 6.2 MISSION INTELLIGENCE & LIVE TRACKER

**Purpose:** Track all past, present, and upcoming space missions with deep contextual intelligence.

#### Features

**6.2.1 Mission Database**
- Comprehensive database of missions: crewed, uncrewed, planetary, lunar, solar, commercial.
- Fields: mission name, agency/operator, launch vehicle, launch date, destination, current status (active/complete/failed/in-transit), objectives, current phase, next milestone.
- Data source: Launch Library 2 (The Space Devs API) + manual curation for historical missions.

**6.2.2 Live Launch Tracker**
- Dashboard showing all launches in the next 30 days with countdown timers.
- Launch card per mission: vehicle, payload, launch site, NET (No Earlier Than), launch window, webcast link (YouTube embedded), weather go/no-go (if public data available), probability of on-time launch (based on historical pad/vehicle data).
- Status auto-updates every 60 seconds via polling Launch Library 2.
- Push notification system (browser notifications opt-in): alert user 1 hour before launch, at T-10 min, and at liftoff.

**6.2.3 Mission Intelligence Cards**
- Auto-generated per mission with:
  - Mission overview, objectives, science goals.
  - Trajectory visualization (SVG/Canvas animation for interplanetary missions).
  - Instrument/payload breakdown with AI explanations.
  - Mission phases timeline (interactive horizontal scroll).
  - Current telemetry or status (where publicly available).
  - Related failure analysis (if a prior mission in the series failed).

**6.2.4 Historical Mission Archive**
- Full archive back to Sputnik (1957). Filter by decade, agency, destination (Earth orbit / Moon / Mars / Venus / Outer Planets / Sun / Asteroid / Comet), success/failure, crewed/uncrewed.
- Timeline visualization: horizontal scrollable mission history with milestones marked.
- AI-generated "This Week in Space History" module — what missions launched/landed/failed on this week in history.

**6.2.5 Active Planetary Missions Monitor**
- Real-time distance display for all active planetary missions (Voyager 1 & 2, New Horizons, Perseverance, Ingenuity, JWST, etc.) using NASA Horizons API.
- Light-time delay display.
- Data transmission rate context.

**Data Sources:** Launch Library 2 (The Space Devs), NASA Open APIs, SpaceX public API, ESA Open Data, JAXA public data.

---

### 6.3 ROCKET SYSTEMS EXPLORER

**Purpose:** Provide deep, visual, interactive technical intelligence on every major launch vehicle family.

#### Features

**6.3.1 Rocket Database**
- All major active and historical rocket families: Falcon 9, Falcon Heavy, Starship, Artemis SLS, Atlas V, Delta IV Heavy, Vulcan Centaur, Antares, Electron, Ariane 5/6, Soyuz, Proton, GSLV Mk III, PSLV, Long March, H3, New Glenn, New Shepard, Vega, and historical (Saturn V, Energia, N1, etc.).
- Fields per rocket: name, operator, country, height, diameter, total mass, LEO/GTO/TLI/Mars payload capacity, propellant type (per stage), engine model, thrust, Isp (sea level + vacuum), number of engines per stage, fairing diameter, reusability status, first flight, total launches, successes, failures, current status.

**6.3.2 Interactive Rocket Anatomy Viewer**
- 2D SVG annotated diagram of each rocket with clickable parts.
- Parts include: first stage, second stage, fairing, payload adapter, interstage, engine bell, grid fins, landing legs, propellant tanks (LOX, RP-1, LH2, MMH, N2O4, solid propellant), avionics bay, stage separation mechanism, payload bay.
- Clicking any part opens an AI-explained tooltip: what it does, how it works, why it matters.
- Optionally toggle to 3D view using Three.js (where model is available).

**6.3.3 Engine Deep Dive**
- Dedicated engine database: Merlin 1D, Raptor 3, RS-25, RL-10, Rutherford, Vikas, CE-20, RD-180, NK-33, J-2, F-1, etc.
- Fields: engine type (gas generator, staged combustion, electric pump, solid), propellants, thrust (sea level + vacuum), Isp, chamber pressure, nozzle expansion ratio, restart capability, development history, notable use.
- Comparison tool: select up to 4 engines and compare across all parameters.

**6.3.4 Rocket Performance Calculator**
- Input: payload mass, target orbit (LEO/GEO/TLI/Mars transfer), launch site latitude.
- Output: recommended rocket options, performance margin, cost estimate (where public data is available), fairing compatibility.
- Uses Tsiolkovsky rocket equation under the hood with known stage parameters.

**6.3.5 Reusability Tracker**
- For reusable boosters (Falcon 9, New Glenn): track individual booster IDs, flight count, landing status (drone ship/LZ), turnaround time, refurbishment history.
- Data pulled from SpaceX public API + manual curation.

---

### 6.4 FAILURE INTELLIGENCE ENGINE

**Purpose:** SIP's core USP — the most comprehensive, publicly accessible forensic breakdown of space mission and launch vehicle failures. Educational, analytical, and never sensationalized.

#### Features

**6.4.1 Failure Database**
- Curated database of failures categorized by:
  - Launch vehicle failures (ascent, stage separation, engine-out, guidance, fairing, upper stage)
  - Spacecraft failures (attitude control, power, communication, thermal, software)
  - Human spaceflight incidents (Apollo 1, Soyuz T-10-1, Challenger, Columbia, Soyuz 11)
  - Near-misses and anomalies (Apollo 13, Gemini 8)
  - Pad explosions (Amos-6, Vanguard TV3, etc.)
  - On-orbit failures (satellite anomalies, debris events)
- Fields per failure event: mission name, date, agency, vehicle, failure phase, root cause (primary + contributing), failure mode, detection method, outcome (total loss / partial loss / crew survived / crew lost), lessons learned, corrective actions taken, subsequent missions modified, investigation report reference.

**6.4.2 Failure Intelligence Card**
- Rich narrative breakdown per failure:
  - Timeline of events (T-0 to failure moment to investigation outcome).
  - Engineering failure mode tree (fault tree diagram, SVG-rendered).
  - AI-generated plain-language explanation of what went wrong and why.
  - AI-verified cross-reference: cites actual investigation reports (Challenger: Rogers Commission; Columbia: CAIB; etc.).
  - "What changed after this?" section — specifically what modifications were made to prevent recurrence.
  - Related failures: other incidents with similar root causes.

**6.4.3 Failure Pattern Analytics**
- Aggregate analysis: which phase of flight sees the most failures? (ascent vs. separation vs. orbital insertion vs. re-entry).
- Root cause distribution chart: software, structural, thermal, human error, design flaw, manufacturing defect, foreign object debris (FOD), propulsion.
- Agency comparison: comparative failure rates by agency, adjusted for number of missions.
- Time trend: are failures decreasing over decades? (spoiler: yes, with nuance).

**6.4.4 Interactive Failure Timeline**
- Horizontal scrollable timeline of all major failures from 1957 to present.
- Filter by agency, vehicle family, crew/uncrewed, mission type.
- Click any event to expand the full failure card.

**6.4.5 "Lessons From Space" Educational Series**
- AI-generated, human-reviewed educational articles. Topics: O-ring failure mechanics; software integer overflow (Ariane 5); propulsion anomalies; human factors in spaceflight decisions.
- Each article 500–1000 words, with diagrams, linked to real failure events in the database.

**AI Integration Notes:** AI explanations cite the original investigation reports where available. The system explicitly flags: "This explanation is based on [Rogers Commission Report, 1986] and [NASA SP-2003-SP-2003-4192]."

---

### 6.5 AI EXPLANATION & VERIFICATION LAYER

**Purpose:** Wrap every complex concept, data point, and failure analysis with AI-powered, source-verified explanations. Prevent hallucination through a dual-verification system.

#### Features

**6.5.1 Dual-Verification Architecture**
- Every AI-generated explanation goes through a two-step process:
  1. **Primary generation:** Groq (LLaMA 3 70B) generates explanation with a strict system prompt: "You are a space systems engineer. Explain the following in plain language. Base your explanation only on established aerospace engineering principles. Do NOT speculate. Cite any relevant historical events."
  2. **Verification pass:** A second prompt sends the explanation back and asks: "Identify any factual claims in this explanation that could be incorrect or unverifiable. List them." If issues are flagged, the explanation is revised or a disclaimer is shown.
- Confidence score (0–100%) displayed for each explanation.
- Source links displayed where applicable.

**6.5.2 "Explain This" Universal Button**
- Present on every data card, chart, parameter, and technical term across the entire platform.
- One click → AI explanation panel slides in (without leaving current page).
- User can adjust explanation level: "Explain like I'm 10" / "Explain like I'm an engineer" / "Give me the math."

**6.5.3 Terminology Glossary (AI-Powered)**
- Every technical term underlined with dotted line. Hover = short tooltip. Click = full AI-explained glossary entry.
- 500+ pre-loaded aerospace terms with explanations, visual diagrams, and cross-links to related concepts.
- User can submit new terms for inclusion.

**6.5.4 Q&A Interface**
- Conversational AI assistant (Groq-powered) with space-specific context injected.
- Context: current page data (satellite, mission, failure, etc.) is automatically injected into the conversation context.
- Conversation history stored in session (not persisted beyond session for public users).
- Rate-limited: 20 questions per session per IP.
- Owner has unlimited access with persistent conversation history.

**6.5.5 AI Content Audit Log (Admin)**
- Owner-visible log of all AI generations, confidence scores, and verification results.
- Allows flagging and correcting any AI-generated content that slips past verification.

---

### 6.6 SPACE ANALYTICS DASHBOARD

**Purpose:** High-level analytical intelligence — trends, statistics, comparisons across the entire space industry.

#### Features

**6.6.1 Launch Statistics**
- Launches per year (bar chart, 1957–present) by agency, by country, by vehicle family.
- Success rate over time (line chart).
- Current year pace vs. historical average.
- Launches by orbit type, payload class (small/medium/heavy/super heavy).

**6.6.2 Payload Analytics**
- Total mass launched to orbit per year (kg), by country, by operator.
- Commercial vs. government payload trends.
- Megaconstellation tracking: Starlink, OneWeb, Kuiper — satellites launched, operational, deorbited.

**6.6.3 Cost Analytics**
- Launch cost per kg to LEO over time (logarithmic chart) — SpaceX cost reduction story visualized.
- Rocket cost comparison table (where public data is available; flagged as estimated where not).

**6.6.4 Agency Intelligence Cards**
- Dedicated intelligence cards per agency: NASA, ESA, Roscosmos, ISRO, CNSA, JAXA, SpaceX, ULA, Rocket Lab, Blue Origin, Arianespace.
- Card includes: active missions, planned launches (next 12 months), recent successes/failures, budget (where public), key programs, historical stats.

**6.6.5 Space Economy Tracker**
- Commercial space funding rounds (publicly disclosed).
- Number of commercial launch providers by year.
- Satellite internet market share by constellation size.

---

### 6.7 3D VISUALIZATION ENGINE

**Purpose:** Make space tangible through immersive 3D visuals.

#### Features

**6.7.1 3D Orbit Simulator**
- WebGL-based (Three.js) 3D Earth with real-time satellite orbits visualized as orbital shells.
- Select multiple satellites and visualize their orbits simultaneously.
- Time control: fast-forward at 1x/10x/100x/1000x simulation speed.
- Toggle orbital shells: ISS orbit, GPS constellation, Starlink shell, GEO ring.

**6.7.2 3D Rocket Model Viewer**
- Three.js-based 3D rocket models for major vehicles.
- Parts are annotated and clickable (linked to Rocket Systems Explorer).
- Launch animation: rocket ascent from pad through atmosphere to orbit insertion.
- Stage separation visualization.
- Engine bell glow effect during burn phases.

**6.7.3 Solar System Navigator**
- Interactive 3D solar system with all major bodies and active mission trajectories.
- Click a planet/body to see missions en route, in orbit, or landed.
- NASA Horizons API for real positions of planets and spacecraft.

**6.7.4 Launch Site 3D Map**
- 3D terrain maps of major launch sites (using Mapbox GL or Cesium terrain):
  - Kennedy Space Center, Vandenberg, Baikonur, Satish Dhawan (Sriharikota), Kourou, Wenchang, Tanegashima, Mahia (Rocket Lab).
- Pad locations marked. Historical pad usage timeline.

---

### 6.8 ALERTS & AWARENESS SYSTEM

**Purpose:** Keep users informed proactively without requiring them to actively monitor the platform.

#### Features

**6.8.1 Launch Alerts**
- Browser push notification opt-in.
- Alert types: T-24h, T-1h, T-10min, Liftoff, MECO, Separation, Orbit achieved, Mission success/failure.
- Select which agencies/vehicle families to follow.

**6.8.2 Satellite Pass Alerts**
- User provides location (or grants GPS permission).
- Alert for upcoming ISS passes, Starlink train passes, bright satellite events (Iridium flares).
- Alert includes: time, direction, max elevation, duration.

**6.8.3 Space Weather Alerts**
- Real-time alerts for: G1–G5 geomagnetic storms, solar flare (C/M/X class), high-energy particle events (solar proton events), KP index spikes.
- Plain-language impact explanation: "A G3 storm is in progress. GPS accuracy may be reduced. Aurora visible at latitudes as low as 50°."
- Data source: NOAA Space Weather Prediction Center (SWPC) API.

**6.8.4 Debris Conjunction Alerts**
- Public conjunction data (where available from Space-Track.org or equivalent).
- Alert when a significant conjunction event is publicly reported.

---

### 6.9 INTERACTIVE LEARNING SYSTEM

**Purpose:** Transform SIP into an educational tool for students and educators.

#### Features

**6.9.1 Space Quizzes**
- 500+ questions across difficulty levels: beginner, intermediate, expert.
- Categories: orbital mechanics, rocket propulsion, mission history, space biology, space physics, notable failures.
- Adaptive difficulty: quiz adjusts based on user performance.
- Leaderboard (optional, with username).

**6.9.2 Mission Simulator (Text-Based)**
- Choose a mission profile (ISS resupply, Mars flyby, lunar landing, satellite deployment).
- Text + visual simulation: user makes GO/NO-GO decisions at each phase.
- Consequences of wrong decisions shown (failure scenarios linked to real failure database).

**6.9.3 Orbital Mechanics Sandbox**
- Interactive tool where users can set orbital parameters (altitude, inclination, eccentricity) and visualize the resulting orbit in real time.
- Demonstrate Hohmann transfer, inclination change maneuvers, deorbit burns.
- Delta-v budget calculator.

**6.9.4 "Space Explained" Article Library**
- 100+ AI-generated, human-reviewed articles on: how rockets work, what satellites do, life in microgravity, the history of the space race, how re-entry works, what causes weightlessness, etc.
- Tagged by level: beginner / intermediate / expert.
- Audio read-aloud option (browser TTS).

**6.9.5 Educator Tools**
- "Classroom mode": simplified UI, no ads, larger text, curated content for specific grade levels.
- Downloadable fact sheets per topic (auto-generated PDF).
- Lesson plan templates linked to module content.

---

### 6.10 OWNER INTELLIGENCE MODULE (PRIVATE — SHUBHAM ONLY)

**Purpose:** Exclusive personal intelligence dashboard for the product owner. Real-time rocket telemetry simulation, private analytics, and platform management.

**Access Control:** Single-user JWT authentication. Hardcoded owner credentials (hashed with bcrypt). No registration or password reset flow. Token expires in 8 hours. Refresh token mechanism for persistent sessions.

#### Features

**6.10.1 Owner Dashboard**
- Summary view: platform stats (total page views, active users, API call counts, error rates), latest community ideas submitted, upcoming launches in next 7 days, current space weather status.
- One-click shortcuts to all owner-exclusive tools.

**6.10.2 Live Rocket Telemetry Slider**
- Activates automatically when a launch is detected as active (Launch Library 2 status = "Go" or "In Flight").
- UI: Full-width vertical or horizontal mission timeline slider showing phases: T-0 → Liftoff → Max-Q → MECO → Stage Sep → Fairing Sep → Coast Phase → SECO → Payload Deployment → Mission Success/Failure.
- Each phase slider node is clickable — clicking shows:
  - What should be happening at this phase (based on vehicle profile).
  - Simulated telemetry parameters: altitude, velocity, downrange distance, acceleration (g-load), propellant remaining (%), attitude (pitch/yaw/roll estimate).
  - Live vs. estimated indicator: green = live API data; yellow = simulated from historical vehicle profile; grey = not available.
- Rocket anatomy diagram (from 6.3) updates in sync: parts highlight/animate as relevant (engine glow during burn, stage detaches at separation, fairing opens, etc.).

**6.10.3 Telemetry Data Sources & Realism**
- Data hierarchy (priority order):
  1. Official webcast-derived events via Launch Library 2 event endpoints.
  2. SpaceX public API: `/launches/latest` — vehicle data, launch site, payload, success/failure.
  3. Historical telemetry profiles from open sources (SpaceX telemetry repos, community-sourced flight profiles per vehicle).
  4. Simulated telemetry using known rocket performance parameters (from Rocket Systems Explorer database) and physics-based estimation.
- All simulated/estimated values are clearly labeled "Estimated / Simulated — not official telemetry."
- Accuracy disclaimer displayed permanently during live view.

**6.10.4 Self-Updating Mechanism**
- Backend background task (FastAPI BackgroundTasks or Celery beat) polls Launch Library 2 every 10 seconds during active launches.
- WebSocket connection (FastAPI + WebSockets) pushes updates to owner frontend in real time.
- Auto-triggers telemetry slider when launch status changes to "In Flight."
- Push notification to owner device at T-30 min, T-10 min, Liftoff.
- Slider auto-advances based on elapsed time from T-0, cross-referenced with known phase durations for that vehicle.

**6.10.5 Private Notes System**
- Markdown-enabled personal note editor (Monaco editor or CodeMirror).
- Tags: by mission, by module, by date, by priority.
- Search across all notes.
- Auto-save (every 30 seconds to PostgreSQL).
- Export notes as Markdown or PDF.

**6.10.6 Custom Rocket Configuration (Owner)**
- Define custom rocket configurations: modify existing vehicle parameters or create new hypothetical vehicles.
- Feed into the Performance Calculator (6.3.4) and Orbital Mechanics Sandbox (6.9.3).
- Save configurations with names and notes.

**6.10.7 AI Content Management Panel**
- View all AI-generated content flagged with low confidence scores.
- Edit, approve, or delete AI-generated explanations directly from the panel.
- Re-trigger AI generation for any content card.
- Monitor Groq API token usage.

**6.10.8 Platform Analytics (Owner Admin)**
- Real-time user session count, geographic distribution (heatmap), most-visited modules, most-searched terms.
- API usage per endpoint (calls/hour), error rate, latency percentiles (p50/p95/p99).
- Community ideas board moderation: approve, reject, comment on submitted ideas.

---

### 6.11 COMMUNITY NOTES & IDEAS BOARD

**Purpose:** Collect community feature suggestions and foster engagement, with full moderation control by the owner.

#### Features

**6.11.1 Anonymous Idea Submission**
- No login required. Form fields: title, description (max 500 chars), category (dropdown: Visualization / Failure Analysis / New Rocket / UI / Feature / Bug / Other), optional email for updates.
- Rate-limited: 3 submissions per IP per 24 hours.
- CAPTCHA (hCaptcha, privacy-preserving) on submission form.
- Submissions go into a "Pending" queue — not publicly visible until owner approves.

**6.11.2 Public Ideas Board**
- Approved ideas displayed as cards sorted by: newest / most voted / trending.
- Each card: title, description, category, vote count, status badge (New / Under Review / In Progress / Implemented / Declined), comment count.
- Voting: one upvote per IP per idea (no login required for voting).
- Comment threads: anonymous comments on each idea (rate-limited, moderated).

**6.11.3 Owner Moderation Interface**
- Approve/reject pending submissions with one click.
- Add owner comment to any idea (shown as highlighted/pinned).
- Change status of ideas (e.g., "In Progress" when work begins, "Implemented" on launch).
- Pin important ideas to top of board.
- Bulk actions: approve all pending, delete spam, etc.

**6.11.4 Status Integration**
- When an idea is marked "Implemented," it links to the feature in the platform.
- "In Progress" ideas show estimated release phase (from Development Phases section).

---

### 6.12 SPACE NEWS & MEDIA AGGREGATOR

**Purpose:** Keep users updated with latest space news aggregated from authoritative sources, with AI-powered summaries.

#### Features

**6.12.1 News Feed**
- Real-time news feed aggregated from: Spaceflight Now, NASASpaceFlight.com, Space.com, The Planetary Society, ESA News, NASA News, SpaceX press kit, Rocket Lab press releases — via RSS/Atom feeds.
- AI-generated 2-sentence summary per article (Groq).
- Categorize by: Launch News / Mission Update / Science Discovery / Policy & Funding / Commercial Space / Failure & Anomaly.
- Filter by category, agency, date range.
- "Save Article" (stored in browser localStorage for public users; PostgreSQL for owner).

**6.12.2 Contextual News Integration**
- When viewing a satellite, mission, or rocket, the news feed automatically filters to show news articles related to that specific topic.
- "Latest News" tab on every intelligence card.

**6.12.3 "Today in Space" Daily Digest**
- Auto-generated daily digest (AI-compiled, Groq): top 5 space news items of the day + "This day in space history" + upcoming launch within 24 hours.
- Displayed on platform homepage.
- Available as email newsletter (opt-in, basic email collection + SendGrid).

---

### 6.13 ASTRONAUT INTELLIGENCE MODULE

**Purpose:** Complete intelligence on every astronaut — past, present, and future crew members.

#### Features

**6.13.1 Astronaut Database**
- All astronauts (NASA, ESA, Roscosmos, JAXA, CNSA, commercial, private) past and present.
- Fields: name, nationality, agency, status (active/retired/deceased), total missions, total time in space (days, hours, minutes), spacewalks (count + total EVA time), current location (ISS / Earth / future mission), biography, notable missions, records held.

**6.13.2 Current Crew in Space**
- Real-time display of all humans currently in space: ISS crew, any other crewed spacecraft.
- Data: Open Notify API + Launch Library 2 + manual curation.
- Card per astronaut: name, country, mission, days in space (live counter), current activity (if public data available).

**6.13.3 Astronaut Intelligence Card**
- Full profile per astronaut.
- Mission history timeline.
- AI-generated biography summary.
- Medical/physiological notes: known health effects from long-duration missions (publicly reported).
- Records & milestones (e.g., Scott Kelly: 1-year mission; Peggy Whitson: most time in space by a NASA astronaut).

**6.13.4 Future Crew Manifest**
- Upcoming crewed missions with assigned crew members.
- Countdown timers per mission.

---

### 6.14 SPACE WEATHER & GEOMAGNETIC MONITOR

**Purpose:** Real-time monitoring and plain-language explanation of space weather events and their impacts.

#### Features

**6.14.1 Space Weather Dashboard**
- Real-time display of:
  - KP index (0–9 geomagnetic storm scale) with live gauge.
  - Solar wind speed (km/s) and density (protons/cm³).
  - Interplanetary magnetic field (Bz component — southward = storm risk).
  - X-ray solar flux (GOES satellite data — C/M/X flare detection).
  - Proton flux (solar energetic particle events).
  - DST index (disturbance storm time — ring current activity).
- Data source: NOAA SWPC API (real-time data feeds, 1-minute cadence).

**6.14.2 Aurora Forecast**
- KP-based aurora visibility map: which latitudes are likely to see aurora.
- Local aurora probability for user's location (based on KP + geographic latitude).
- 3-day Kp forecast (from NOAA SWPC).

**6.14.3 Impact Intelligence**
- For every space weather event, AI explains:
  - Impact on GPS accuracy (L-band signal scintillation).
  - Impact on HF radio communications.
  - Impact on satellite operations (drag increase in LEO during storms).
  - Impact on power grids (geomagnetically induced currents in transmission lines).
  - Impact on astronaut radiation dose (during spacewalks or polar flights).
- Specific historical event comparisons: "This G4 storm is comparable to the Halloween Storms of October 2003, which caused..."

**6.14.4 Solar Event Database**
- Historical record of major solar events: Carrington Event (1859), March 1989 blackout, Halloween Storms (2003), May 2024 G5 storm.
- Impact reports and AI explanations.

---

### 6.15 EXOPLANET & DEEP SPACE EXPLORER

**Purpose:** Extend intelligence beyond the solar system to discovered exoplanets and deep space observations.

#### Features

**6.15.1 Exoplanet Database**
- Integration with NASA Exoplanet Archive API.
- Filter by: discovery method (transit, radial velocity, direct imaging, microlensing), host star type, planet radius, orbital period, equilibrium temperature (habitable zone indicator), discovery year, discovery mission (Kepler, TESS, etc.).
- Habitability score display (based on Earth Similarity Index where calculable).

**6.15.2 Exoplanet Intelligence Cards**
- Per-planet card: orbital parameters, size comparison to Earth, host star data, distance (light-years), detection method, discovery story, atmospheric characterization status (JWST observations if available).
- AI-generated "Could life exist here?" explainer (clearly framed as scientific hypothesis, not speculation).

**6.15.3 JWST Discoveries Feed**
- Latest JWST science releases (NASA API + STScI RSS).
- Image gallery with AI-generated plain-language explanations of each image and discovery.
- Links to official press releases.

**6.15.4 Star Map Integration**
- Interactive star map (via Aladin Lite or similar) showing host star positions for selected exoplanets.
- Overlay JWST deep field images.

---

### 6.16 API MARKETPLACE & DEVELOPER HUB

**Purpose:** Allow developers to access SIP's curated, value-added data layer via a public API.

#### Features

**6.16.1 SIP Public REST API**
- Endpoints:
  - `GET /api/v1/satellites` — satellite list with filters
  - `GET /api/v1/satellites/{norad_id}` — satellite detail + current position
  - `GET /api/v1/launches` — upcoming/recent launches
  - `GET /api/v1/missions/{id}` — mission detail
  - `GET /api/v1/failures` — failure database with filters
  - `GET /api/v1/rockets` — rocket database
  - `GET /api/v1/space-weather/current` — current space weather snapshot
  - `GET /api/v1/astronauts/current-in-space` — current crew in space
- Authentication: API key (issued after email registration). Free tier: 100 requests/day. Future paid tiers.

**6.16.2 API Documentation**
- Auto-generated OpenAPI (Swagger) docs at `/api/docs`.
- Interactive API explorer in the developer hub.
- Code examples in Python, JavaScript, and cURL.

**6.16.3 Rate Limiting & Abuse Prevention**
- Rate limiting via FastAPI middleware (SlowAPI) per API key and per IP.
- Abuse detection: flag keys exceeding 10x expected usage pattern.

---

### 6.17 MISSION TIMELINE BUILDER (VISUAL)

**Purpose:** Allow users to build and visualize custom mission timelines for learning or planning.

#### Features

- Drag-and-drop timeline builder: add phases (launch, coast, burn, separation, orbit insertion, landing, etc.) with custom durations.
- Annotate each phase with notes and resource links.
- Export as PNG or PDF.
- Share via unique URL (stored in PostgreSQL, 90-day expiry for anonymous users).
- Pre-loaded templates: Falcon 9 to ISS profile, Lunar Gateway insertion, Mars transfer trajectory.

---

### 6.18 COMPARE ENGINE

**Purpose:** Side-by-side comparison of any two entities across all major categories.

#### Features

- Compare any two of: rockets, missions, agencies, satellites (by class), astronauts, failure events.
- Auto-generates comparison table with AI-generated summary of key differences and which is "better" by which metric (with full caveats and context).
- Share comparison via URL.
- "Tournament mode": users vote to compare and rank rockets/missions bracket-style — community-driven.

---

### 6.19 ASTEROID THREAT & NEAR-EARTH OBJECT (NEO) MONITOR

**Purpose:** Track Potentially Hazardous Asteroids (PHAs) and planetary defense efforts.

#### Features

- **6.19.1 Live Close-Approach Dashboard**: Uses NASA CNEOS data to display upcoming asteroid flybys, complete with distance (LD/AU), estimated diameter, and relative velocity.
- **6.19.2 Torino Impact Hazard Scale**: Visualizer mapping current known objects on the Torino scale. AI-generated context to explain the difference between a near-miss and a statistical anomaly.
- **6.19.3 Planetary Defense Tracker**: Deep-dive into missions like DART and Hera, showing orbital deflection mechanics.
- **6.19.4 3D Orbit Intersector**: Visualization showing Earth's orbit and the crossing paths of PHAs.

---

### 6.20 LUNAR & MARTIAN BASE EXPLORER

**Purpose:** Detailed mapping and intelligence for planetary surfaces and future colonization.

#### Features

- **6.20.1 Interactive Planetary Globes**: 3D globes of the Moon (LRO data) and Mars (MRO data).
- **6.20.2 Base Proposal Overlays**: Toggle visibility for planned Artemis landing zones, SpaceX Starbase proposals, and international lunar research stations.
- **6.20.3 Historical Rover Paths**: Trace the actual driven routes of Curiosity, Perseverance, Zhurong, and Apollo lunar rovers.
- **6.20.4 Resource Mapping**: Visualize known deposits of water ice and optimal continuous-solar sites for power generation.

---

### 6.21 SPACE ECONOMY & MARKET INTELLIGENCE MODULE

**Purpose:** Track the commercialization and financial metrics of the space industry.

#### Features

- **6.21.1 Funding Tracker**: Monitor private space startup funding rounds, valuations, and M&A activity.
- **6.21.2 Launch Cost Analytics**: Visualized trends of launch cost-per-kg to LEO over time across different providers.
- **6.21.3 Public Markets Dashboard**: Track public space company stock performance (e.g., Rocket Lab, Spire, Planet) alongside major government contract awards (NASA CLPS, NSSL).

---

### 6.22 AI "MISSION ARCHITECT" AGENT

**Purpose:** A conversational tool that helps users design hypothetic space missions.

#### Features

- **6.22.1 Conversational Design Interface**: Users input prompts like: "I want to send 500kg to Mars orbit. What's my cheapest option?"
- **6.22.2 Orchestration Layer**: The AI utilizes the Rocket Database, Orbital Mechanics Sandbox, and Payload limits to assemble a realistic mission architecture.
- **6.22.3 Output Generation**: Produces a customized "Mission Proposal" document with vehicle selection, estimated delta-v budget, cost estimation, and timeline.

---

### 6.23 WEBXR / AR INTEGRATION (VIRTUAL SPACE)

**Purpose:** Bring the 3D Engine into the user's physical environment via AR/VR.

#### Features

- **6.23.1 "View in your room" AR Mode**: WebXR integration allowing users to place 1:1 scale or miniaturized 3D Rocket Anatomy models in their physical space via mobile browsers.
- **6.23.2 Virtual Space Station Tours**: VR-compatible 3D walkthroughs of the ISS or upcoming commercial space stations (e.g., Axiom Station, Orbital Reef).

---

### 6.24 SPACE LAW, POLICY & SUSTAINABILITY MONITOR

**Purpose:** Provide intelligence on the legal framework and sustainability of space operations.

#### Features

- **6.24.1 Orbital Sustainability Score (OSS)**: An AI-generated rating for satellite operators based on their debris mitigation practices, collision avoidance maneuvering frequency, and end-of-life disposal success.
- **6.24.2 Treaty & Policy Tracker**: Database of international agreements (Outer Space Treaty, Artemis Accords signatories) with AI plain-language summaries.
- **6.24.3 Frequency Allocation Maps**: Visualizations of ITU filings for radio frequencies by major satellite constellations.

---

### 6.25 REAL-TIME AMATEUR RADIO / COMMS INTERCEPT

**Purpose:** Allow users to literally "listen" to space by integrating open radio networks.

#### Features

- **6.25.1 Ground Station Integration**: Hook into open-source ground station networks (like SatNOGS) to pull live waterfall displays and telemetry.
- **6.25.2 Live Audio Feeds**: Stream available live audio from the ISS HAM radio or decoded weather satellite (NOAA APT) imagery directly to the user's dashboard.

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Backend

**Framework:** FastAPI (Python 3.12+)  
**ASGI Server:** Uvicorn with Gunicorn process manager  
**Task Queue:** Celery with Redis broker (for background jobs: API polling, alert dispatch, AI generation)  
**WebSockets:** FastAPI native WebSocket support (for Owner telemetry slider)  
**Caching:** Redis (TTL-based caching for external API responses)

**API Structure:**
```
/api/v1/
  /satellites/
  /launches/
  /missions/
  /rockets/
  /failures/
  /astronauts/
  /space-weather/
  /news/
  /exoplanets/
  /owner/ (protected — JWT required)
  /admin/ (protected — owner only)
  /public-api/ (rate-limited external API)
```

**Key Middleware:**
- CORS (configured for frontend domain only in production)
- Rate limiting (SlowAPI — per IP and per API key)
- Request logging (structured JSON logs → centralized logging service)
- JWT authentication middleware for protected routes
- Global error handler (returns structured error responses)

### 7.2 Frontend

**Framework:** React 18 with TypeScript  
**Build Tool:** Vite  
**UI Library:** Tailwind CSS + shadcn/ui components  
**State Management:** Zustand (global) + React Query (server state / API caching)  
**3D Engine:** Three.js with React Three Fiber  
**Maps:** Leaflet.js (2D satellite map) + optional Cesium (3D globe)  
**Charts:** Recharts + D3.js for custom visualizations  
**Real-time:** Native WebSocket API (connected to FastAPI WebSocket endpoint for owner telemetry)  
**Markdown:** react-markdown with remark-gfm (for notes, articles)  
**Code Editor (Owner):** Monaco Editor (note-taking, config editing)

**Frontend Architecture:**
```
src/
  components/       # Shared UI components
  modules/          # Feature modules (one folder per PRD module)
  pages/            # Route-level pages
  hooks/            # Custom React hooks
  services/         # API call functions
  store/            # Zustand stores
  utils/            # Helper functions
  types/            # TypeScript type definitions
  assets/           # Static assets
```

### 7.3 Database Schema

**Primary Database:** PostgreSQL 16  
**ORM:** SQLAlchemy 2.0 (async) with Alembic migrations  
**In-memory Cache:** Redis 7

**Core Tables:**

```sql
-- satellites
CREATE TABLE satellites (
  id SERIAL PRIMARY KEY,
  norad_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  cospar_id VARCHAR(50),
  launch_date DATE,
  country VARCHAR(100),
  operator VARCHAR(255),
  orbit_type VARCHAR(50),       -- LEO, MEO, GEO, HEO, SSO
  altitude_perigee_km FLOAT,
  altitude_apogee_km FLOAT,
  inclination_deg FLOAT,
  period_min FLOAT,
  status VARCHAR(50),           -- active, inactive, debris, partial
  tle_line1 TEXT,
  tle_line2 TEXT,
  tle_epoch TIMESTAMP,
  mission_type VARCHAR(100),
  mass_kg FLOAT,
  ai_summary TEXT,
  ai_confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- rockets
CREATE TABLE rockets (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  operator VARCHAR(255),
  country VARCHAR(100),
  height_m FLOAT,
  diameter_m FLOAT,
  mass_kg FLOAT,
  leo_capacity_kg FLOAT,
  gto_capacity_kg FLOAT,
  propellant_type_stage1 VARCHAR(100),
  propellant_type_stage2 VARCHAR(100),
  engine_stage1 VARCHAR(100),
  engine_stage2 VARCHAR(100),
  thrust_stage1_kn FLOAT,
  isp_vacuum_s FLOAT,
  reusable BOOLEAN DEFAULT FALSE,
  first_flight DATE,
  total_launches INTEGER DEFAULT 0,
  total_successes INTEGER DEFAULT 0,
  status VARCHAR(50),          -- active, retired, development
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- launches
CREATE TABLE launches (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(100) UNIQUE, -- Launch Library 2 ID
  name VARCHAR(255) NOT NULL,
  rocket_id INTEGER REFERENCES rockets(id),
  launch_site VARCHAR(255),
  net_datetime TIMESTAMP,          -- No Earlier Than
  window_start TIMESTAMP,
  window_end TIMESTAMP,
  status VARCHAR(50),              -- go, hold, in_flight, success, failure, tbd
  mission_type VARCHAR(100),
  orbit VARCHAR(50),
  payload_name VARCHAR(255),
  payload_mass_kg FLOAT,
  webcast_url TEXT,
  agency VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- failures
CREATE TABLE failures (
  id SERIAL PRIMARY KEY,
  mission_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  agency VARCHAR(255),
  vehicle VARCHAR(255),
  launch_id INTEGER REFERENCES launches(id),
  failure_phase VARCHAR(100),      -- ascent, separation, orbit, re-entry, pad
  primary_cause VARCHAR(255),
  root_cause_category VARCHAR(100), -- software, structural, thermal, human_error, propulsion
  failure_mode_detail TEXT,
  outcome VARCHAR(100),            -- total_loss, partial_loss, crew_survived, crew_lost
  crew_involved BOOLEAN DEFAULT FALSE,
  investigation_report_url TEXT,
  lessons_learned TEXT,
  corrective_actions TEXT,
  ai_summary TEXT,
  ai_confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- astronauts
CREATE TABLE astronauts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nationality VARCHAR(100),
  agency VARCHAR(100),
  status VARCHAR(50),              -- active, retired, deceased
  total_missions INTEGER DEFAULT 0,
  total_time_in_space_hours FLOAT DEFAULT 0,
  total_eva_count INTEGER DEFAULT 0,
  total_eva_hours FLOAT DEFAULT 0,
  current_location VARCHAR(100),   -- ISS, Earth, vehicle_name
  bio TEXT,
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- community_ideas
CREATE TABLE community_ideas (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  submitter_email VARCHAR(255),    -- optional, for updates
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, in_progress, implemented
  vote_count INTEGER DEFAULT 0,
  owner_comment TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  ip_hash VARCHAR(64),             -- hashed IP for rate limiting / dupe detection
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- owner_notes
CREATE TABLE owner_notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT NOT NULL,
  tags TEXT[],
  linked_module VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- api_keys (for developer hub)
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key_hash VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  tier VARCHAR(50) DEFAULT 'free', -- free, pro
  daily_limit INTEGER DEFAULT 100,
  daily_usage INTEGER DEFAULT 0,
  usage_reset_at DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 External APIs & Data Sources

| API / Source | Purpose | Update Frequency | Auth |
|---|---|---|---|
| CelesTrak (celestrak.org) | TLE data for all satellites | Every 6 hours | None (public) |
| N2YO API | Satellite pass predictions, live position | Real-time (on-demand) | API key |
| Launch Library 2 (The Space Devs) | Launch data, mission data, events | Every 60s (active launches), every 6h otherwise | None / API key for higher rate |
| SpaceX Public API (api.spacexdata.com) | SpaceX launches, rockets, boosters | Every 60s | None |
| NASA Open APIs (api.nasa.gov) | APOD, Mars photos, Exoplanet Archive, DONKI (space weather) | Varies | API key |
| NASA Horizons API (ssd.jpl.nasa.gov) | Ephemeris for solar system bodies, active probes | On-demand | None |
| Open Notify API (open-notify.org) | Current people in space, ISS position | Real-time | None |
| NOAA SWPC API (services.swpc.noaa.gov) | Space weather: KP index, solar wind, flares | 1-minute cadence | None |
| NASA Exoplanet Archive (exoplanetarchive.ipac.caltech.edu) | Exoplanet database | Weekly | None |
| STScI / JWST (api.stsci.edu) | JWST images and releases | On new release | None |
| Groq API (api.groq.com) | LLaMA 3 70B for AI explanations and Q&A | On-demand | API key |
| hCaptcha | CAPTCHA for idea submissions | On submission | Site key |
| SendGrid | Email newsletter / pass alerts | On-demand | API key |
| Spaceflight News API (spaceflightnewsapi.net) | News aggregation | Every 15 min | None |
| NASA CNEOS (ssd-api.jpl.nasa.gov) | Asteroid close approach data | Daily | None |
| SatNOGS Network API | Live amateur satellite comms & telemetry | Real-time | None |
| Space Financial APIs (AlphaVantage/Polygon) | Stock tracking for space companies | Daily | API key |

**API Caching Strategy:**
- TLE data: Redis cache, 6-hour TTL. Background Celery task refreshes before expiry.
- Launch data: Redis cache, 60-second TTL during active launches, 10-minute TTL otherwise.
- Space weather: Redis cache, 1-minute TTL.
- AI summaries: PostgreSQL (permanent), re-generated only when source data changes significantly or manually triggered.

### 7.5 Infrastructure & DevOps

**Hosting Target (Production):**
- Backend: Single VPS (DigitalOcean Droplet or Hetzner) — 4 vCPU, 8GB RAM minimum. Docker containers.
- Frontend: Vercel or Netlify (static build + CDN).
- Database: Managed PostgreSQL (Supabase or Railway or DigitalOcean Managed DB).
- Redis: Managed Redis (Upstash or DigitalOcean Managed Redis).
- Media/Assets: Cloudflare R2 (S3-compatible object storage).

**Containerization:**
```
docker-compose.yml
  services:
    backend (FastAPI + Uvicorn)
    worker (Celery)
    beat (Celery beat — scheduled tasks)
    redis
    nginx (reverse proxy + SSL termination)
```

**CI/CD:**
- GitHub Actions: on push to `main` → run tests → build Docker image → push to registry → deploy to VPS via SSH.
- Branch strategy: `main` (production), `develop` (staging), feature branches.
- Automated testing: pytest (backend), Vitest (frontend), Playwright (E2E).

**Monitoring & Observability:**
- Application monitoring: Sentry (error tracking for both frontend and backend).
- Uptime monitoring: Better Uptime or UptimeRobot.
- Logs: Structured JSON logs → Loki (or Papertrail for simplicity).
- Metrics: Prometheus + Grafana (or simpler: Datadog / New Relic free tier).
- Alerts: PagerDuty or simple email/Slack webhook for critical errors.

**Backup:**
- PostgreSQL: daily automated backup to Cloudflare R2 or S3, 30-day retention.
- Redis: persistence enabled (AOF), snapshotted daily.

### 7.6 Security

**Authentication (Owner Module):**
- bcrypt-hashed credentials stored in environment variable (not in database — single user, no need for DB row).
- JWT access token (8-hour expiry), refresh token (30-day expiry, stored in httpOnly cookie).
- All `/owner/` and `/admin/` routes require valid JWT.
- HTTPS-only (TLS via Let's Encrypt / Cloudflare).

**General Security:**
- All environment variables: stored in `.env` files, never committed to git. Production secrets via CI/CD secrets store or Doppler.
- SQL injection prevention: SQLAlchemy ORM with parameterized queries (never raw SQL with user input).
- XSS prevention: React escapes all user-generated content by default; DOMPurify for any HTML rendering.
- CSRF: Not applicable (SPA + JWT; no session cookies for public routes).
- Content Security Policy (CSP) headers configured in Nginx.
- Rate limiting on all public endpoints (SlowAPI).
- Input validation: Pydantic models for all request bodies (FastAPI).
- Dependency scanning: Dependabot or Snyk in CI/CD.
- Regular `npm audit` and `pip-audit` in CI pipeline.

### 7.7 Performance Requirements

| Metric | Target |
|---|---|
| Page Load (initial) | < 3 seconds on 4G |
| API Response (cached) | < 100ms |
| API Response (uncached) | < 1 second |
| Satellite map render (500 satellites) | < 2 seconds |
| 3D rocket viewer load | < 4 seconds |
| WebSocket latency (owner telemetry) | < 500ms |
| AI explanation generation | < 5 seconds (Groq is fast) |
| Concurrent users (Phase 1 target) | 100 concurrent |
| Database queries | All hot paths use indexed columns |

**Frontend Performance:**
- Code splitting per route (Vite dynamic imports).
- Lazy loading for 3D components (Three.js loaded only when user navigates to relevant module).
- Image optimization: WebP format, lazy loading, Cloudflare CDN.
- React Query caching: stale time 5 minutes for most data, 30 seconds for launch status.

---

## 8. DEVELOPMENT PHASES & MILESTONES

### Phase 1 — Foundation & MVP (Months 1–2)
**Goal:** Working platform with core data and basic interactivity.

Deliverables:
- [ ] Backend: FastAPI project scaffold, database models, Alembic migrations.
- [ ] Database: PostgreSQL setup, all core tables created.
- [ ] Data Pipeline: Celery tasks for CelesTrak TLE sync, Launch Library 2 sync.
- [ ] Module 6.1: Satellite Intelligence — 2D map + satellite database + intelligence card (no AI yet).
- [ ] Module 6.2: Mission Intelligence — launch tracker with countdown timers.
- [ ] Module 6.3: Rocket Systems Explorer — database + 2D anatomy viewer.
- [ ] Module 6.4: Failure Intelligence Engine — database + failure cards (no AI yet).
- [ ] Module 6.13: Astronaut Module — current crew in space display.
- [ ] Frontend: React + Vite scaffold, routing, basic UI components (Tailwind + shadcn).
- [ ] Owner Module (stub): Login page + JWT auth working. Basic owner dashboard.
- [ ] Deployment: Docker Compose, Nginx, VPS deployment, CI/CD pipeline.

### Phase 2 — Intelligence Layer (Months 3–4)
**Goal:** AI integration, real-time data, owner telemetry, and media.

Deliverables:
- [ ] Module 6.5: AI Explanation Layer — Groq integration, dual-verification, "Explain This" button.
- [ ] Module 6.6: Space Analytics Dashboard — launch statistics charts, agency cards.
- [ ] Module 6.8: Alerts & Awareness — browser push notifications for launches.
- [ ] Module 6.10: Owner Intelligence Module — live telemetry slider, WebSocket updates.
- [ ] Module 6.12: News Aggregator — RSS feed pipeline, AI summaries.
- [ ] Module 6.14: Space Weather Monitor — NOAA SWPC integration, aurora forecast.
- [ ] ISS Tracker: Full dedicated page.
- [ ] Redis caching layer: Implement caching for all external API calls.
- [ ] Rate limiting: Implement SlowAPI middleware.

### Phase 3 — Visualization & Engagement (Months 5–6)
**Goal:** 3D visuals, interactive learning, and community features.

Deliverables:
- [ ] Module 6.7: 3D Visualization Engine — Three.js orbit simulator, rocket viewer, solar system.
- [ ] Module 6.9: Interactive Learning System — quizzes, orbital mechanics sandbox.
- [ ] Module 6.11: Community Notes & Ideas Board — full submission + moderation + voting.
- [ ] Module 6.15: Exoplanet Explorer — NASA Exoplanet Archive integration.
- [ ] Module 6.17: Mission Timeline Builder.
- [ ] Module 6.18: Compare Engine.
- [ ] Owner Module: Full owner dashboard with AI content management panel.
- [ ] Performance optimization: lazy loading, code splitting audit, CDN.

### Phase 4 — Advanced & Expansion (Months 7–9)
**Goal:** Developer API, advanced owner tools, deep space features, and scale.

Deliverables:
- [ ] Module 6.16: API Marketplace & Developer Hub — public REST API, API keys, docs.
- [ ] Module 6.10.6: Custom Rocket Configuration (Owner).
- [ ] Module 6.9.2: Mission Simulator.
- [ ] Email newsletter system (SendGrid).
- [ ] Educator tools (classroom mode, downloadable fact sheets).
- [ ] Load testing and performance optimization for 1000+ concurrent users.
- [ ] Advanced monitoring: Prometheus + Grafana dashboard.
- [ ] Mobile responsiveness audit and optimization.

### Phase 5 — Next-Gen Intelligence (Months 10–12)
**Goal:** Introduce AR/VR, interactive conversational AI architects, planetary base mapping, and deep space radio integration.

Deliverables:
- [ ] Module 6.19: Asteroid Threat & NEO Monitor.
- [ ] Module 6.20: Lunar & Martian Base Explorer.
- [ ] Module 6.21: Space Economy & Market Intelligence Module.
- [ ] Module 6.22: AI "Mission Architect" Agent.
- [ ] Module 6.23: WebXR / AR Integration (Rocket models in AR).
- [ ] Module 6.24: Space Law, Policy & Sustainability Monitor (OSS Scoring).
- [ ] Module 6.25: Real-Time Amateur Radio / Comms Intercept (SatNOGS).

---

## 9. NON-FUNCTIONAL REQUIREMENTS

**Availability:** 99.5% uptime SLA (allows ~3.6 hours downtime/month). Achieved via: server monitoring, auto-restart containers, health checks.

**Scalability:** Architecture must support horizontal scaling of the FastAPI backend (stateless design, all state in PostgreSQL/Redis). Add more Uvicorn workers or additional VPS nodes behind a load balancer if needed.

**Maintainability:**
- All code documented with docstrings (Python) and JSDoc/TypeScript types (frontend).
- No "magic numbers" — all constants defined in a central config.
- All external API interactions abstracted into dedicated service modules (e.g., `services/celestrak.py`, `services/launch_library.py`).
- Database schema changes via Alembic migrations only — no manual schema edits in production.

**Accessibility:** WCAG 2.1 AA compliance target. Semantic HTML, keyboard navigation, ARIA labels, sufficient color contrast, alt text for all images.

**Internationalization:** English only for Phase 1–3. Architecture should use i18n-ready patterns (no hardcoded UI strings) for future localization.

**Data Freshness:**
- TLE data: < 6 hours old.
- Launch status: < 60 seconds old during active launches.
- Space weather: < 2 minutes old.
- News: < 15 minutes old.
- Astronaut in-space data: < 1 hour old.

---

## 10. CONSTRAINTS & ASSUMPTIONS

**Technical Constraints:**
- True real-time rocket telemetry (exact altitude/velocity streams) is NOT publicly available for most launches. The Owner Telemetry Slider will use: official event data from Launch Library 2 + physics-based simulation from known vehicle profiles + historical telemetry repos where available. All simulated values are clearly labeled.
- SpaceX real-time telemetry (from webcasts) is video-only and not accessible via API. Community-sourced telemetry data will be used as supplementary data where legally permissible.
- AI responses are probabilistic. The dual-verification layer reduces but does not eliminate hallucination risk. All AI content is labeled with a confidence score and marked as AI-generated.
- NOAA SWPC free API has no SLA — space weather data may have brief outages during solar storms (ironically, when it's most needed). Implement graceful degradation with cached last-known values.

**Business Constraints:**
- Budget: Minimal (lean startup / personal project). Favor free tiers and open-source solutions. Avoid per-request paid APIs for high-volume data (use free tier / public APIs).
- Owner is the sole developer and decision-maker. All feature decisions are logged in the Owner Notes module.
- No commercial advertisements in any module.

**Regulatory Assumptions:**
- All satellite data used is publicly available via CelesTrak / N2YO (no classified military TLE data).
- Space weather data from NOAA is public domain.
- News aggregation via RSS is permissible under standard RSS feed terms.
- User IP addresses stored only as hashed values (SHA-256) for rate limiting purposes — not in plain text.
- No PII collected from public users except optional email for newsletter (opt-in, GDPR-compliant with clear consent).

---

## 11. SUCCESS METRICS & KPIs

### Phase 1 (MVP)
- Platform live and stable for 30 days without critical downtime.
- All 5 MVP modules functional with real data.
- Satellite map renders 500+ satellites in < 2 seconds.
- Owner can log in and view the owner dashboard.

### Phase 2 (Intelligence)
- AI explanations generating with < 5s response time.
- Owner telemetry slider self-updating during next real launch event.
- Launch alerts sending correctly at T-1h and liftoff.
- < 1% AI explanation error rate (tracked via owner AI audit log).

### Phase 3 (Growth)
- 3D visualizations load without WebGL errors on 95% of test devices.
- Community ideas board: first 10 approved submissions.
- Quiz completion rate > 60% (users who start, finish).

### Phase 4 (Scale)
- 100 registered API developers (free tier).
- 1000+ monthly active users.
- Page load time < 3s on 4G for 95% of page loads.
- Uptime > 99.5% over trailing 30 days.

---

## 12. UNIQUE SELLING POINTS

1. **Failure Intelligence Engine** — The deepest public forensic breakdown of space failures, with fault tree diagrams, investigation report cross-references, and AI explanations. Nothing like it exists in a consumer-facing platform.
2. **AI Explanation with Dual Verification** — Not just AI-generated content, but AI that checks its own work and shows confidence scores and sources.
3. **Owner Intelligence Module** — Private real-time rocket telemetry simulation with self-updating WebSocket architecture and animated rocket anatomy.
4. **Unified Intelligence** — Satellites + missions + rockets + failures + astronauts + space weather + exoplanets, all in one platform with cross-linking.
5. **Interactive Depth** — 3D orbit simulator, orbital mechanics sandbox, mission simulator, rocket performance calculator — not just data tables.
6. **Production Architecture** — Built from the start with Redis caching, Celery background tasks, WebSockets, JWT auth, CI/CD, and monitoring — not a prototype.

---

## 13. GLOSSARY

| Term | Definition |
|---|---|
| TLE | Two-Line Element Set — a standardized format for encoding satellite orbital parameters |
| LEO | Low Earth Orbit — 160–2000 km altitude |
| GEO | Geostationary Orbit — 35,786 km altitude, appears stationary relative to Earth |
| MEO | Medium Earth Orbit — 2000–35,786 km |
| KP Index | Planetary K-index — measures global geomagnetic activity (0=quiet, 9=extreme storm) |
| MECO | Main Engine Cutoff — moment first stage engines stop burning |
| SECO | Second Engine Cutoff — moment upper stage engine stops |
| Max-Q | Maximum dynamic pressure during ascent — highest aerodynamic stress on vehicle |
| Isp | Specific Impulse — measure of rocket engine efficiency (seconds) |
| Delta-v | Change in velocity — fundamental measure of propulsive capability |
| NET | No Earlier Than — earliest possible launch date |
| WebSocket | Bidirectional persistent connection between client and server for real-time data |
| JWT | JSON Web Token — compact, self-contained token for authentication |
| Celery | Distributed task queue for Python — used for background jobs |
| Groq | AI inference provider — runs LLaMA 3 at high speed for AI explanations |
| SWPC | Space Weather Prediction Center (NOAA) — authoritative US space weather agency |
| CAIB | Columbia Accident Investigation Board — investigated STS-107 failure (2003) |
| FOD | Foreign Object Debris — manufacturing contamination that can cause failures |
| EVA | Extravehicular Activity — spacewalk |
| JWST | James Webb Space Telescope |
| NORAD ID | Unique satellite identification number assigned by NORAD |
| COSPAR ID | International satellite designation (e.g., 1957-001B = Sputnik 1) |

---

## 14. PHASE 5 UPGRADES (MAY 2026)

### 14.1 Mission Intelligence Integrity
- **Objective**: Ensure comprehensive coverage of global space missions beyond the default limit.
- **Enhancements**:
  - Increase launch tracking limit to 100+ upcoming missions.
  - Integrate historical "Recent Launches" to capture international data from ISRO (India), CNSA (China), JAXA (Japan), and Roscosmos (Russia).
  - Failure Intelligence: Embed specific image/video links for failed missions directly into the intelligence cards.

### 14.2 Real-Time Astronaut Intelligence (v2.0)
- **Objective**: Move away from outdated public APIs to professional-grade tracking.
- **Enhancements**:
  - Primary source switched to Launch Library 2 (LL2) for astronaut status and location.
  - Comprehensive crew tracking for both the International Space Station (ISS) and Tiangong (Chinese Space Station).
  - Accurate status updates (e.g., verifying Sunita Williams and Butch Wilmore's current mission status).

### 14.3 Space Weather Monitor Reliability
- **Objective**: Resolve data gaps in the geomagnetic monitoring dashboard.
- **Enhancements**:
  - Direct integration with NOAA SWPC JSON feeds as a high-reliability fallback for NASA DONKI.
  - Implement "Live Gauge" visualization for KP Index and Solar Wind Speed.
  - AI "Impact Alert" system to explain current conditions in plain language.

### 14.4 3D Visualization: Interactive Earth Feature
- **Objective**: Provide an immersive 3D perspective of Earth and its satellite environment.
- **Enhancements**:
  - **The "3D Earth Feature"**: High-fidelity Three.js-based interactive globe.
  - Real-time satellite position overlay on the 3D globe.
  - Day/Night cycle visualization based on real-time solar position.
  - Atmosphere and cloud layer rendering for premium aesthetic.

---

*END OF PRD — Space Intelligence Platform v2.1 (Upgraded)*  
*Document prepared for LLM-assisted production development.*  
*Owner: Shubham | Last Updated: May 2026*
