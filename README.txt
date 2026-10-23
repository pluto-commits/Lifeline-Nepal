
Access Here: https://lifelinenepal.netlify.app/login.html

================================================================================
LIFELINE NEPAL — EMERGENCY ESSENTIAL SUPPLIES COORDINATION PLATFORM
Kathmandu Valley Post-Snap Relief Operations Prototype (2018)
================================================================================

EXACT LOCAL FILE PATH:
file:///e:/Project/index.html   (or file:///e:/Project/Lifeline/index.html)

AUTOMATED TEST RUNNER:
node test/test_lifeline.js

PRODUCT VISION:
"Lifeline Nepal — Transparent, explainable survival logistics for Kathmandu Valley."

--------------------------------------------------------------------------------
1. GEOGRAPHIC CONTEXT & DEMO SETTING (KATHMANDU VALLEY, NEPAL)
--------------------------------------------------------------------------------
Lifeline is tailored specifically for the emergency response in the Kathmandu 
Valley following the sudden Day 1 Post-Snap crisis in 2018.

Administrative Jurisdictions Covered:
  1. Kathmandu Metropolitan City (KMC) — Wards 1 to 32
  2. Lalitpur Metropolitan City (LMC)   — Wards 1 to 29
  3. Bhaktapur Municipality             — Wards 1 to 10

Key Distribution Centres (Fictional Demonstration Facilities):
  - DC-1: Kathmandu Central Relief Hub (Tripureshwor / Dasharath Stadium Grounds)
    Node ID: DC_TRIPURESHWOR | Municipality: Kathmandu Metro (Ward 11)
  - DC-2: Lalitpur Sector Logistics Base (Jawalakhel Public Ground)
    Node ID: DC_JAWALAKHEL   | Municipality: Lalitpur Metro (Ward 4)
  - DC-3: Bhaktapur Emergency Supply Post (Sallaghari Ground, Araniko Corridor)
    Node ID: DC_SALLAGHARI   | Municipality: Bhaktapur Municipality (Ward 1)

Illustrative Demo Data Disclaimer:
All facilities, warehouse stockpiles, ward demand records, road disruption 
conditions, and travel times are marked clearly as "Illustrative Demo Data" 
for product evaluation and operations research testing. They do NOT represent 
active government infrastructure or real-time traffic sensor feeds.

Currency & Units:
  - Currency (where costed): Nepalese Rupees (NPR / रु)
  - Distances: Kilometres (km)
  - Travel Times: Minutes (mins)

--------------------------------------------------------------------------------
2. SEPARATE PORTALS & AUTHENTICATION FLOW
--------------------------------------------------------------------------------
Lifeline features a dedicated Welcome / Authentication Gateway with two 
strictly isolated operational portals:

A. HOUSEHOLD CITIZEN PORTAL (नागरिक सहायता पोर्टल)
   - Purpose: Intake terminal for affected citizens to request essential survival items.
   - Capabilities:
     * Lodge emergency requests for Food Rations, Drinking Water, Medical Kits, 
       and Infant & Family Hygiene supplies.
     * Select Municipality (KMC, LMC, Bhaktapur) and Ward Number (1–32).
     * Specify household quantity, urgency level, and delivery locality details.
     * Receive a unique Request ID (e.g., REQ-NEPAL-01).
     * Track request lifecycle across 7 explicit states:
       - Submitted
       - Under Review
       - Allocated
       - Dispatched
       - Delivered
       - Partially Fulfilled
       - Unfulfilled
     * View requested quantity, allocated quantity, and remaining unmet quantity.
     * Read honest, understandable explanations for shortages and delays.
   - Privacy Enforcement: Strict household privacy isolation. Elena Shrestha 
     (HH-KMC-01) can ONLY view her own family's requests and dashboard. Other 
     citizens' personal details, medical notes, and requests are never exposed.

B. RELIEF COORDINATOR COMMAND DESK (राहत समन्वय कमान्ड)
   - Purpose: Operational decision-making and regional dispatch command.
   - Capabilities:
     * Regional Situational Awareness across Kathmandu Valley.
     * Comprehensive filterable registry (by Municipality, Ward, Urgency, Item, Status).
     * Multi-Hub Inventory Matrix with real-time reserve tracking and incoming receipts.
     * Explainable Heuristic Allocation workspace with automated shortage detection.
     * Real Dijkstra Route Optimization comparing transit times, distances, and risks.
     * Manual Override support with mandatory operational justification logging.
     * Fleet dispatch assignment and courier handover confirmation.
     * Chronological Activity Audit Timeline recording every operational event and actor.

