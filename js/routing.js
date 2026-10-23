/**
 * Lifeline — Emergency Essential Supplies Coordination Platform
 * Kathmandu Valley Road Network Graph & Dijkstra Route Optimization Engine
 * Context: Nepal Emergency Response (Post-Snap 2018)
 * 
 * Implements:
 * 1. Non-negative weighted road graph of Kathmandu Valley (KMC, Lalitpur, Bhaktapur)
 * 2. Dijkstra's Algorithm for Shortest Distance (km), Fastest Time (mins), and Risk-Aware Cost
 * 3. Closed road segment avoidance and unreachable destination handling
 * 4. Multi-hub supply feasibility matching (Inventory + Route efficiency)
 * 5. Alternative route generation and transparent explainability generator
 */

const LifelineRouting = (function () {
  'use strict';

  /**
   * KATHMANDU VALLEY ROAD GRAPH DEFINITION
   * Nodes represent Distribution Centres, Major Road Junctions, and Ward Localities.
   * Clearly marked as Illustrative Demo Data for emergency planning.
   */
  const GRAPH_NODES = {
    // Distribution Centres (Warehouses / Staging Bases)
    'DC_TRIPURESHWOR': {
      id: 'DC_TRIPURESHWOR',
      name: 'DC-1: Kathmandu Central Relief Hub (Tripureshwor / Dasharath Stadium Grounds)',
      shortName: 'Tripureshwor Hub (DC-1)',
      municipality: 'Kathmandu Metropolitan City',
      ward: 11,
      type: 'depot',
      coords: { x: 42, y: 52 } // SVG schematic coords (%)
    },
    'DC_JAWALAKHEL': {
      id: 'DC_JAWALAKHEL',
      name: 'DC-2: Lalitpur Sector Logistics Base (Jawalakhel Public Ground)',
      shortName: 'Jawalakhel Depot (DC-2)',
      municipality: 'Lalitpur Metropolitan City',
      ward: 4,
      type: 'depot',
      coords: { x: 38, y: 74 }
    },
    'DC_SALLAGHARI': {
      id: 'DC_SALLAGHARI',
      name: 'DC-3: Bhaktapur Emergency Supply Post (Sallaghari Ground)',
      shortName: 'Sallaghari Post (DC-3)',
      municipality: 'Bhaktapur Municipality',
      ward: 1,
      type: 'depot',
      coords: { x: 82, y: 58 }
    },

    // Major Road Junctions / Arterial Waypoints
    'J_MAITIGHAR': {
      id: 'J_MAITIGHAR',
      name: 'Maitighar Mandala Intersection',
      shortName: 'Maitighar Mandala',
      municipality: 'Kathmandu Metropolitan City',
      ward: 10,
      type: 'junction',
      coords: { x: 49, y: 53 }
    },
    'J_KOTESHWOR': {
      id: 'J_KOTESHWOR',
      name: 'Koteshwor Chowk (Araniko Highway Corridor)',
      shortName: 'Koteshwor Chowk',
      municipality: 'Kathmandu Metropolitan City',
      ward: 32,
      type: 'junction',
      coords: { x: 65, y: 62 }
    },
    'J_CHABAHIL': {
      id: 'J_CHABAHIL',
      name: 'Chabahil Chowk (Ring Road North-East)',
      shortName: 'Chabahil Chowk',
      municipality: 'Kathmandu Metropolitan City',
      ward: 7,
      type: 'junction',
      coords: { x: 62, y: 32 }
    },
    'J_KALANKI': {
      id: 'J_KALANKI',
      name: 'Kalanki Chowk (Ring Road West)',
      shortName: 'Kalanki Chowk',
      municipality: 'Kathmandu Metropolitan City',
      ward: 14,
      type: 'junction',
      coords: { x: 22, y: 50 }
    },
    'J_BALAJU': {
      id: 'J_BALAJU',
      name: 'Balaju Bypass (Ring Road North-West)',
      shortName: 'Balaju Bypass',
      municipality: 'Kathmandu Metropolitan City',
      ward: 16,
      type: 'junction',
      coords: { x: 28, y: 25 }
    },
    'J_SATDOBATO': {
      id: 'J_SATDOBATO',
      name: 'Satdobato Ring Road Intersection',
      shortName: 'Satdobato Chowk',
      municipality: 'Lalitpur Metropolitan City',
      ward: 15,
      type: 'junction',
      coords: { x: 50, y: 82 }
    },
    'J_THAPATHALI': {
      id: 'J_THAPATHALI',
      name: 'Thapathali Bridge (Bagmati River Crossing)',
      shortName: 'Thapathali Bridge',
      municipality: 'Kathmandu / Lalitpur Border',
      ward: 11,
      type: 'junction',
      coords: { x: 45, y: 59 }
    },
    'J_SURYABINAYAK': {
      id: 'J_SURYABINAYAK',
      name: 'Suryabinayak Chowk (East Bhaktapur Corridor)',
      shortName: 'Suryabinayak Chowk',
      municipality: 'Bhaktapur Municipality',
      ward: 8,
      type: 'junction',
      coords: { x: 92, y: 66 }
    },

    // Delivery Destinations (Wards & Localities)
    'DEST_KMC_MAHARAJ': {
      id: 'DEST_KMC_MAHARAJ',
      name: 'Maharajgunj Relief Point (KMC Ward 3, Near Teaching Hospital)',
      shortName: 'Maharajgunj (KMC W-3)',
      municipality: 'Kathmandu Metropolitan City',
      ward: 3,
      type: 'destination',
      coords: { x: 44, y: 22 }
    },
    'DEST_KMC_BANESH': {
      id: 'DEST_KMC_BANESH',
      name: 'New Baneshwor Residential Cluster (KMC Ward 10)',
      shortName: 'New Baneshwor (KMC W-10)',
      municipality: 'Kathmandu Metropolitan City',
      ward: 10,
      type: 'destination',
      coords: { x: 56, y: 54 }
    },
    'DEST_LMC_SATDOBATO': {
      id: 'DEST_LMC_SATDOBATO',
      name: 'Satdobato Residential Sub-Ward (LMC Ward 15)',
      shortName: 'Satdobato Area (LMC W-15)',
      municipality: 'Lalitpur Metropolitan City',
      ward: 15,
      type: 'destination',
      coords: { x: 54, y: 86 }
    },
    'DEST_LMC_SANEPA': {
      id: 'DEST_LMC_SANEPA',
      name: 'Sanepa Riverside Settlement (LMC Ward 2)',
      shortName: 'Sanepa (LMC W-2)',
      municipality: 'Lalitpur Metropolitan City',
      ward: 2,
      type: 'destination',
      coords: { x: 32, y: 64 }
    },
    'DEST_BKT_BYASI': {
      id: 'DEST_BKT_BYASI',
      name: 'Byasi Ancient Quarter (Bhaktapur Ward 2)',
      shortName: 'Byasi (Bhaktapur W-2)',
      municipality: 'Bhaktapur Municipality',
      ward: 2,
      type: 'destination',
      coords: { x: 86, y: 48 }
    },
    'DEST_BKT_KAMAL': {
      id: 'DEST_BKT_KAMAL',
      name: 'Kamalbinayak Settlement (Bhaktapur Ward 9)',
      shortName: 'Kamalbinayak (Bhaktapur W-9)',
      municipality: 'Bhaktapur Municipality',
      ward: 9,
      type: 'destination',
      coords: { x: 94, y: 52 }
    }
  };

  /**
   * KATHMANDU VALLEY ROAD EDGES
   * Represents bidirectional road segments between nodes.
   * Includes distance (km), estimated transit time (mins), road condition,
   * disruption risk (0.0 - 1.0), and closed status.
   */
  const DEFAULT_ROAD_EDGES = [
    // Tripureshwor - Maitighar (Main Arterial)
    {
      id: 'EDGE-01',
      u: 'DC_TRIPURESHWOR',
      v: 'J_MAITIGHAR',
      distanceKm: 1.8,
      timeMin: 6,
      roadCondition: 'Paved Arterial',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Clear emergency escorted lane active along Pradarshani Marg.'
    },
    // Tripureshwor - Thapathali Bridge
    {
      id: 'EDGE-02',
      u: 'DC_TRIPURESHWOR',
      v: 'J_THAPATHALI',
      distanceKm: 1.2,
      timeMin: 5,
      roadCondition: 'Minor Debris',
      riskFactor: 0.25,
      isClosed: false,
      notes: 'Bagmati River crossing open for light transport.'
    },
    // Thapathali - Jawalakhel
    {
      id: 'EDGE-03',
      u: 'J_THAPATHALI',
      v: 'DC_JAWALAKHEL',
      distanceKm: 2.1,
      timeMin: 8,
      roadCondition: 'Narrow Paved',
      riskFactor: 0.2,
      isClosed: false,
      notes: 'Kumaripati road clear.'
    },
    // Tripureshwor - Kalanki
    {
      id: 'EDGE-04',
      u: 'DC_TRIPURESHWOR',
      v: 'J_KALANKI',
      distanceKm: 4.5,
      timeMin: 18,
      roadCondition: 'Heavy Rubble / Partially Blocked',
      riskFactor: 0.65,
      isClosed: false,
      notes: 'Slow passage near Kalimati vegetable market due to abandoned vehicles.'
    },
    // Kalanki - Balaju Ring Road
    {
      id: 'EDGE-05',
      u: 'J_KALANKI',
      v: 'J_BALAJU',
      distanceKm: 5.2,
      timeMin: 16,
      roadCondition: 'Four-lane Ring Road',
      riskFactor: 0.2,
      isClosed: false,
      notes: 'Western ring road corridor operating normally.'
    },
    // Balaju - Maharajgunj (North Sector)
    {
      id: 'EDGE-06',
      u: 'J_BALAJU',
      v: 'DEST_KMC_MAHARAJ',
      distanceKm: 3.4,
      timeMin: 12,
      roadCondition: 'Paved Ring Road Sector',
      riskFactor: 0.15,
      isClosed: false,
      notes: 'Gongabu - Maharajgunj corridor clear.'
    },
    // Maitighar - Maharajgunj DIRECT (Via Lazimpat) - CLOSED ROAD DEMO SCENARIO
    {
      id: 'EDGE-07',
      u: 'J_MAITIGHAR',
      v: 'DEST_KMC_MAHARAJ',
      distanceKm: 4.8,
      timeMin: 22,
      roadCondition: 'CLOSED: Collapsed Freight Tanker & Power Lines',
      riskFactor: 1.0,
      isClosed: true, // EXPLICITLY CLOSED ROAD SEGMENT
      notes: 'Lazimpat arterial completely blocked by fallen high-tension transformer post-snap. Detour via Ring Road or Chabahil required.'
    },
    // Maitighar - New Baneshwor
    {
      id: 'EDGE-08',
      u: 'J_MAITIGHAR',
      v: 'DEST_KMC_BANESH',
      distanceKm: 1.5,
      timeMin: 5,
      roadCondition: 'Wide Paved Corridor',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Open 6-lane road passing Federal Parliament.'
    },
    // New Baneshwor - Koteshwor
    {
      id: 'EDGE-09',
      u: 'DEST_KMC_BANESH',
      v: 'J_KOTESHWOR',
      distanceKm: 2.2,
      timeMin: 7,
      roadCondition: 'Wide Paved Highway',
      riskFactor: 0.15,
      isClosed: false,
      notes: 'Smooth transit corridor.'
    },
    // Maitighar - Chabahil (Via Old Baneshwor)
    {
      id: 'EDGE-10',
      u: 'J_MAITIGHAR',
      v: 'J_CHABAHIL',
      distanceKm: 4.2,
      timeMin: 14,
      roadCondition: 'Urban Arterial',
      riskFactor: 0.2,
      isClosed: false,
      notes: 'Passes Gaushala / Ring Road junction.'
    },
    // Chabahil - Maharajgunj (Connecting North-East to North)
    {
      id: 'EDGE-11',
      u: 'J_CHABAHIL',
      v: 'DEST_KMC_MAHARAJ',
      distanceKm: 3.8,
      timeMin: 11,
      roadCondition: 'Ring Road Paved',
      riskFactor: 0.15,
      isClosed: false,
      notes: 'Sukedhara - Maharajgunj segment fully navigable.'
    },
    // Koteshwor - Sallaghari (Araniko Highway to Bhaktapur)
    {
      id: 'EDGE-12',
      u: 'J_KOTESHWOR',
      v: 'DC_SALLAGHARI',
      distanceKm: 6.8,
      timeMin: 15,
      roadCondition: 'Express Highway',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Fast 6-lane express connection between KMC and Bhaktapur.'
    },
    // Sallaghari - Byasi (Bhaktapur Ward 2)
    {
      id: 'EDGE-13',
      u: 'DC_SALLAGHARI',
      v: 'DEST_BKT_BYASI',
      distanceKm: 2.3,
      timeMin: 9,
      roadCondition: 'Ancient Brick Paved Alley',
      riskFactor: 0.3,
      isClosed: false,
      notes: 'Narrow passage in traditional Bhaktapur settlement; light van or cargo tricycle required.'
    },
    // Sallaghari - Suryabinayak
    {
      id: 'EDGE-14',
      u: 'DC_SALLAGHARI',
      v: 'J_SURYABINAYAK',
      distanceKm: 2.5,
      timeMin: 6,
      roadCondition: 'Araniko Highway',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Clear highway segment.'
    },
    // Suryabinayak - Kamalbinayak (Bhaktapur Ward 9)
    {
      id: 'EDGE-15',
      u: 'J_SURYABINAYAK',
      v: 'DEST_BKT_KAMAL',
      distanceKm: 2.8,
      timeMin: 10,
      roadCondition: 'Secondary Paved Road',
      riskFactor: 0.2,
      isClosed: false,
      notes: 'Clear access route to eastern perimeter.'
    },
    // Jawalakhel - Sanepa (LMC Ward 2)
    {
      id: 'EDGE-16',
      u: 'DC_JAWALAKHEL',
      v: 'DEST_LMC_SANEPA',
      distanceKm: 1.9,
      timeMin: 7,
      roadCondition: 'Residential Paved',
      riskFactor: 0.15,
      isClosed: false,
      notes: 'Direct route through Jhamsikhel.'
    },
    // Jawalakhel - Satdobato (LMC Ward 15)
    {
      id: 'EDGE-17',
      u: 'DC_JAWALAKHEL',
      v: 'J_SATDOBATO',
      distanceKm: 2.6,
      timeMin: 8,
      roadCondition: 'Four-lane Boulevard',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Lagankhel - Satdobato arterial.'
    },
    // Satdobato - Satdobato Residential Sub-Ward
    {
      id: 'EDGE-18',
      u: 'J_SATDOBATO',
      v: 'DEST_LMC_SATDOBATO',
      distanceKm: 0.9,
      timeMin: 4,
      roadCondition: 'Local Paved Street',
      riskFactor: 0.1,
      isClosed: false,
      notes: 'Direct residential access.'
    },
    // Koteshwor - Satdobato (Southern Ring Road link)
    {
      id: 'EDGE-19',
      u: 'J_KOTESHWOR',
      v: 'J_SATDOBATO',
      distanceKm: 4.1,
      timeMin: 10,
      roadCondition: 'Ring Road Highway',
      riskFactor: 0.15,
      isClosed: false,
      notes: 'Balkumari - Gwarko - Satdobato corridor.'
    }
  ];

  /**
   * Adjacency list representation
   */
  function buildAdjacencyList(edges, excludeEdgeId = null) {
    const adj = {};
    Object.keys(GRAPH_NODES).forEach(nodeId => {
      adj[nodeId] = [];
    });

    edges.forEach(edge => {
      if (edge.isClosed) return; // Disregard closed roads completely
      if (excludeEdgeId && edge.id === excludeEdgeId) return; // Used for alternative path search

      if (!adj[edge.u]) adj[edge.u] = [];
      if (!adj[edge.v]) adj[edge.v] = [];

      // Bidirectional roads in Kathmandu Valley
      adj[edge.u].push({ node: edge.v, edge: edge });
      adj[edge.v].push({ node: edge.u, edge: edge });
    });

    return adj;
  }

  /**
   * Calculate edge cost based on selected optimization objective
   * Normalization Strategy:
   * - Distance: raw km (e.g. 1.0 to 15.0 km)
   * - Time: raw minutes (e.g. 5 to 45 mins)
   * - Risk: normalized 0.0 to 1.0 penalty scaled to equivalent travel friction
   */
  function calculateEdgeWeight(edge, objective, weights = { w_time: 0.5, w_distance: 0.3, w_risk: 0.2 }) {
    if (objective === 'shortest_distance') {
      return edge.distanceKm;
    } else if (objective === 'fastest_time') {
      return edge.timeMin;
    } else {
      // Risk-aware composite cost
      // Cost = (w_time * timeMin) + (w_distance * (distanceKm * 2)) + (w_risk * (riskFactor * 30))
      const timeComponent = edge.timeMin * (weights.w_time || 0.5);
      const distComponent = (edge.distanceKm * 2.5) * (weights.w_distance || 0.3);
      const riskComponent = (edge.riskFactor * 30.0) * (weights.w_risk || 0.2);
      return Math.round((timeComponent + distComponent + riskComponent) * 100) / 100;
    }
  }

  /**
   * DIJKSTRA'S ALGORITHM IMPLEMENTATION
   * Computes shortest path using non-negative edge weights.
   * Handles disconnected components, returns structured metrics and explanations.
   */
  function dijkstra(startNodeId, targetNodeId, objective = 'fastest_time', weights = null, excludeEdgeId = null) {
    if (!GRAPH_NODES[startNodeId] || !GRAPH_NODES[targetNodeId]) {
      return {
        success: false,
        unreachable: true,
        path: [],
        edges: [],
        error: `Invalid node identifier: ${!GRAPH_NODES[startNodeId] ? startNodeId : targetNodeId}`,
        explanation: `Invalid node identifier specified.`
      };
    }

    if (startNodeId === targetNodeId) {
      return {
        success: true,
        path: [startNodeId],
        edges: [],
        totalDistanceKm: 0,
        totalTimeMin: 0,
        totalCost: 0,
        unreachable: false
      };
    }

    const adj = buildAdjacencyList(DEFAULT_ROAD_EDGES, excludeEdgeId);
    const distances = {};
    const previous = {};
    const previousEdge = {};
    const unvisited = new Set(Object.keys(GRAPH_NODES));

    Object.keys(GRAPH_NODES).forEach(nodeId => {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
      previousEdge[nodeId] = null;
    });

    distances[startNodeId] = 0;

    while (unvisited.size > 0) {
      // Find unvisited node with lowest distance
      let currentNode = null;
      let minDistance = Infinity;

      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNode = nodeId;
        }
      });

      if (currentNode === null || minDistance === Infinity) {
        break; // Remaining nodes are unreachable
      }

      if (currentNode === targetNodeId) {
        break; // Target reached
      }

      unvisited.delete(currentNode);

      // Relax neighbors
      const neighbors = adj[currentNode] || [];
      neighbors.forEach(neighbor => {
        if (!unvisited.has(neighbor.node)) return;

        const weight = calculateEdgeWeight(neighbor.edge, objective, weights);
        const alt = distances[currentNode] + weight;

        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = currentNode;
          previousEdge[neighbor.node] = neighbor.edge;
        }
      });
    }

    // Reconstruct path
    if (distances[targetNodeId] === Infinity) {
      return {
        success: false,
        unreachable: true,
        path: [],
        edges: [],
        startNode: startNodeId,
        targetNode: targetNodeId,
        error: `Destination is currently unreachable via open roads.`,
        explanation: `Destination ${GRAPH_NODES[targetNodeId].name} is currently unreachable from ${GRAPH_NODES[startNodeId].shortName} through open roads.`
      };
    }

    const path = [];
    const edges = [];
    let curr = targetNodeId;

    while (curr !== null) {
      path.unshift(curr);
      if (previousEdge[curr]) {
        edges.unshift(previousEdge[curr]);
      }
      curr = previous[curr];
    }

    const totalDistanceKm = Math.round(edges.reduce((sum, e) => sum + e.distanceKm, 0) * 10) / 10;
    const totalTimeMin = Math.round(edges.reduce((sum, e) => sum + e.timeMin, 0));
    const totalCost = Math.round(distances[targetNodeId] * 10) / 10;

    return {
      success: true,
      unreachable: false,
      startNodeId,
      targetNodeId,
      path,
      edges,
      totalDistanceKm,
      totalTimeMin,
      totalCost,
      objective
    };
  }

  /**
   * Compute alternative route by penalizing or temporarily bypassing the primary route's critical edge
   */
  function findAlternativeRoute(startNodeId, targetNodeId, primaryResult, objective = 'fastest_time') {
    if (!primaryResult || !primaryResult.success || primaryResult.edges.length === 0) {
      return null;
    }

    // Identify a non-terminal edge in primary path to bypass
    const bypassEdge = primaryResult.edges.length > 2 ? primaryResult.edges[1] : primaryResult.edges[0];
    const altResult = dijkstra(startNodeId, targetNodeId, objective, null, bypassEdge.id);

    if (altResult.success && altResult.path.length > 0) {
      // Check if it is distinct from primary
      const isIdentical = JSON.stringify(altResult.path) === JSON.stringify(primaryResult.path);
      if (!isIdentical) {
        return altResult;
      }
    }
    return null;
  }

  /**
   * Supply-Centre Selection tied to inventory AND road network feasibility
   * Identifies candidate depots with stock, runs Dijkstra to destination, compares options.
   */
  function evaluateSupplyCentresAndRoutes(request, inventoryRecords, objective = 'fastest_time') {
    if (!request) return null;

    // Map request locality to nearest road graph destination node
    let destinationNodeId = 'DEST_KMC_MAHARAJ';
    const comm = request.community || '';
    const addr = (request.address || '').toLowerCase();

    if (comm.includes('Lalitpur') || addr.includes('satdobato') || addr.includes('sanepa')) {
      destinationNodeId = addr.includes('sanepa') ? 'DEST_LMC_SANEPA' : 'DEST_LMC_SATDOBATO';
    } else if (comm.includes('Bhaktapur') || addr.includes('byasi') || addr.includes('suryabinayak')) {
      destinationNodeId = addr.includes('kamal') ? 'DEST_BKT_KAMAL' : 'DEST_BKT_BYASI';
    } else if (addr.includes('baneshwor') || comm.includes('Ward 10')) {
      destinationNodeId = 'DEST_KMC_BANESH';
    } else {
      destinationNodeId = 'DEST_KMC_MAHARAJ';
    }

    // Candidate Depots with corresponding graph nodes
    const depotNodeMap = {
      'HUB-A': 'DC_TRIPURESHWOR',
      'HUB-NORTH': 'DC_TRIPURESHWOR', // fallback
      'HUB-SOUTH': 'DC_JAWALAKHEL',
      'HUB-WATERFRONT': 'DC_SALLAGHARI'
    };

    const depotOptions = [
      { hubId: 'HUB-A', nodeId: 'DC_TRIPURESHWOR', name: 'DC-1: Kathmandu Central Relief Hub (Tripureshwor)' },
      { hubId: 'HUB-SOUTH', nodeId: 'DC_JAWALAKHEL', name: 'DC-2: Lalitpur Sector Logistics Base (Jawalakhel)' },
      { hubId: 'HUB-WATERFRONT', nodeId: 'DC_SALLAGHARI', name: 'DC-3: Bhaktapur Emergency Supply Post (Sallaghari)' }
    ];

    // Evaluate stock at each depot
    const feasibleEvaluations = [];
    depotOptions.forEach(depot => {
      const inv = inventoryRecords.find(i => i.hubId === depot.hubId && i.itemId === request.itemId);
      const availableStock = inv ? Math.max(0, inv.totalStock - inv.reservedStock) : 0;

      const routeResult = dijkstra(depot.nodeId, destinationNodeId, objective);

      feasibleEvaluations.push({
        hubId: depot.hubId,
        hubName: depot.name,
        nodeId: depot.nodeId,
        availableStock,
        canFulfillFully: availableStock >= request.quantityRequested,
        canFulfillPartially: availableStock > 0 && availableStock < request.quantityRequested,
        routeResult
      });
    });

    // Filter candidate depots with available stock and reachable routes
    let candidatesWithFullStock = feasibleEvaluations.filter(e => e.canFulfillFully && e.routeResult.success);
    let selectedOption = null;
    let isPartial = false;
    let shortageWarning = null;

    if (candidatesWithFullStock.length > 0) {
      // Pick depot with lowest route effort (lowest travel time or distance)
      candidatesWithFullStock.sort((a, b) => {
        if (objective === 'shortest_distance') {
          return a.routeResult.totalDistanceKm - b.routeResult.totalDistanceKm;
        }
        return a.routeResult.totalTimeMin - b.routeResult.totalTimeMin;
      });
      selectedOption = candidatesWithFullStock[0];
    } else {
      // Check partial fulfillment candidates
      let partialCandidates = feasibleEvaluations.filter(e => e.canFulfillPartially && e.routeResult.success);
      if (partialCandidates.length > 0) {
        partialCandidates.sort((a, b) => b.availableStock - a.availableStock || a.routeResult.totalTimeMin - b.routeResult.totalTimeMin);
        selectedOption = partialCandidates[0];
        isPartial = true;
        shortageWarning = `Partial Fulfillment: ${selectedOption.hubName} only has ${selectedOption.availableStock} unreserved units (Demand: ${request.quantityRequested}). Remaining ${request.quantityRequested - selectedOption.availableStock} units will be backordered.`;
      } else {
        // Complete shortage across all hubs
        selectedOption = feasibleEvaluations[0];
        shortageWarning = `CRITICAL INVENTORY SHORTAGE: No distribution centre in Kathmandu Valley has unreserved stock of ${request.itemId} to serve this request.`;
      }
    }

    const route = selectedOption.routeResult;
    const alternativeRoute = route.success ? findAlternativeRoute(selectedOption.nodeId, destinationNodeId, route, objective) : null;

    // Generate genuine explainability matching computed metrics
    let explanation = '';
    if (!route.success) {
      explanation = `Route Warning: No open path found from ${selectedOption.hubName} to ${GRAPH_NODES[destinationNodeId].shortName}. Check road blockages or select helicopter / foot convoy.`;
    } else if (isPartial) {
      explanation = `Recommended Partial Allocation from ${selectedOption.hubName}: Lowest computed transit time (${route.totalTimeMin} mins, ${route.totalDistanceKm} km via ${route.path.map(n => GRAPH_NODES[n].shortName).join(' ➔ ')}). Available unreserved stock (${selectedOption.availableStock}) can immediately meet urgent survival needs while ${request.quantityRequested - selectedOption.availableStock} units remain backordered.`;
    } else {
      explanation = `Recommended ${selectedOption.hubName}: Optimal route calculated using Dijkstra algorithm (${route.totalTimeMin} mins, ${route.totalDistanceKm} km, objective: ${objective.replace('_', ' ')}). Selected over alternate depots due to superior travel time and verified full stock availability (${selectedOption.availableStock} unreserved units).`;
    }

    return {
      selectedHubId: selectedOption.hubId,
      selectedHubName: selectedOption.hubName,
      destinationNodeId,
      destinationName: GRAPH_NODES[destinationNodeId].name,
      availableStock: selectedOption.availableStock,
      isPartial,
      shortageWarning,
      route,
      alternativeRoute,
      allDepotEvaluations: feasibleEvaluations,
      explanation,
      objective
    };
  }

  /**
   * Built-in Verification Test for Dijkstra Algorithm
   * Verifies shortest paths on a controlled sub-graph with known metrics.
   */
  function runDijkstraUnitTests() {
    const results = [];

    // Test 1: Tripureshwor to New Baneshwor
    // Expected path: DC_TRIPURESHWOR -> J_MAITIGHAR -> DEST_KMC_BANESH
    // Expected distance: 1.8 + 1.5 = 3.3 km; time: 6 + 5 = 11 mins
    const t1 = dijkstra('DC_TRIPURESHWOR', 'DEST_KMC_BANESH', 'shortest_distance');
    const t1Pass = t1.success && t1.path.length === 3 && Math.abs(t1.totalDistanceKm - 3.3) < 0.1;
    results.push({
      testName: 'Dijkstra Test 1: Known Path (Tripureshwor to New Baneshwor)',
      passed: t1Pass,
      details: `Expected 3.3 km via Maitighar; Got ${t1.totalDistanceKm} km. Path: ${t1.path ? t1.path.join('->') : 'none'}`
    });

    // Test 2: Closed Road Exclusion
    // Edge EDGE-07 (Maitighar to Maharajgunj direct) is closed.
    // Algorithm must NOT use direct edge; must route via Chabahil (1.8 + 4.2 + 3.8 = 9.8 km) or Balaju.
    const t2 = dijkstra('J_MAITIGHAR', 'DEST_KMC_MAHARAJ', 'shortest_distance');
    const t2UsedClosed = t2.edges.some(e => e.id === 'EDGE-07');
    const t2Pass = t2.success && !t2UsedClosed && t2.edges.length >= 2;
    results.push({
      testName: 'Dijkstra Test 2: Closed Road Exclusion (Lazimpat Arterial Closed)',
      passed: t2Pass,
      details: `Closed road EDGE-07 was ${t2UsedClosed ? 'ERROR: USED' : 'CORRECTLY EXCLUDED'}. Computed Detour: ${t2.totalDistanceKm} km.`
    });

    // Test 3: Koteshwor to Sallaghari Highway
    const t3 = dijkstra('J_KOTESHWOR', 'DC_SALLAGHARI', 'fastest_time');
    const t3Pass = t3.success && t3.totalTimeMin === 15 && Math.abs(t3.totalDistanceKm - 6.8) < 0.1;
    results.push({
      testName: 'Dijkstra Test 3: Express Highway Corridor (Koteshwor to Sallaghari)',
      passed: t3Pass,
      details: `Expected 15 mins, 6.8 km; Got ${t3.totalTimeMin} mins, ${t3.totalDistanceKm} km.`
    });

    return results;
  }

  // Public Interface
  return {
    GRAPH_NODES,
    DEFAULT_ROAD_EDGES,
    dijkstra,
    findAlternativeRoute,
    evaluateSupplyCentresAndRoutes,
    runDijkstraUnitTests
  };
})();

// Export for Node.js test environment if applicable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifelineRouting;
}
