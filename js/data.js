/**
 * Lifeline — Emergency Essential Supplies Coordination Platform
 * Data Models, Seed Data & Deterministic Allocation Engine
 * Context: Kathmandu Valley, Nepal Emergency Response (Post-Snap 2018)
 * 
 * Geographic Scope:
 * - Kathmandu Metropolitan City (KMC)
 * - Lalitpur Metropolitan City (LMC)
 * - Bhaktapur Municipality
 * 
 * All facilities, road conditions, and household requests are clearly marked as
 * ILLUSTRATIVE DEMO DATA for emergency logistics demonstration.
 */

const LifelineData = (function () {
  'use strict';

  const STORAGE_KEY = 'lifeline_nepal_crisis_data_2018_v3';

  // Demo Accounts (Authentication & Permission Registry)
  const DEMO_USERS = {
    // Households (Mode A) — PIN is last 4 digits of registered phone
    'HH-KMC-01': {
      id: 'HH-KMC-01',
      role: 'household',
      name: 'Elena Shrestha',
      phone: '9841-555101',
      pin: '5101',
      municipality: 'Kathmandu Metropolitan City',
      ward: 3,
      locality: 'Maharajgunj (Near Teaching Hospital)',
      householdSize: 6,
      avatar: 'ES'
    },
    'HH-LMC-02': {
      id: 'HH-LMC-02',
      role: 'household',
      name: 'Sita & Dipak Tamang',
      phone: '9851-555202',
      pin: '5202',
      municipality: 'Lalitpur Metropolitan City',
      ward: 15,
      locality: 'Satdobato Residential Cluster',
      householdSize: 4,
      avatar: 'ST'
    },
    'HH-BKT-03': {
      id: 'HH-BKT-03',
      role: 'household',
      name: 'Bikash Prajapati',
      phone: '9861-555303',
      pin: '5303',
      municipality: 'Bhaktapur Municipality',
      ward: 2,
      locality: 'Byasi Ancient Quarter',
      householdSize: 5,
      avatar: 'BP'
    },
    'HH-KMC-04': {
      id: 'HH-KMC-04',
      role: 'household',
      name: 'Maya & Naveen Rao',
      phone: '9841-555404',
      pin: '5404',
      municipality: 'Kathmandu Metropolitan City',
      ward: 10,
      locality: 'New Baneshwor (Near Parliament)',
      householdSize: 3,
      avatar: 'MR'
    },

    // Relief Coordinators (Mode B) — PIN is assigned service credential
    'COORD-KMC': {
      id: 'COORD-KMC',
      role: 'coordinator',
      name: 'Saurabh Chaudhary',
      pin: '7411',
      title: 'Kathmandu Valley Lead Logistics Coordinator',
      jurisdiction: 'Kathmandu Metropolitan City & Valley Arterials',
      assignedHubId: 'HUB-A',
      station: 'Tripureshwor Dasharath Stadium Operations Command',
      avatar: 'SC'
    },
    'COORD-LMC': {
      id: 'COORD-LMC',
      role: 'coordinator',
      name: 'Purna Shakya',
      pin: '8522',
      title: 'Lalitpur Sector Field Coordinator',
      jurisdiction: 'Lalitpur Metropolitan City (Wards 1–29)',
      assignedHubId: 'HUB-SOUTH',
      station: 'Jawalakhel Public Ground Logistics Depot',
      avatar: 'PS'
    },
    'COORD-BKT': {
      id: 'COORD-BKT',
      role: 'coordinator',
      name: 'Bimala Gurung',
      pin: '9633',
      title: 'Bhaktapur Emergency Supply Officer',
      jurisdiction: 'Bhaktapur Municipality (Wards 1–10)',
      assignedHubId: 'HUB-WATERFRONT',
      station: 'Sallaghari Ground Relief Post',
      avatar: 'BG'
    }
  };

  // Item definitions with standard rationing units and clinical priority
  const ITEM_CATALOG = {
    food: {
      id: 'food',
      name: 'Emergency Food Rations',
      unit: '3-Day Ration Packs',
      category: 'Nutrition',
      description: 'Stabilized nutrient ration packs (lentils, fortified beaten rice, calorie bars).',
      defaultRationPerPerson: 1,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`
    },
    water: {
      id: 'water',
      name: 'Purified Drinking Water',
      unit: '20L Sealed Jerrycans',
      category: 'Hydration',
      description: 'Sterilized emergency drinking water sealed jerrycans.',
      defaultRationPerPerson: 1,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
    },
    medical: {
      id: 'medical',
      name: 'Trauma & Medical First-Response Kit',
      unit: 'Field Trauma Packs',
      category: 'Healthcare',
      description: 'Sterile surgical dressings, antiseptics, suture kits, rehydration salts & analgesics.',
      defaultRationPerPerson: 1,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`
    },
    hygiene: {
      id: 'hygiene',
      name: 'Infant & Family Hygiene Pack',
      unit: 'Sanitation Kits',
      category: 'Sanitation',
      description: 'Water purification chlor-floc tablets, soap, infant diapers, baby formula & sanitary napkins.',
      defaultRationPerPerson: 1,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
    }
  };

  // Distribution Centres across Kathmandu Valley
  const DEFAULT_HUBS = [
    {
      id: 'HUB-A',
      name: 'DC-1: Kathmandu Central Relief Hub (Tripureshwor Dasharath Stadium Grounds)',
      shortName: 'Kathmandu Central Hub (DC-1)',
      municipality: 'Kathmandu Metropolitan City',
      ward: 11,
      location: 'Dasharath Stadium Open Grounds, Tripureshwor',
      officer: 'Saurabh Chaudhary (Lead Valley Coordinator)',
      status: 'Fully Operational',
      accessRoads: 'Clear — Escorted arterial connection via Maitighar & Ring Road',
      graphNodeId: 'DC_TRIPURESHWOR',
      coords: { x: 42, y: 52 },
      transitFeasibilityScore: 95
    },
    {
      id: 'HUB-SOUTH',
      name: 'DC-2: Lalitpur Sector Logistics Depot (Jawalakhel Public Ground)',
      shortName: 'Lalitpur Depot (DC-2)',
      municipality: 'Lalitpur Metropolitan City',
      ward: 4,
      location: 'Jawalakhel Public Ground, Near Zoo Perimeter',
      officer: 'Lt. Purna Shakya (LMC Relief Team)',
      status: 'Operational',
      accessRoads: 'Clear — Direct connection to Satdobato & Thapathali Bridge',
      graphNodeId: 'DC_JAWALAKHEL',
      coords: { x: 38, y: 74 },
      transitFeasibilityScore: 85
    },
    {
      id: 'HUB-WATERFRONT',
      name: 'DC-3: Bhaktapur Emergency Supply Post (Sallaghari Ground)',
      shortName: 'Bhaktapur Post (DC-3)',
      municipality: 'Bhaktapur Municipality',
      ward: 1,
      location: 'Sallaghari Open Ground, Araniko Highway Corridor',
      officer: 'Coord. Bimala Gurung (Bhaktapur Relief Desk)',
      status: 'Operational',
      accessRoads: 'Clear via 6-lane Araniko Highway from Koteshwor',
      graphNodeId: 'DC_SALLAGHARI',
      coords: { x: 82, y: 58 },
      transitFeasibilityScore: 80
    }
  ];

  /**
   * INVENTORY RECORDS:
   * Specially seeded for the Section 6 & 12 Evaluation Scenario:
   * DC-1 Kathmandu Central Hub (HUB-A) has EXACTLY 100 Food Units available (0 reserved).
   */
  const DEFAULT_INVENTORY = [
    // DC-1: Kathmandu Central Hub (Tripureshwor) - Showcase Hub
    { hubId: 'HUB-A', itemId: 'food', totalStock: 100, reservedStock: 0, criticalThreshold: 30, lastRestocked: '2018-06-01T08:30:00Z' }, // 100 available!
    { hubId: 'HUB-A', itemId: 'water', totalStock: 350, reservedStock: 40, criticalThreshold: 60, lastRestocked: '2018-06-01T08:30:00Z' },
    { hubId: 'HUB-A', itemId: 'medical', totalStock: 80, reservedStock: 15, criticalThreshold: 20, lastRestocked: '2018-05-31T19:00:00Z' },
    { hubId: 'HUB-A', itemId: 'hygiene', totalStock: 120, reservedStock: 10, criticalThreshold: 25, lastRestocked: '2018-05-31T20:15:00Z' },

    // DC-2: Lalitpur Sector Depot (Jawalakhel)
    { hubId: 'HUB-SOUTH', itemId: 'food', totalStock: 50, reservedStock: 20, criticalThreshold: 45, lastRestocked: '2018-06-01T06:45:00Z' },
    { hubId: 'HUB-SOUTH', itemId: 'water', totalStock: 240, reservedStock: 25, criticalThreshold: 60, lastRestocked: '2018-06-01T06:45:00Z' },
    { hubId: 'HUB-SOUTH', itemId: 'medical', totalStock: 55, reservedStock: 8, criticalThreshold: 15, lastRestocked: '2018-05-31T16:20:00Z' },
    { hubId: 'HUB-SOUTH', itemId: 'hygiene', totalStock: 90, reservedStock: 12, criticalThreshold: 25, lastRestocked: '2018-05-31T17:00:00Z' },

    // DC-3: Bhaktapur Emergency Supply Post (Sallaghari)
    { hubId: 'HUB-WATERFRONT', itemId: 'food', totalStock: 40, reservedStock: 10, criticalThreshold: 30, lastRestocked: '2018-05-30T22:00:00Z' },
    { hubId: 'HUB-WATERFRONT', itemId: 'water', totalStock: 95, reservedStock: 20, criticalThreshold: 35, lastRestocked: '2018-05-30T22:00:00Z' },
    { hubId: 'HUB-WATERFRONT', itemId: 'medical', totalStock: 15, reservedStock: 6, criticalThreshold: 12, lastRestocked: '2018-05-29T18:00:00Z' },
    { hubId: 'HUB-WATERFRONT', itemId: 'hygiene', totalStock: 35, reservedStock: 8, criticalThreshold: 15, lastRestocked: '2018-05-30T15:30:00Z' }
  ];

  // Transport Units in Kathmandu Valley
  const DEFAULT_VEHICLES = [
    { id: 'VEH-01', name: 'Rapid Cargo Van (Ba 2 Kha 4012)', type: 'High-Clearance 4WD Van', capacity: '120 Units', status: 'In Transit', driver: 'M. Maharjan', currentSector: 'Kathmandu Metro' },
    { id: 'VEH-02', name: 'Valley Air Cargo Drone Delta-2', type: 'Heavy Cargo VTOL Drone', capacity: '20 Units', status: 'Available', driver: 'Autonomous Command', currentSector: 'Central Valley' },
    { id: 'VEH-03', name: 'Water Tanker Heavy (Ba 1 Kha 8819)', type: 'Potable Water Carrier', capacity: '250 Units', status: 'In Transit', driver: 'T. Shrestha', currentSector: 'Lalitpur Metro' },
    { id: 'VEH-04', name: 'Volunteer Motorcycle Team Echo', type: 'Alleyway Light Delivery', capacity: '25 Units', status: 'Available', driver: 'Lead: A. Bista', currentSector: 'Bhaktapur Settlement' }
  ];

  /**
   * DEFAULT HOUSEHOLD REQUESTS
   * Rigorously seeded for the Nepal Kathmandu Valley Demonstration:
   * 
   * Section 6 & 12 Specific Shortage Test:
   * 1. REQ-NEPAL-01: Elena Shrestha (KMC Ward 3, Maharajgunj) requests 60 food units (Urgency: Critical, Waiting: 14h)
   * 2. REQ-NEPAL-02: Sita & Dipak Tamang (LMC Ward 15, Satdobato) requests 70 food units (Urgency: High, Waiting: 10h)
   * Total Demand = 130 Units vs 100 Available at Hub A (Tripureshwor)!
   * 
   * Additional requests cover:
   * - Different municipalities & wards (KMC, LMC, Bhaktapur)
   * - Different items (Food, Water, Medical, Hygiene)
   * - Diverse states: Submitted, Under Review, Allocated, Dispatched, Delivered, Partially Fulfilled, Unfulfilled
   */
  const DEFAULT_REQUESTS = [
    // --- SECTION 12 SHOWCASE TEST SCENARIO ---
    {
      id: 'REQ-NEPAL-01',
      householdId: 'HH-KMC-01',
      householdRef: 'HH-KMC-01 (Elena Shrestha)',
      contactName: 'Elena Shrestha',
      phone: '9841-555101',
      municipality: 'Kathmandu Metropolitan City',
      ward: 3,
      community: 'Kathmandu Metropolitan City (Ward 3)',
      address: 'Near TU Teaching Hospital Gate, Maharajgunj',
      destinationNodeId: 'DEST_KMC_MAHARAJ',
      itemId: 'food',
      quantityRequested: 60,
      quantityAllocated: 0,
      quantityDelivered: 0,
      urgency: 'critical',
      notes: '★ [APM Showcase 1/2] 60 Food units requested. Sheltering 45 displaced persons in community school. Zero provisions remain for 14 hours.',
      status: 'submitted',
      allocatedHubId: null,
      assignedVehicleId: null,
      createdAt: '2018-06-01T04:00:00Z',
      waitingHours: 14,
      isShowcaseScenario: true,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T04:00:00Z', actor: 'Elena Shrestha (Household User)', note: 'Lodged collective emergency intake for 60 food packs via Civilian Portal.' }
      ]
    },
    {
      id: 'REQ-NEPAL-02',
      householdId: 'HH-LMC-02',
      householdRef: 'HH-LMC-02 (Sita & Dipak Tamang)',
      contactName: 'Sita & Dipak Tamang',
      phone: '9851-555202',
      municipality: 'Lalitpur Metropolitan City',
      ward: 15,
      community: 'Lalitpur Metropolitan City (Ward 15)',
      address: 'Satdobato Ring Road Residential Sector',
      destinationNodeId: 'DEST_LMC_SATDOBATO',
      itemId: 'food',
      quantityRequested: 70,
      quantityAllocated: 0,
      quantityDelivered: 0,
      urgency: 'high',
      notes: '★ [APM Showcase 2/2] 70 Food units requested. Combined with North (60), demand is 130 vs 100 units at Hub A (30 unit shortfall). Infants and elderly present.',
      status: 'under_review',
      allocatedHubId: null,
      assignedVehicleId: null,
      createdAt: '2018-06-01T08:00:00Z',
      waitingHours: 10,
      isShowcaseScenario: true,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T08:00:00Z', actor: 'Dipak Tamang (Household User)', note: 'Lodged emergency food request for 70 packs.' },
        { status: 'under_review', timestamp: '2018-06-01T08:30:00Z', actor: 'Saurabh Chaudhary (Coordinator)', note: 'Marked under review. Evaluating against Kathmandu Central Hub stockpile.' }
      ]
    },

    // --- ADDITIONAL MULTI-STAGE REALISTIC DEMAND ---
    {
      id: 'REQ-NEPAL-03',
      householdId: 'HH-KMC-04',
      householdRef: 'HH-KMC-04 (Maya & Naveen Rao)',
      contactName: 'Maya Rao',
      phone: '9841-555404',
      municipality: 'Kathmandu Metropolitan City',
      ward: 10,
      community: 'Kathmandu Metropolitan City (Ward 10)',
      address: 'New Baneshwor, Shantinagar Road',
      destinationNodeId: 'DEST_KMC_BANESH',
      itemId: 'water',
      quantityRequested: 4,
      quantityAllocated: 4,
      quantityDelivered: 0,
      urgency: 'high',
      notes: 'Municipal water pipe contaminated after power cutoff. Elderly grandmother needs clean hydration.',
      status: 'allocated',
      allocatedHubId: 'HUB-A',
      assignedVehicleId: null,
      createdAt: '2018-06-01T06:45:00Z',
      waitingHours: 16,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T06:45:00Z', actor: 'Maya Rao', note: 'Water shortage intake submitted.' },
        { status: 'under_review', timestamp: '2018-06-01T07:15:00Z', actor: 'Saurabh Chaudhary', note: 'Priority verified.' },
        { status: 'allocated', timestamp: '2018-06-01T08:00:00Z', actor: 'Saurabh Chaudhary', note: 'Allocated 4 water jerrycans from Tripureshwor Hub. Queued for courier.' }
      ]
    },
    {
      id: 'REQ-NEPAL-04',
      householdId: 'HH-LMC-05',
      householdRef: 'HH-LMC-05 (Pasang Sherpa)',
      contactName: 'Pasang Sherpa',
      phone: '9841-555505',
      municipality: 'Lalitpur Metropolitan City',
      ward: 2,
      community: 'Lalitpur Metropolitan City (Ward 2)',
      address: 'Sanepa Riverside Settlement',
      destinationNodeId: 'DEST_LMC_SANEPA',
      itemId: 'hygiene',
      quantityRequested: 3,
      quantityAllocated: 3,
      quantityDelivered: 0,
      urgency: 'high',
      notes: 'Two nursing mothers and 4-month-old infant. Baby formula depleted; water purification tablets needed.',
      status: 'dispatched',
      allocatedHubId: 'HUB-SOUTH',
      assignedVehicleId: 'VEH-01',
      createdAt: '2018-06-01T07:10:00Z',
      waitingHours: 16,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T07:10:00Z', actor: 'Pasang Sherpa', note: 'Infant sanitation request submitted.' },
        { status: 'under_review', timestamp: '2018-06-01T07:30:00Z', actor: 'Lt. Purna Shakya', note: 'Urgent infant nutritional triage confirmed.' },
        { status: 'allocated', timestamp: '2018-06-01T08:15:00Z', actor: 'Lt. Purna Shakya', note: 'Allocated 3 hygiene kits from Jawalakhel Depot.' },
        { status: 'dispatched', timestamp: '2018-06-01T09:30:00Z', actor: 'Logistics Desk', note: 'Loaded onto 4WD Rapid Van (Ba 2 Kha 4012). Estimated arrival: 18 mins.' }
      ]
    },
    {
      id: 'REQ-NEPAL-05',
      householdId: 'HH-BKT-03',
      householdRef: 'HH-BKT-03 (Bikash Prajapati)',
      contactName: 'Bikash Prajapati',
      phone: '9861-555303',
      municipality: 'Bhaktapur Municipality',
      ward: 2,
      community: 'Bhaktapur Municipality (Ward 2)',
      address: 'Byasi Traditional Quarter, House 42',
      destinationNodeId: 'DEST_BKT_BYASI',
      itemId: 'food',
      quantityRequested: 5,
      quantityAllocated: 5,
      quantityDelivered: 5,
      urgency: 'standard',
      notes: 'Pottery quarter residents. Provisions exhausted after local marketplace shutdown.',
      status: 'delivered',
      allocatedHubId: 'HUB-WATERFRONT',
      assignedVehicleId: 'VEH-04',
      createdAt: '2018-06-01T03:00:00Z',
      waitingHours: 20,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T03:00:00Z', actor: 'Bikash Prajapati', note: 'Household intake recorded.' },
        { status: 'under_review', timestamp: '2018-06-01T04:00:00Z', actor: 'Coord. Bimala Gurung', note: 'Standard queue review.' },
        { status: 'allocated', timestamp: '2018-06-01T05:00:00Z', actor: 'Coord. Bimala Gurung', note: '5 food packs allocated from Sallaghari Post.' },
        { status: 'dispatched', timestamp: '2018-06-01T06:30:00Z', actor: 'Logistics Desk', note: 'Dispatched via Volunteer Motorcycle Team Echo.' },
        { status: 'delivered', timestamp: '2018-06-01T08:45:00Z', actor: 'Driver A. Bista', note: 'Direct handover to Bikash Prajapati. Signed with biometric receipt.' }
      ]
    },
    {
      id: 'REQ-NEPAL-06',
      householdId: 'HH-BKT-06',
      householdRef: 'HH-BKT-06 (Narayan Joshi)',
      contactName: 'Narayan Joshi',
      phone: '9851-555606',
      municipality: 'Bhaktapur Municipality',
      ward: 9,
      community: 'Bhaktapur Municipality (Ward 9)',
      address: 'Kamalbinayak Settlement, Ward 9',
      destinationNodeId: 'DEST_BKT_KAMAL',
      itemId: 'food',
      quantityRequested: 15,
      quantityAllocated: 8,
      quantityDelivered: 0,
      urgency: 'high',
      notes: 'Residential complex with 10 isolated families due to road debris on inner link road.',
      status: 'partially_fulfilled',
      allocatedHubId: 'HUB-WATERFRONT',
      assignedVehicleId: null,
      createdAt: '2018-06-01T05:45:00Z',
      waitingHours: 17,
      history: [
        { status: 'submitted', timestamp: '2018-06-01T05:45:00Z', actor: 'Narayan Joshi', note: 'Collective intake logged.' },
        { status: 'under_review', timestamp: '2018-06-01T06:40:00Z', actor: 'Coord. Bimala Gurung', note: 'Evaluated against Sallaghari inventory.' },
        { status: 'partially_fulfilled', timestamp: '2018-06-01T07:45:00Z', actor: 'Coord. Bimala Gurung', note: 'Sallaghari depot only has 8 unreserved food packs. Partial dispatch approved; 7 units backordered to Kathmandu convoy.' }
      ]
    },
    {
      id: 'REQ-NEPAL-07',
      householdId: 'HH-KMC-01',
      householdRef: 'HH-KMC-01 (Elena Shrestha)',
      contactName: 'Elena Shrestha (Clinic Volunteer)',
      phone: '9841-555101',
      municipality: 'Kathmandu Metropolitan City',
      ward: 3,
      community: 'Kathmandu Metropolitan City (Ward 3)',
      address: 'Community First Aid Camp, Maharajgunj',
      destinationNodeId: 'DEST_KMC_MAHARAJ',
      itemId: 'medical',
      quantityRequested: 10,
      quantityAllocated: 0,
      quantityDelivered: 0,
      urgency: 'high',
      notes: 'Industrial trauma dressings and IV fluids for crash injuries.',
      status: 'unfulfilled',
      allocatedHubId: null,
      assignedVehicleId: null,
      createdAt: '2018-05-31T20:00:00Z',
      waitingHours: 27,
      history: [
        { status: 'submitted', timestamp: '2018-05-31T20:00:00Z', actor: 'Elena Shrestha', note: 'First aid camp requisition.' },
        { status: 'under_review', timestamp: '2018-05-31T22:00:00Z', actor: 'Saurabh Chaudhary', note: 'Evaluating medical stock across Valley depots.' },
        { status: 'unfulfilled', timestamp: '2018-06-01T01:30:00Z', actor: 'Saurabh Chaudhary', note: 'Current surgical packs prioritized for hospitals. Industrial packs backordered to National Health Reserve.' }
      ]
    }
  ];

  // Activity Audit Log
  const DEFAULT_ACTIVITIES = [
    {
      id: 'ACT-01',
      requestId: 'REQ-NEPAL-02',
      timestamp: '2018-06-01T08:30:00Z',
      type: 'review',
      actor: 'Saurabh Chaudhary (Coordinator)',
      description: 'Marked REQ-NEPAL-02 (South Lalitpur 70 Food packs) Under Review.'
    },
    {
      id: 'ACT-02',
      requestId: 'REQ-NEPAL-01',
      timestamp: '2018-06-01T04:00:00Z',
      type: 'intake',
      actor: 'Elena Shrestha (Household User)',
      description: 'Lodged emergency request REQ-NEPAL-01 for 60 food units in KMC Ward 3 (Maharajgunj).'
    },
    {
      id: 'ACT-03',
      requestId: 'REQ-NEPAL-04',
      timestamp: '2018-06-01T09:30:00Z',
      type: 'dispatch',
      actor: 'Lt. Purna Shakya (Coordinator)',
      description: 'Dispatched 4WD Van (Ba 2 Kha 4012) for REQ-NEPAL-04 (Infant formula, Sanepa LMC Ward 2).'
    },
    {
      id: 'ACT-04',
      requestId: 'REQ-NEPAL-05',
      timestamp: '2018-06-01T08:45:00Z',
      type: 'delivery',
      actor: 'Driver A. Bista (Motorcycle Courier)',
      description: 'Confirmed delivery of 5 Food Rations to Bikash Prajapati (REQ-NEPAL-05) in Byasi, Bhaktapur.'
    },
    {
      id: 'ACT-05',
      requestId: 'HUB-A',
      timestamp: '2018-06-01T08:30:00Z',
      type: 'stock',
      actor: 'National Emergency Logistics Corps',
      description: 'Received shipment of 100 Food Units at DC-1: Kathmandu Central Relief Hub (Tripureshwor).'
    },
    {
      id: 'ACT-06',
      requestId: 'REQ-NEPAL-06',
      timestamp: '2018-06-01T07:45:00Z',
      type: 'allocation',
      actor: 'Coord. Bimala Gurung (Coordinator)',
      description: 'Approved partial allocation: 8 of 15 Food Rations for REQ-NEPAL-06 due to Sallaghari depot stock limits.'
    },
    {
      id: 'ACT-07',
      requestId: 'REQ-NEPAL-03',
      timestamp: '2018-06-01T08:00:00Z',
      type: 'allocation',
      actor: 'Saurabh Chaudhary (Coordinator)',
      description: 'Allocated 4 water jerrycans for REQ-NEPAL-03 (Maya Rao, New Baneshwor) from Tripureshwor Hub.'
    }
  ];

  // Helper to load or initialize state
  function getInitialState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.requests && parsed.inventory && parsed.hubs) {
          if (!parsed.users) parsed.users = {};
          for (const dId in DEMO_USERS) {
            if (!parsed.users[dId]) {
              parsed.users[dId] = DEMO_USERS[dId];
            }
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using fresh initial state', e);
    }

    return {
      requests: JSON.parse(JSON.stringify(DEFAULT_REQUESTS)),
      inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)),
      hubs: JSON.parse(JSON.stringify(DEFAULT_HUBS)),
      vehicles: JSON.parse(JSON.stringify(DEFAULT_VEHICLES)),
      activities: JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES)),
      catalog: JSON.parse(JSON.stringify(ITEM_CATALOG)),
      users: JSON.parse(JSON.stringify(DEMO_USERS)),
      currentAuthUser: null, // Require explicit sign-in via credentials
      lastUpdated: new Date().toISOString()
    };
  }

  // Active state in memory
  let state = getInitialState();

  // Save current state to localStorage
  function persist() {
    try {
      state.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  // Reset demo to default state
  function resetDemo() {
    state = {
      requests: JSON.parse(JSON.stringify(DEFAULT_REQUESTS)),
      inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)),
      hubs: JSON.parse(JSON.stringify(DEFAULT_HUBS)),
      vehicles: JSON.parse(JSON.stringify(DEFAULT_VEHICLES)),
      activities: JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES)),
      catalog: JSON.parse(JSON.stringify(ITEM_CATALOG)),
      users: JSON.parse(JSON.stringify(DEMO_USERS)),
      currentAuthUser: null,
      lastUpdated: new Date().toISOString()
    };
    persist();
    return state;
  }

  // Add an activity record
  function logActivity(type, actor, description, requestId = null) {
    const activity = {
      id: 'ACT-' + Date.now().toString(36).toUpperCase(),
      requestId: requestId,
      timestamp: new Date().toISOString(),
      type: type, // 'intake', 'review', 'allocation', 'dispatch', 'delivery', 'stock', 'alert'
      actor: actor,
      description: description
    };
    state.activities.unshift(activity);
    if (state.activities.length > 100) {
      state.activities.pop();
    }
    persist();
    return activity;
  }

  // Calculation helpers: Available Stock for an item across or within hubs
  function getHubInventory(hubId, itemId) {
    return state.inventory.find(i => i.hubId === hubId && i.itemId === itemId);
  }

  function getAvailableStock(hubId, itemId) {
    const inv = getHubInventory(hubId, itemId);
    if (!inv) return 0;
    return Math.max(0, inv.totalStock - inv.reservedStock);
  }

  function getTotalAvailableForItem(itemId) {
    return state.inventory
      .filter(i => i.itemId === itemId)
      .reduce((sum, i) => sum + Math.max(0, i.totalStock - i.reservedStock), 0);
  }

  function getTotalStockSummary() {
    const summary = {};
    Object.keys(ITEM_CATALOG).forEach(cat => {
      const records = state.inventory.filter(i => i.itemId === cat);
      const total = records.reduce((s, r) => s + r.totalStock, 0);
      const reserved = records.reduce((s, r) => s + r.reservedStock, 0);
      const available = Math.max(0, total - reserved);
      summary[cat] = {
        name: ITEM_CATALOG[cat].name,
        unit: ITEM_CATALOG[cat].unit,
        total,
        reserved,
        available
      };
    });
    return summary;
  }

  // Requests filtered for specific household (Privacy Protection)
  function getRequestsForHousehold(householdId) {
    if (!householdId) return [];
    return state.requests.filter(r => r.householdId === householdId);
  }

  // Dashboard KPI metrics calculator
  function getDashboardMetrics() {
    const totalRequests = state.requests.length;
    const activeRequests = state.requests.filter(r => r.status !== 'delivered' && r.status !== 'unfulfilled').length;
    const urgentPending = state.requests.filter(
      r => (r.urgency === 'critical' || r.urgency === 'high') && (r.status === 'submitted' || r.status === 'under_review')
    ).length;

    // Total available units of all essentials
    const totalAvailableUnits = state.inventory.reduce((sum, inv) => {
      return sum + Math.max(0, inv.totalStock - inv.reservedStock);
    }, 0);

    const deliveriesInProgress = state.requests.filter(r => r.status === 'dispatched').length;
    const requestsFulfilled = state.requests.filter(r => r.status === 'delivered').length;
    const allocatedPendingDispatch = state.requests.filter(r => r.status === 'allocated' || r.status === 'partially_fulfilled').length;

    return {
      totalRequests,
      activeRequests,
      urgentPending,
      totalAvailableUnits,
      deliveriesInProgress,
      requestsFulfilled,
      allocatedPendingDispatch
    };
  }

  /**
   * Transparent, Deterministic Allocation Recommendation Heuristic
   * Factors:
   * 1. Urgency: Critical (50 pts), High (30 pts), Standard (10 pts)
   * 2. Waiting Time: 1.5 pts per hour, max 30 pts
   * 3. Road Feasibility & Proximity: 0 - 20 pts based on Dijkstra route computed from nearest hub
   * Score = Urgency + WaitTime + Feasibility (Total out of 100)
   */
  function evaluateAllocationRecommendation(request, objective = 'fastest_time') {
    if (!request) return null;

    // Use LifelineRouting to evaluate depots with available stock
    let routeAnalysis = null;
    if (typeof LifelineRouting !== 'undefined') {
      routeAnalysis = LifelineRouting.evaluateSupplyCentresAndRoutes(request, state.inventory, objective);
    }

    // Determine target hub
    let preferredHubId = 'HUB-A';
    let selectedHub = state.hubs.find(h => h.id === 'HUB-A');
    let unreservedStock = getAvailableStock('HUB-A', request.itemId);

    if (routeAnalysis && routeAnalysis.selectedHubId) {
      preferredHubId = routeAnalysis.selectedHubId;
      selectedHub = state.hubs.find(h => h.id === preferredHubId) || selectedHub;
      unreservedStock = routeAnalysis.availableStock;
    }

    // Heuristic Score Calculation
    let urgencyScore = request.urgency === 'critical' ? 50 : request.urgency === 'high' ? 30 : 10;
    const waitHours = request.waitingHours || 10;
    let waitScore = Math.min(30, Math.round(waitHours * 1.5));

    // Feasibility score computed from Dijkstra transit time
    let feasibilityScore = 15;
    if (routeAnalysis && routeAnalysis.route && routeAnalysis.route.success) {
      const timeMin = routeAnalysis.route.totalTimeMin;
      // Faster routes earn up to 20 pts
      feasibilityScore = Math.max(5, Math.min(20, Math.round(25 - (timeMin * 0.4))));
    }

    const totalPriorityScore = urgencyScore + waitScore + feasibilityScore;

    // Suggested allocation quantity (strictly capped at unreserved stock)
    let suggestedQty = 0;
    let isPartial = false;
    let shortageDetected = false;

    if (unreservedStock >= request.quantityRequested) {
      suggestedQty = request.quantityRequested;
      isPartial = false;
    } else if (unreservedStock > 0) {
      suggestedQty = unreservedStock;
      isPartial = true;
      shortageDetected = true;
    } else {
      suggestedQty = 0;
      shortageDetected = true;
    }

    // Generate clear, deterministic, plain-language explanation
    const itemMeta = ITEM_CATALOG[request.itemId] || { name: 'Supplies', unit: 'units' };
    let explanation = '';
    let recommendationType = 'FULL_ALLOCATION';

    if (unreservedStock <= 0) {
      recommendationType = 'INVENTORY_SHORTAGE';
      explanation = `CRITICAL SHORTAGE: Zero unreserved stock of ${itemMeta.name} is available at ${selectedHub.name} or regional fallback depots. Recommend initiating inter-depot convoy or emergency requisition.`;
    } else if (isPartial) {
      recommendationType = 'PARTIAL_ALLOCATION';
      const remainingUnmet = request.quantityRequested - suggestedQty;
      explanation = `Recommended Partial Allocation (${suggestedQty} of ${request.quantityRequested} ${itemMeta.unit}): Request priority is high (Score ${totalPriorityScore}/100, waiting ${waitHours}h), but ${selectedHub.shortName || selectedHub.name} has only ${unreservedStock} unreserved units. Recommend immediate partial dispatch of ${suggestedQty} units to prevent acute distress, while keeping ${remainingUnmet} units visibly backordered for the next scheduled convoy.`;
    } else {
      recommendationType = 'FULL_ALLOCATION';
      explanation = `Recommended Full Allocation (${suggestedQty} ${itemMeta.unit}): Request priority is high (Score ${totalPriorityScore}/100 based on ${request.urgency.toUpperCase()} urgency [${urgencyScore} pts], ${waitHours}h waiting time [${waitScore} pts], and optimal route from ${selectedHub.shortName || selectedHub.name} [${feasibilityScore} pts]). Sufficient unreserved stock (${unreservedStock} units available) is verified.`;
    }

    return {
      requestId: request.id,
      priorityScore: totalPriorityScore,
      scoreBreakdown: {
        urgencyScore,
        waitScore,
        feasibilityScore,
        urgencyLevel: request.urgency,
        waitingHours: waitHours
      },
      recommendedHubId: preferredHubId,
      recommendedHubName: selectedHub ? selectedHub.name : 'Unknown Depot',
      unreservedStockAtHub: unreservedStock,
      requestedQuantity: request.quantityRequested,
      suggestedQuantity: suggestedQty,
      isPartial: isPartial,
      shortageDetected: shortageDetected,
      recommendationType: recommendationType,
      explanation: explanation,
      routeAnalysis
    };
  }

  // Public Interface
  return {
    STORAGE_KEY,
    ITEM_CATALOG,
    DEMO_USERS,
    getState: function () {
      return state;
    },
    getCurrentAuthUser: function () {
      return state.currentAuthUser;
    },
    setCurrentAuthUser: function (userId) {
      const allUsers = Object.assign({}, DEMO_USERS, state.users || {});
      const user = allUsers[userId] || this.findUser(userId);
      if (user) {
        state.currentAuthUser = JSON.parse(JSON.stringify(user));
        persist();
      }
    },
    clearAuthUser: function () {
      state.currentAuthUser = null;
      persist();
    },
    findUser: function (identifier) {
      if (!identifier) return null;
      const cleanId = String(identifier).trim().toLowerCase();
      const cleanDigits = cleanId.replace(/\D/g, '');
      const allUsers = Object.assign({}, DEMO_USERS, state.users || {});
      for (const id in allUsers) {
        const u = allUsers[id];
        if (id.toLowerCase() === cleanId) return u;
        if (u.name && u.name.toLowerCase() === cleanId) return u;
        if (u.phone) {
          const phoneClean = String(u.phone).toLowerCase();
          const phoneDigits = phoneClean.replace(/\D/g, '');
          if (phoneClean === cleanId) return u;
          if (cleanDigits && phoneDigits) {
            if (cleanDigits === phoneDigits) return u;
            if (cleanDigits.length >= 7 && phoneDigits.endsWith(cleanDigits)) return u;
            if (phoneDigits.length >= 7 && cleanDigits.endsWith(phoneDigits)) return u;
          }
        }
      }
      return null;
    },
    authenticate: function (identifier, pin) {
      const user = this.findUser(identifier);
      if (!user) {
        return { success: false, error: 'User identifier or phone number not recognized in Kathmandu Valley registry.' };
      }
      if (user.pin && String(user.pin).trim() !== String(pin).trim()) {
        return { success: false, error: 'Incorrect 4-digit security PIN. Access denied.' };
      }
      state.currentAuthUser = JSON.parse(JSON.stringify(user));
      persist();
      return { success: true, user: state.currentAuthUser };
    },
    registerHousehold: function (data) {
      const cleanName = String(data.name || '').trim();
      const cleanPhone = String(data.phone || '').trim();
      const cleanPin = String(data.pin || '1234').trim();
      const muni = data.municipality || 'Kathmandu Metropolitan City';
      const ward = parseInt(data.ward, 10) || 1;
      const locality = data.locality ? String(data.locality).trim() : `${muni}, Ward ${ward}`;

      // Check for duplicate phone
      const existing = this.findUser(cleanPhone);
      if (existing) {
        return { success: false, error: `Phone number ${cleanPhone} is already registered to ${existing.name}. Please sign in with your PIN.` };
      }

      // Generate friendly Household ID
      let prefix = 'HH-KMC';
      if (muni.includes('Lalitpur')) prefix = 'HH-LMC';
      else if (muni.includes('Bhaktapur')) prefix = 'HH-BKT';
      const num = Math.floor(100 + Math.random() * 900);
      const customId = `${prefix}-${num}`;

      const initials = cleanName.split(/\s+/).map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'HH';

      const newUser = {
        id: customId,
        role: 'household',
        name: cleanName,
        phone: cleanPhone,
        pin: cleanPin,
        municipality: muni,
        ward: ward,
        locality: locality,
        householdSize: parseInt(data.householdSize, 10) || 4,
        avatar: initials
      };

      if (!state.users) state.users = Object.assign({}, DEMO_USERS);
      state.users[customId] = newUser;
      DEMO_USERS[customId] = newUser;
      state.currentAuthUser = JSON.parse(JSON.stringify(newUser));
      persist();
      return { success: true, user: newUser };
    },
    persist,
    resetDemo,
    logActivity,
    getHubInventory,
    getAvailableStock,
    getTotalAvailableForItem,
    getTotalStockSummary,
    getRequestsForHousehold,
    getDashboardMetrics,
    evaluateAllocationRecommendation
  };
})();

// Export for Node test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifelineData;
}