C. PRE-CONFIGURED DEMO ACCOUNTS (One-Click Instant Evaluation):
   Household Citizen Accounts:
     - Elena Shrestha (HH-KMC-01): KMC Ward 3 (Maharajgunj) — 60 Food demand
     - Sita & Dipak Tamang (HH-LMC-02): LMC Ward 15 (Satdobato) — 70 Food demand
     - Bikash Prajapati (HH-BKT-03): Bhaktapur Ward 2 (Byasi)
     - Or register any custom household name/ward instantly.
   Relief Coordinator Accounts:
     - Saurabh Chaudhary (COORD-KMC): Lead Coordinator • DC-1 Tripureshwor Command
     - Lt. Purna Shakya (COORD-LMC): Lalitpur Sector • DC-2 Jawalakhel Logistics Ground
     - Coord. Bimala Gurung (COORD-BKT): Bhaktapur Sector • DC-3 Sallaghari Relief Post

Browser Storage Note:
A demonstration authentication flow is used. Both portals share a synchronized 
data model in the browser (`localStorage`). A request lodged in the Household 
portal appears instantly in the Coordinator Command Desk.

--------------------------------------------------------------------------------
3. EXPLAINABLE HEURISTIC ALLOCATION ENGINE
--------------------------------------------------------------------------------
Allocation decisions are NOT generated by arbitrary black-box models or blind 
first-come-first-served queues. Lifeline uses a deterministic, transparent formula:

A. TRIAGE PRIORITY SCORE (Scale 0 to 100):
   Priority Score = Urgency Weight + Waiting Time Score + Transit Feasibility Score

   1. Clinical Urgency Weight (Max 50 points):
      - Critical Priority: 50 points (Immediate life risk, zero supplies remaining)
      - High Priority:     30 points (Supplies deplete within 24h, infants/vulnerable)
      - Standard Priority: 10 points (Replenishment requested, stable > 24h)

   2. Waiting Time Aging Score (Max 30 points):
      - Formula: Math.min(30, Math.round(WaitingHours * 1.5))
      - Rationale: Prevents starvation of long-waiting requests caused by 
        continuous incoming critical demands.

   3. Transit Feasibility Score (Max 20 points):
      - Computed directly from the Dijkstra route transit time:
        Score = Math.max(5, Math.min(20, Math.round(25 - (timeMin * 0.4))))
      - Favors distribution centres with lower transit latency to reduce convoy risk.

B. CORE OPERATIONAL INVARIANTS:
   - Zero Negative Inventory: A hub can NEVER allocate more than its available stock 
     (`totalStock - reservedStock >= 0`).
   - Anti-Double-Reservation: Stock is reserved immediately upon allocation approval.
   - Partial Fulfillment Support: When demand exceeds available stock, the engine 
     recommends allocating the maximum available units immediately, while keeping 
     the remaining unmet quantity visibly backordered.
   - Human-in-the-Loop: Recommendations must be approved by a relief coordinator. 
     Overrides require recording a written justification.

--------------------------------------------------------------------------------
4. DIJKSTRA ROUTE OPTIMIZATION ENGINE (js/routing.js)
--------------------------------------------------------------------------------
Route optimization is executed via a genuine implementation of Dijkstra's 
Shortest-Path Algorithm on a non-negative weighted road network graph.

A. ROAD NETWORK GRAPH REPRESENTATION:
   - Nodes: 12 key transit hubs, road junctions, and delivery destination localities:
     * Depots: DC_TRIPURESHWOR, DC_JAWALAKHEL, DC_SALLAGHARI
     * Junctions: J_MAITIGHAR, J_KOTESHWOR, J_KALANKI, J_CHABAHIL, J_SATDOBATO
     * Dest Localities: DEST_KMC_MAHARAJ, DEST_KMC_BANESH, DEST_LMC_SATDOBATO, DEST_BKT_BYASI
   - Edges: 20 bidirectional road segments characterized by:
     * Distance in kilometres (km)
     * Estimated travel time in minutes (mins)
     * Road surface condition (e.g., "Paved Highway", "Narrow Ward Alley")
     * Disruption risk factor (0.0 to 1.0)
     * Closed status (`isClosed: boolean`)

B. CLOSED ROAD EXCLUSION:
   - Road segment EDGE-07 (Maitighar to Maharajgunj direct arterial via Lazimpat) 
     is explicitly marked CLOSED (`isClosed: true`) due to a fallen high-tension 
     transformer post-snap.
   - Dijkstra's graph adjacency builder discards closed edges, forcing the algorithm 
     to compute a verified open detour (via Chabahil or Balaju).

C. THREE OPTIMIZATION OBJECTIVES:
   1. Shortest Distance: Minimizes raw kilometres (totalDistanceKm).
   2. Fastest Estimated Time: Minimizes transit minutes (totalTimeMin).
   3. Risk-Aware Composite Cost:
      Route Cost = (w_time * timeMin) + (w_dist * distanceKm * 2.5) + (w_risk * riskFactor * 30.0)
      Configured Weights:
        - w_time     = 0.5 (Time priority)
        - w_distance = 0.3 (Fuel/Distance cost)
        - w_risk     = 0.2 (Disruption hazard penalty)
      All units are normalized to a commensurate friction index.

D. MULTI-HUB INVENTORY-TIED ROUTING:
   Routing is never decoupled from inventory. When a request is evaluated:
   1. Candidate hubs are filtered by available stock of the requested item.
   2. Dijkstra routes are computed from all feasible candidate hubs to the destination.
   3. Hubs are compared based on both fulfillment ability (Full vs Partial) and delivery effort.
   4. An alternative route is automatically calculated by excluding the primary bottleneck edge.

--------------------------------------------------------------------------------
5. SECTION 6 & 12 EVALUATION TEST SCENARIO
--------------------------------------------------------------------------------
The application is pre-seeded with the exact Section 6 & 12 test benchmark:

Setup:
  - DC-1: Kathmandu Central Relief Hub (Tripureshwor - HUB-A) has EXACTLY 100 
    units of Food Rations available (totalStock: 100, reservedStock: 0).
  - Elena Shrestha (REQ-NEPAL-01, KMC Ward 3): Demands 60 units of Food.
    Urgency: Critical | Waiting: 14 hours | Priority Score: 84/100
  - Sita Tamang (REQ-NEPAL-02, LMC Ward 15): Demands 70 units of Food.
    Urgency: High | Waiting: 11 hours | Priority Score: 64/100
  - Total Demand: 60 + 70 = 130 units.
  - Total Available: 100 units.
  - Regional Shortfall: 30 units (130 - 100 = 30).

Execution in Lifeline:
  1. System detects the 30-unit shortfall.
  2. Elena Shrestha is evaluated first based on priority score (84 vs 64).
     Recommendation: Full allocation of 60 units from DC-1 Tripureshwor.
  3. Coordinator approves 60 units. DC-1 available stock drops to 40 units.
  4. Sita Tamang is evaluated second.
     Recommendation: Partial allocation of 40 units (all remaining stock).
     Remaining Unmet Demand: 30 units explicitly backordered.
  5. Total committed stock = 60 + 40 = 100 units.
  6. Final available stock at DC-1 = 0 units (never negative).
  7. In the Household Portal, Sita Tamang sees:
     - Requested: 70 Jerrycans / Packs
     - Allocated: 40 Packs (Partially Fulfilled)
     - Remaining Unmet: 30 Packs (Awaiting Next Convoy)
     - Transparent explanation of depot capacity constraint.

This scenario is 100% reproducible and can be restored anytime by clicking 
"Reset Demo State".

--------------------------------------------------------------------------------
6. HOW TO LAUNCH AND OPERATE THE PLATFORM
--------------------------------------------------------------------------------
A. LAUNCHING THE APP:
   Simply open `index.html` in any modern web browser:
     - Double click `index.html`, OR
     - Open browser and navigate to: `file:///e:/Project/index.html`
   No installation, no npm, no build tools, and no server required.

B. EVALUATING THE HOUSEHOLD EXPERIENCE:
   1. On the Welcome Gateway, click "Elena Shrestha" or "Sita Tamang".
   2. View private household dashboard, active requests, and tracking progress.
   3. Submit a new request using the intake form (select Municipality, Ward, Quantity).
   4. Note the generated Request ID and verify it appears in your private tracking queue.
   5. Log out via the header button to return to the Gateway.

C. EVALUATING THE COORDINATOR EXPERIENCE:
   1. On the Welcome Gateway, click "Saurabh Chaudhary (Kathmandu Lead)".
   2. Operations Command Overview: View Valley KPIs, interactive schematic map, 
      and intake queues.
   3. Household Requests: Filter by Ward, Urgency, Item, or Status.
   4. Regional Inventory: View 3-hub matrix, adjust safety buffers, record convoy receipts.
   5. Allocation & Routing:
      - Select REQ-NEPAL-01 or REQ-NEPAL-02.
      - Switch optimization objective: Fastest Time, Shortest Distance, Risk-Aware.
      - Review Dijkstra route sequence, travel time, alternative route, and explanation.
      - Approve allocation with 1-click.
   6. Deliveries: Assign transport unit (e.g., Courier Team Echo) and confirm handover.
   7. Timeline: Audit every action taken in the session.

D. RESETTING DEMO STATE:
   Click "Reset Demo State" in the sidebar footer anytime to restore initial records.

--------------------------------------------------------------------------------
7. VERIFICATION TESTING (HOW TO RUN TESTS)
--------------------------------------------------------------------------------
Lifeline provides two distinct test execution methods:

METHOD 1: TERMINAL / CLI TEST SUITE (Node.js)
  Run in terminal:
    node test/test_lifeline.js

  Output: Executes all 15 test suites and outputs green pass checkmarks:
    ✓ [PASS] Test 1: Household & Coordinator Portals Separation
    ✓ [PASS] Test 2: Household Privacy Isolation (No cross-household data exposure)
    ✓ [PASS] Test 3: Household Submission and Status Tracking
    ✓ [PASS] Test 4: Coordinator Review, Allocation, and Dispatch Workflow
    ✓ [PASS] Test 5: Shared State Consistency Across Portals in Same Browser
    ✓ [PASS] Test 6: Zero Negative Inventory & Over-Allocation Prevention
    ✓ [PASS] Test 7: 100-Unit Stock vs 130-Unit Demand Shortfall (30 units unmet)
    ✓ [PASS] Test 8: Dijkstra Shortest-Path Algorithm on Known Test Graph
    ✓ [PASS] Test 9: Closed Road Segment Exclusion (Lazimpat Arterial Closed)
    ✓ [PASS] Test 10: Unreachable Destination Graceful Failure & Warning
    ✓ [PASS] Test 11: Route Explanation Consistency with Computed Metrics
    ✓ [PASS] Test 12: Partial Fulfilment and Allocation Rescission / Stock Return
    ✓ [PASS] Test 13: Data Persistence in Storage Across Refreshes
    ✓ [PASS] Test 14: Reset Demo Restores Initial Kathmandu Valley Scenario
    ✓ [PASS] Test 15: Responsive UI Support (Viewport Meta, Mobile Drawer & Breakpoints)
  Exit code: 0 upon success.

METHOD 2: IN-BROWSER TEST RUNNER
  1. Open `index.html` in browser.
  2. Log in as any Coordinator (e.g., Saurabh Chaudhary).
  3. In the sidebar footer, click "Run Verification Tests".
  4. An in-app modal opens displaying all 15 requirements tested deterministically 
     against active browser state.

--------------------------------------------------------------------------------
8. CURRENT LIMITATIONS & FUTURE IMPROVEMENTS
--------------------------------------------------------------------------------
Current Prototype Scope & Limitations:
  1. Local Storage Sync: Synchronization between Household and Coordinator portals 
     operates within the same browser instance via `localStorage`. For cross-device 
     production synchronization, a multi-tenant backend with PostgreSQL and WebSocket 
     event broadcasting is recommended.
  2. Simulated Map Graphics: The Kathmandu Valley road diagram uses an SVG schematic 
     with real coordinate projections rather than a paid Mapbox/Google Maps API key.
  3. Fictional Road Disruptions: Road closures (e.g., Lazimpat transformer blockage) 
     and transit minutes are calibrated illustrative demo data.

Future Engineering Roadmap:
  - Integration with Nepal Ministry of Home Affairs (MoHA) & Nepal Red Cross APIs.
  - Multi-vehicle capacitated vehicle routing problem (CVRP) solver for convoy dispatch.
  - SMS / IVR fallback for offline citizen intake in ward areas without data cellular coverage.
  - Multi-language toggle (Nepali / English) for emergency field responders.

================================================================================
END OF DOCUMENTATION — LIFELINE NEPAL
================================================================================
