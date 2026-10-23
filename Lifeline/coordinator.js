/**
 * Lifeline — Emergency Essential Supplies Coordination Platform
 * Coordinator Operations Module (Nepal Setting)
 * Powers Operations Command, Multi-Hub Inventory, Explainable Heuristics,
 * Dijkstra Route Optimization, and Delivery Logistics in Kathmandu Valley.
 */

const CoordinatorModule = (function () {
  'use strict';

  let currentSelectedRequestId = null;
  let activeAllocationRequestId = 'REQ-NEPAL-01';
  let activeRoutingObjective = 'fastest_time'; // 'fastest_time' | 'shortest_distance' | 'risk_aware'

  let requestTableFilter = {
    search: '',
    status: 'ALL',
    urgency: 'ALL',
    municipality: 'ALL',
    ward: 'ALL'
  };

  let timelineFilter = {
    search: '',
    type: 'ALL'
  };

  function init() {
    bindOverviewEvents();
    bindRequestTableEvents();
    bindInventoryEvents();
    bindAllocationWorkspaceEvents();
    bindDeliveryEvents();
    bindTimelineEvents();
    bindModalEvents();
    bindScenarioShowcaseEvents();

    // Initial render
    refreshViews();
  }

  // Refresh all coordinator screens
  function refreshViews() {
    updateLoggedInCoordinatorBadge();
    renderDashboardKPIs();
    renderKathmanduSchematicMap();
    renderOverviewRequestsQueue();
    renderInventorySummaryCards();
    renderShortageAlerts();
    renderActivityFeed();
    renderRequestsTable();
    renderInventoryMatrix();
    renderAllocationWorkspace();
    renderDeliveriesTracker();
    renderFullActivityTimeline();
  }

  function updateLoggedInCoordinatorBadge() {
    const user = LifelineData.getCurrentAuthUser();
    const nameEl = document.getElementById('coord-auth-officer-name');
    const titleEl = document.getElementById('coord-auth-officer-title');
    if (user && user.role === 'coordinator') {
      if (nameEl) nameEl.textContent = user.name;
      if (titleEl) titleEl.textContent = `${user.title} (${user.station})`;
    }
  }

  /* ==========================================================================
     Screen 1: Operations Overview & KPIs (Kathmandu Valley)
     ========================================================================== */

  function renderDashboardKPIs() {
    const metrics = LifelineData.getDashboardMetrics();

    const activeEl = document.getElementById('kpi-active-requests');
    const urgentEl = document.getElementById('kpi-urgent-requests');
    const suppliesEl = document.getElementById('kpi-total-supplies');
    const dispatchesEl = document.getElementById('kpi-dispatched-count');
    const fulfilledEl = document.getElementById('kpi-fulfilled-count');

    if (activeEl) activeEl.textContent = metrics.activeRequests;
    if (urgentEl) urgentEl.textContent = metrics.urgentPending;
    if (suppliesEl) suppliesEl.textContent = metrics.totalAvailableUnits.toLocaleString();
    if (dispatchesEl) dispatchesEl.textContent = metrics.deliveriesInProgress;
    if (fulfilledEl) fulfilledEl.textContent = metrics.requestsFulfilled;

    // Update notification badges on sidebar
    const urgentNavBadge = document.getElementById('nav-badge-urgent-requests');
    if (urgentNavBadge) {
      urgentNavBadge.textContent = metrics.urgentPending;
      urgentNavBadge.style.display = metrics.urgentPending > 0 ? 'inline-block' : 'none';
    }

    const allocationNavBadge = document.getElementById('nav-badge-allocation-count');
    if (allocationNavBadge) {
      const pendingAllocation = LifelineData.getState().requests.filter(
        r => r.status === 'submitted' || r.status === 'under_review'
      ).length;
      allocationNavBadge.textContent = pendingAllocation;
      allocationNavBadge.style.display = pendingAllocation > 0 ? 'inline-block' : 'none';
    }
  }

  function renderKathmanduSchematicMap() {
    const mapContainer = document.getElementById('schematic-map-pins');
    if (!mapContainer) return;

    const state = LifelineData.getState();
    let pinsHtml = '';

    // Render Kathmandu Valley Hubs
    state.hubs.forEach(hub => {
      pinsHtml += `
        <div class="map-hub-pin" style="left: ${hub.coords.x}%; top: ${hub.coords.y}%;" 
             title="${hub.name} (${hub.status})" data-hub-id="${hub.id}">
          <div class="hub-pin-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="hub-pin-label">${hub.shortName || hub.name.split(':')[0]}</div>
        </div>
      `;
    });

    // Render Demand Hotspots in Kathmandu Valley
    const hotspots = [
      { x: 44, y: 22, label: 'Maharajgunj (KMC W-3)' },
      { x: 56, y: 54, label: 'New Baneshwor (KMC W-10)' },
      { x: 54, y: 86, label: 'Satdobato (LMC W-15)' },
      { x: 86, y: 48, label: 'Byasi (Bhaktapur W-2)' }
    ];

    hotspots.forEach(spot => {
      pinsHtml += `
        <div class="map-demand-cluster" style="left: ${spot.x}%; top: ${spot.y}%;" 
             title="Demand Cluster: ${spot.label}"></div>
      `;
    });

    mapContainer.innerHTML = pinsHtml;

    // Attach pin click event to quickly view hub stock
    mapContainer.querySelectorAll('.map-hub-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const hubId = pin.dataset.hubId;
        LifelineApp.navigateTo('inventory');
        const hubSelect = document.getElementById('inv-hub-filter');
        if (hubSelect) {
          hubSelect.value = hubId;
          hubSelect.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  function renderOverviewRequestsQueue() {
    const container = document.getElementById('overview-requests-tbody');
    if (!container) return;

    const state = LifelineData.getState();
    const prioritized = [...state.requests]
      .filter(r => r.status === 'submitted' || r.status === 'under_review')
      .sort((a, b) => {
        const uOrder = { critical: 3, high: 2, standard: 1 };
        return (uOrder[b.urgency] || 0) - (uOrder[a.urgency] || 0);
      })
      .slice(0, 5);

    if (prioritized.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--slate-500); padding: 1.5rem;">
            No unallocated pending requests. All demand processed or queued in delivery.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = prioritized.map(req => {
      const item = LifelineData.ITEM_CATALOG[req.itemId] || { name: req.itemId, unit: 'units' };
      return `
        <tr data-req-id="${req.id}" class="clickable-req-row">
          <td class="table-req-id">${req.id}</td>
          <td>
            <div class="table-household-info">
              <span class="table-household-name">${req.contactName}</span>
              <span class="table-household-comm">${req.municipality} (Ward ${req.ward})</span>
            </div>
          </td>
          <td><strong>${req.quantityRequested}</strong> ${item.unit}</td>
          <td><span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-secondary btn-sm js-quick-triage-btn" data-req-id="${req.id}">
              Triage & Allocate
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.clickable-req-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.js-quick-triage-btn')) return;
        openRequestDetailModal(row.dataset.reqId);
      });
    });

    container.querySelectorAll('.js-quick-triage-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAllocationWorkspaceFor(btn.dataset.reqId);
      });
    });
  }

  function renderInventorySummaryCards() {
    const container = document.getElementById('overview-stock-bars');
    if (!container) return;

    const summary = LifelineData.getTotalStockSummary();
    const categories = Object.keys(summary);

    container.innerHTML = categories.map(cat => {
      const data = summary[cat];
      const maxReference = 1000;
      const availPct = Math.min(100, (data.available / maxReference) * 100);
      const resPct = Math.min(100, (data.reserved / maxReference) * 100);

      return `
        <div class="stock-bar-group">
          <div class="stock-bar-info">
            <span style="color: var(--slate-900);">${data.name}</span>
            <span>
              <strong style="color: var(--status-success);">${data.available}</strong> Avail / 
              <span style="color: var(--status-high);">${data.reserved}</span> Rsvd
            </span>
          </div>
          <div class="stock-bar-track" title="${data.available} Available, ${data.reserved} Reserved">
            <div class="stock-bar-fill-available" style="width: ${availPct}%;"></div>
            <div class="stock-bar-fill-reserved" style="width: ${resPct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderShortageAlerts() {
    const alertBox = document.getElementById('overview-shortage-alert');
    if (!alertBox) return;

    const state = LifelineData.getState();
    const criticalReqs = state.requests.filter(r => r.urgency === 'critical' && r.status !== 'delivered');
    
    let shortages = [];
    Object.keys(LifelineData.ITEM_CATALOG).forEach(cat => {
      const avail = LifelineData.getTotalAvailableForItem(cat);
      const demand = criticalReqs.filter(r => r.itemId === cat).reduce((s, r) => s + r.quantityRequested, 0);
      if (avail < demand || avail < 40) {
        shortages.push({
          category: LifelineData.ITEM_CATALOG[cat].name,
          avail,
          demand
        });
      }
    });

    if (shortages.length > 0) {
      alertBox.style.display = 'flex';
      alertBox.className = 'alert-banner critical';
      alertBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div>
          <strong>Kathmandu Valley Supply Advisory:</strong> Critical buffer deficit for 
          ${shortages.map(s => `${s.category} (${s.avail} avail vs ${s.demand} critical demand)`).join(', ')}. 
          Priority rationing protocol and inter-depot convoys required.
        </div>
      `;
    } else {
      alertBox.style.display = 'flex';
      alertBox.className = 'alert-banner info';
      alertBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <strong>Operational Stability:</strong> Regional warehouse reserves meet baseline quotas across Kathmandu, Lalitpur, and Bhaktapur bases.
        </div>
      `;
    }
  }

  function renderActivityFeed() {
    const list = document.getElementById('overview-activity-list');
    if (!list) return;

    const activities = LifelineData.getState().activities;
    list.innerHTML = activities.slice(0, 6).map(act => {
      let icon = '⚡';
      if (act.type === 'allocation') icon = '⚖️';
      if (act.type === 'dispatch') icon = '🚚';
      if (act.type === 'delivery') icon = '✅';
      if (act.type === 'stock') icon = '📦';
      if (act.type === 'intake') icon = '📥';

      return `
        <div class="activity-item">
          <div class="activity-icon-badge ${act.type}">${icon}</div>
          <div class="activity-content">
            <div class="activity-text">${act.description}</div>
            <div class="activity-meta">${formatActivityTime(act.timestamp)} • ${act.actor}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     Screen 3: Request Management Datatable & Actions (Nepal Specific)
     ========================================================================== */

  function bindRequestTableEvents() {
    const searchInput = document.getElementById('req-search-input');
    const statusSelect = document.getElementById('req-status-filter');
    const urgencySelect = document.getElementById('req-urgency-filter');
    const muniSelect = document.getElementById('req-municipality-filter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        requestTableFilter.search = e.target.value.toLowerCase();
        renderRequestsTable();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        requestTableFilter.status = e.target.value;
        renderRequestsTable();
      });
    }

    if (urgencySelect) {
      urgencySelect.addEventListener('change', (e) => {
        requestTableFilter.urgency = e.target.value;
        renderRequestsTable();
      });
    }

    if (muniSelect) {
      muniSelect.addEventListener('change', (e) => {
        requestTableFilter.municipality = e.target.value;
        renderRequestsTable();
      });
    }
  }

  function renderRequestsTable() {
    const tbody = document.getElementById('requests-datatable-tbody');
    const countBadge = document.getElementById('requests-total-count');
    if (!tbody) return;

    const state = LifelineData.getState();
    let filtered = state.requests.filter(req => {
      if (requestTableFilter.status !== 'ALL' && req.status !== requestTableFilter.status) return false;
      if (requestTableFilter.urgency !== 'ALL' && req.urgency !== requestTableFilter.urgency) return false;
      if (requestTableFilter.municipality !== 'ALL' && !req.municipality.includes(requestTableFilter.municipality)) return false;
      if (requestTableFilter.search) {
        const query = requestTableFilter.search;
        const matches = 
          req.id.toLowerCase().includes(query) ||
          req.contactName.toLowerCase().includes(query) ||
          req.municipality.toLowerCase().includes(query) ||
          (req.address && req.address.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${state.requests.length} Requests`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-500);">
            No emergency requests found matching the current filters in Kathmandu Valley.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(req => {
      const item = LifelineData.ITEM_CATALOG[req.itemId] || { name: req.itemId, unit: 'units' };
      const waitHours = req.waitingHours || 10;
      const hubName = req.allocatedHubId ? getHubName(req.allocatedHubId) : null;

      return `
        <tr data-req-id="${req.id}" class="clickable-req-row">
          <td class="table-req-id">${req.id}</td>
          <td>
            <div class="table-household-info">
              <span class="table-household-name">${req.contactName}</span>
              <span class="table-household-comm">${req.municipality} (Ward ${req.ward})</span>
            </div>
          </td>
          <td>
            <strong>${req.quantityRequested}</strong> ${item.unit}
            ${req.quantityAllocated > 0 ? `<div style="font-size: 0.72rem; color: var(--navy-600);">${req.quantityAllocated} Allocated</div>` : ''}
          </td>
          <td>
            <span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span>
          </td>
          <td>
            <span style="font-size: 0.76rem; color: var(--slate-600);">${waitHours} hrs</span>
          </td>
          <td>
            <span class="badge badge-${req.status}">${formatStatusLabel(req.status)}</span>
          </td>
          <td>
            ${hubName ? `<span style="font-size: 0.76rem; font-weight: 600; color: var(--slate-700);">${hubName.split(':')[0]}</span>` : `<span style="color: var(--slate-400); font-size: 0.72rem;">Pending Hub</span>`}
          </td>
          <td>
            <button class="btn btn-secondary btn-sm js-view-detail-btn" data-req-id="${req.id}">
              Inspect
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.clickable-req-row').forEach(row => {
      row.addEventListener('click', () => {
        openRequestDetailModal(row.dataset.reqId);
      });
    });
  }

  /* ==========================================================================
     Screen 4: Inventory Matrix & Stock Inbound
     ========================================================================== */

  function bindInventoryEvents() {
    const hubFilter = document.getElementById('inv-hub-filter');
    const itemFilter = document.getElementById('inv-item-filter');

    if (hubFilter) hubFilter.addEventListener('change', renderInventoryMatrix);
    if (itemFilter) itemFilter.addEventListener('change', renderInventoryMatrix);

    const openReceiptModalBtn = document.getElementById('btn-open-stock-receipt');
    if (openReceiptModalBtn) {
      openReceiptModalBtn.addEventListener('click', () => {
        openModal('stock-receipt-modal');
      });
    }

    const saveStockBtn = document.getElementById('btn-save-stock-receipt');
    if (saveStockBtn) {
      saveStockBtn.addEventListener('click', handleStockReceiptSubmission);
    }
  }

  function renderInventoryMatrix() {
    const container = document.getElementById('inventory-matrix-cards');
    if (!container) return;

    const hubFilterVal = document.getElementById('inv-hub-filter') ? document.getElementById('inv-hub-filter').value : 'ALL';
    const itemFilterVal = document.getElementById('inv-item-filter') ? document.getElementById('inv-item-filter').value : 'ALL';

    const state = LifelineData.getState();
    let hubsToDisplay = state.hubs;
    if (hubFilterVal !== 'ALL') {
      hubsToDisplay = hubsToDisplay.filter(h => h.id === hubFilterVal);
    }

    container.innerHTML = hubsToDisplay.map(hub => {
      let records = state.inventory.filter(i => i.hubId === hub.id);
      if (itemFilterVal !== 'ALL') {
        records = records.filter(i => i.itemId === itemFilterVal);
      }

      return `
        <div class="hub-card">
          <div class="hub-card-header">
            <div>
              <div class="hub-name">${hub.name}</div>
              <div class="hub-sector">${hub.location} (${hub.municipality}, Ward ${hub.ward})</div>
            </div>
            <span class="badge ${hub.status.includes('Fully') ? 'badge-delivered' : 'badge-allocated'}">${hub.status}</span>
          </div>

          <table class="hub-stock-table">
            <thead>
              <tr>
                <th>Essential Item</th>
                <th>Total Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(r => {
                const item = LifelineData.ITEM_CATALOG[r.itemId];
                const available = Math.max(0, r.totalStock - r.reservedStock);
                const isCritical = available < r.criticalThreshold;
                const isLow = available < r.criticalThreshold * 1.5;

                let statusBadge = `<span class="badge badge-delivered">Healthy</span>`;
                if (isCritical) {
                  statusBadge = `<span class="badge badge-critical">Critical Shortage</span>`;
                } else if (isLow) {
                  statusBadge = `<span class="badge badge-high">Low Buffer</span>`;
                }

                return `
                  <tr>
                    <td><strong>${item ? item.name : r.itemId}</strong></td>
                    <td>${r.totalStock}</td>
                    <td style="color: var(--status-high); font-weight: 600;">${r.reservedStock}</td>
                    <td><strong style="color: var(--status-success); font-size: 0.95rem;">${available}</strong></td>
                    <td>${statusBadge}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--slate-100); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--slate-600);">
            <span>Officer: <strong>${hub.officer}</strong></span>
            <span>Road Access: <strong>${hub.accessRoads.split('—')[0]}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  function handleStockReceiptSubmission() {
    const hubId = document.getElementById('receipt-hub-select').value;
    const itemId = document.getElementById('receipt-item-select').value;
    const qtyInput = document.getElementById('receipt-qty-input');
    const quantity = parseInt(qtyInput.value, 10);
    const source = document.getElementById('receipt-source-input').value.trim();

    if (!hubId || !itemId) {
      LifelineApp.showToast('Please select both a Distribution Centre and an Essential Item.', 'warning');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      LifelineApp.showToast('Quantity received must be a positive integer.', 'warning');
      return;
    }

    const state = LifelineData.getState();
    const inv = state.inventory.find(i => i.hubId === hubId && i.itemId === itemId);

    if (inv) {
      inv.totalStock += quantity;
      inv.lastRestocked = new Date().toISOString();
    } else {
      state.inventory.push({
        hubId,
        itemId,
        totalStock: quantity,
        reservedStock: 0,
        criticalThreshold: 30,
        lastRestocked: new Date().toISOString()
      });
    }

    const hubName = getHubName(hubId);
    const itemName = LifelineData.ITEM_CATALOG[itemId].name;

    LifelineData.logActivity(
      'stock',
      source || 'National Emergency Logistics Corps',
      `Restocked ${quantity} units of ${itemName} at ${hubName}.`,
      hubId
    );
    LifelineData.persist();

    closeModal('stock-receipt-modal');
    qtyInput.value = '';
    document.getElementById('receipt-source-input').value = '';

    LifelineApp.showToast(`Inbound shipment logged: +${quantity} ${itemName} at ${hubName}.`, 'success');
    refreshViews();
  }

  /* ==========================================================================
     Screen 5: Allocation Centre Workspace & Dijkstra Route Optimization
     ========================================================================== */

  function bindAllocationWorkspaceEvents() {
    const qtySlider = document.getElementById('alloc-qty-slider');
    const qtyNumber = document.getElementById('alloc-qty-number');

    if (qtySlider && qtyNumber) {
      qtySlider.addEventListener('input', (e) => {
        qtyNumber.value = e.target.value;
        validateAllocationOverrideNotice();
      });
      qtyNumber.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          qtySlider.value = val;
          validateAllocationOverrideNotice();
        }
      });
    }

    const hubSelector = document.getElementById('alloc-hub-select');
    if (hubSelector) {
      hubSelector.addEventListener('change', () => {
        updateAllocationStockCapacity();
        validateAllocationOverrideNotice();
      });
    }

    // Optimization Objective selector
    const objectiveSelector = document.getElementById('alloc-route-objective-select');
    if (objectiveSelector) {
      objectiveSelector.addEventListener('change', (e) => {
        activeRoutingObjective = e.target.value;
        const req = LifelineData.getState().requests.find(r => r.id === activeAllocationRequestId);
        if (req) renderAllocationDecisionDetails(req);
      });
    }

    const approveBtn = document.getElementById('btn-confirm-allocation');
    if (approveBtn) {
      approveBtn.addEventListener('click', handleConfirmAllocation);
    }
  }

  function renderAllocationWorkspace() {
    const queueList = document.getElementById('alloc-pending-queue');
    if (!queueList) return;

    const state = LifelineData.getState();
    const pendingReqs = state.requests.filter(
      r => r.status === 'submitted' || r.status === 'under_review' || r.status === 'partially_fulfilled'
    );

    if (pendingReqs.length === 0) {
      queueList.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--slate-500); background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
          <p>No unallocated requests currently pending in Kathmandu Valley.</p>
          <small>Switch to Household Portal to submit an intake request to test allocation & route finding.</small>
        </div>
      `;
      const decisionPanel = document.getElementById('alloc-decision-workspace');
      if (decisionPanel) decisionPanel.style.display = 'none';
      return;
    }

    const decisionPanel = document.getElementById('alloc-decision-workspace');
    if (decisionPanel) decisionPanel.style.display = 'block';

    if (!activeAllocationRequestId || !pendingReqs.find(r => r.id === activeAllocationRequestId)) {
      activeAllocationRequestId = pendingReqs[0].id;
    }

    queueList.innerHTML = pendingReqs.map(req => {
      const rec = LifelineData.evaluateAllocationRecommendation(req, activeRoutingObjective);
      const isSelected = req.id === activeAllocationRequestId;
      const item = LifelineData.ITEM_CATALOG[req.itemId];

      return `
        <div class="allocation-req-card ${isSelected ? 'selected' : ''}" data-req-id="${req.id}">
          <div class="allocation-req-card-header">
            <span class="table-req-id">${req.id}</span>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span>
              <span class="heuristics-badge">Priority ${rec.priorityScore}/100</span>
            </div>
          </div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.2rem;">
            ${req.contactName} • ${req.municipality} (W-${req.ward})
          </div>
          <div style="font-size: 0.78rem; color: var(--slate-600);">
            Demand: <strong>${req.quantityRequested}</strong> ${item.unit}
          </div>
          <div style="margin-top: 0.45rem; font-size: 0.72rem; color: ${rec.isPartial ? 'var(--status-high-text)' : rec.shortageDetected ? 'var(--status-critical)' : 'var(--status-success-text)'};">
            ${rec.isPartial ? '⚠️ Partial Allocation Required' : rec.shortageDetected ? '❌ Hub Stockout Alert' : '✅ Full Stock & Route Available'}
          </div>
        </div>
      `;
    }).join('');

    queueList.querySelectorAll('.allocation-req-card').forEach(card => {
      card.addEventListener('click', () => {
        openAllocationWorkspaceFor(card.dataset.reqId);
      });
    });

    const selectedReq = pendingReqs.find(r => r.id === activeAllocationRequestId);
    if (selectedReq) {
      renderAllocationDecisionDetails(selectedReq);
    }
  }

  function openAllocationWorkspaceFor(requestId) {
    activeAllocationRequestId = requestId;
    LifelineApp.navigateTo('allocation');
    renderAllocationWorkspace();
  }

  function renderAllocationDecisionDetails(req) {
    const rec = LifelineData.evaluateAllocationRecommendation(req, activeRoutingObjective);
    const item = LifelineData.ITEM_CATALOG[req.itemId];

    // Request Header
    document.getElementById('alloc-target-req-id').textContent = req.id;
    document.getElementById('alloc-target-household').textContent = `${req.contactName} (${req.householdRef})`;
    document.getElementById('alloc-target-community').textContent = `${req.municipality} (Ward ${req.ward}) • Delivery Locality: ${req.address}`;
    document.getElementById('alloc-target-notes').textContent = req.notes;

    // Triage Score Breakdown
    document.getElementById('alloc-score-total').textContent = rec.priorityScore;
    document.getElementById('alloc-score-urgency').textContent = `+${rec.scoreBreakdown.urgencyScore} pts (${rec.scoreBreakdown.urgencyLevel.toUpperCase()})`;
    document.getElementById('alloc-score-wait').textContent = `+${rec.scoreBreakdown.waitScore} pts (${rec.scoreBreakdown.waitingHours}h wait)`;
    document.getElementById('alloc-score-feasibility').textContent = `+${rec.scoreBreakdown.feasibilityScore} pts (Dijkstra route effort)`;

    // Recommendation Banner
    const recBox = document.getElementById('alloc-recommendation-box');
    const recTitle = document.getElementById('alloc-rec-title');
    const recText = document.getElementById('alloc-rec-text');

    if (rec.recommendationType === 'FULL_ALLOCATION') {
      recBox.className = 'recommendation-box full';
      recTitle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Transparent Recommendation: Approve Full Allocation
      `;
    } else if (rec.recommendationType === 'PARTIAL_ALLOCATION') {
      recBox.className = 'recommendation-box partial';
      recTitle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Transparent Recommendation: Partial Allocation (${rec.suggestedQuantity} of ${req.quantityRequested})
      `;
    } else {
      recBox.className = 'recommendation-box shortage';
      recTitle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        </svg>
        Inventory Shortage Alert: Zero Unreserved Stock Available
      `;
    }
    recText.textContent = rec.explanation;

    // Route Optimization Breakdown Display
    renderDijkstraRouteDetails(rec.routeAnalysis);

    // Populate Hub Selector dropdown
    const hubSelect = document.getElementById('alloc-hub-select');
    const state = LifelineData.getState();
    hubSelect.innerHTML = state.hubs.map(h => {
      const inv = LifelineData.getHubInventory(h.id, req.itemId);
      const avail = inv ? Math.max(0, inv.totalStock - inv.reservedStock) : 0;
      return `<option value="${h.id}" ${h.id === rec.recommendedHubId ? 'selected' : ''}>
        ${h.name} (${avail} unreserved ${item.unit})
      </option>`;
    }).join('');

    // Setup Quantity Slider & Controls
    const qtySlider = document.getElementById('alloc-qty-slider');
    const qtyNumber = document.getElementById('alloc-qty-number');
    const maxAllowed = Math.max(0, rec.unreservedStockAtHub);

    qtySlider.max = Math.max(1, Math.min(req.quantityRequested, maxAllowed));
    qtySlider.min = maxAllowed > 0 ? 1 : 0;
    qtySlider.value = rec.suggestedQuantity;
    qtyNumber.value = rec.suggestedQuantity;
    qtyNumber.max = qtySlider.max;

    document.getElementById('alloc-unit-label').textContent = item.unit;
    updateAllocationStockCapacity();
    validateAllocationOverrideNotice();
  }

  // Render Dijkstra computed route sequence, alternatives, and warnings
  function renderDijkstraRouteDetails(routeAnalysis) {
    const routeBox = document.getElementById('alloc-route-optimization-box');
    if (!routeBox) return;

    if (!routeAnalysis || !routeAnalysis.route || !routeAnalysis.route.success) {
      routeBox.innerHTML = `
        <div class="alert-banner critical">
          No feasible open road route found to destination. Check for landslides or blocked arterial roads in Kathmandu Valley.
        </div>
      `;
      return;
    }

    const route = routeAnalysis.route;
    const nodes = LifelineRouting.GRAPH_NODES;
    const altRoute = routeAnalysis.alternativeRoute;

    const orderedPathNames = route.path.map(nodeId => nodes[nodeId] ? nodes[nodeId].shortName : nodeId);

    let altHtml = '';
    if (altRoute && altRoute.success) {
      const altNames = altRoute.path.map(nodeId => nodes[nodeId] ? nodes[nodeId].shortName : nodeId);
      altHtml = `
        <div style="margin-top: 0.75rem; background: var(--slate-100); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.78rem;">
          <div style="font-weight: 700; color: var(--slate-800); margin-bottom: 0.2rem;">
            Computed Alternative Route:
          </div>
          <div>${altNames.join(' ➔ ')}</div>
          <div style="margin-top: 0.25rem; color: var(--slate-600); font-size: 0.72rem;">
            Distance: <strong>${altRoute.totalDistanceKm} km</strong> | Time: <strong>${altRoute.totalTimeMin} mins</strong>
          </div>
        </div>
      `;
    }

    routeBox.innerHTML = `
      <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.5rem;">
          <strong style="color: var(--navy-900); font-size: 0.88rem; display: flex; align-items: center; gap: 0.4rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            Dijkstra Route Optimization (Kathmandu Valley Graph)
          </strong>
          <span class="badge badge-allocated">${routeAnalysis.objective.replace('_', ' ').toUpperCase()}</span>
        </div>

        <div style="font-size: 0.82rem; margin-bottom: 0.5rem; color: var(--slate-800);">
          <strong>Optimal Sequence:</strong> ${orderedPathNames.join(' ➔ ')}
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.78rem; background: var(--slate-50); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--slate-200);">
          <div>
            <span style="color: var(--slate-500); font-size: 0.7rem;">Est. Travel Time:</span>
            <div style="font-weight: 700; color: var(--navy-700); font-size: 1rem;">${route.totalTimeMin} mins</div>
          </div>
          <div>
            <span style="color: var(--slate-500); font-size: 0.7rem;">Route Distance:</span>
            <div style="font-weight: 700; color: var(--slate-900); font-size: 1rem;">${route.totalDistanceKm} km</div>
          </div>
          <div>
            <span style="color: var(--slate-500); font-size: 0.7rem;">Selected Hub:</span>
            <div style="font-weight: 700; color: var(--status-success);">${routeAnalysis.selectedHubName.split(':')[0]}</div>
          </div>
        </div>

        ${altHtml}

        <div style="margin-top: 0.5rem; font-size: 0.72rem; color: var(--slate-500);">
          Road segments evaluated through Dijkstra algorithm with non-negative edge costs. Closed roads (e.g. Lazimpat fallen transformer) automatically excluded.
        </div>
      </div>
    `;
  }

  function updateAllocationStockCapacity() {
    const hubId = document.getElementById('alloc-hub-select').value;
    const req = LifelineData.getState().requests.find(r => r.id === activeAllocationRequestId);
    if (!req) return;

    const unreserved = LifelineData.getAvailableStock(hubId, req.itemId);
    const capacityNotice = document.getElementById('alloc-capacity-notice');
    const qtySlider = document.getElementById('alloc-qty-slider');
    const qtyNumber = document.getElementById('alloc-qty-number');

    const maxCanAssign = Math.min(req.quantityRequested, unreserved);
    qtySlider.max = maxCanAssign;
    qtyNumber.max = maxCanAssign;

    if (parseInt(qtySlider.value, 10) > maxCanAssign) {
      qtySlider.value = maxCanAssign;
      qtyNumber.value = maxCanAssign;
    }

    if (capacityNotice) {
      capacityNotice.textContent = `Unreserved Available at Hub: ${unreserved} units | Household Requested: ${req.quantityRequested} units.`;
    }
  }

  function validateAllocationOverrideNotice() {
    const req = LifelineData.getState().requests.find(r => r.id === activeAllocationRequestId);
    if (!req) return;

    const rec = LifelineData.evaluateAllocationRecommendation(req, activeRoutingObjective);
    const currentQty = parseInt(document.getElementById('alloc-qty-number').value, 10) || 0;
    const currentHub = document.getElementById('alloc-hub-select').value;
    const overrideBox = document.getElementById('alloc-override-reason-box');

    const hasOverridden = (currentQty !== rec.suggestedQuantity) || (currentHub !== rec.recommendedHubId);
    if (overrideBox) {
      overrideBox.style.display = hasOverridden ? 'block' : 'none';
    }
  }

  // Handle coordinator approving and reserving stock
  function handleConfirmAllocation() {
    const req = LifelineData.getState().requests.find(r => r.id === activeAllocationRequestId);
    if (!req) return;

    const hubId = document.getElementById('alloc-hub-select').value;
    const qty = parseInt(document.getElementById('alloc-qty-number').value, 10);
    const rec = LifelineData.evaluateAllocationRecommendation(req, activeRoutingObjective);
    const overrideReasonSelect = document.getElementById('alloc-override-select');
    const overrideNotes = document.getElementById('alloc-override-notes');

    const unreservedStock = LifelineData.getAvailableStock(hubId, req.itemId);

    if (qty <= 0) {
      LifelineApp.showToast('Cannot allocate 0 units. If inventory is depleted, mark request as unfulfilled.', 'warning');
      return;
    }

    if (qty > unreservedStock) {
      LifelineApp.showToast(`Allocation exceeds unreserved stock (${unreservedStock} available at ${getHubName(hubId)}). Over-allocation prohibited.`, 'danger');
      return;
    }

    const isOverridden = (qty !== rec.suggestedQuantity) || (hubId !== rec.recommendedHubId);
    let overrideAuditNote = '';
    if (isOverridden) {
      const reasonVal = overrideReasonSelect ? overrideReasonSelect.value : 'Coordinator Discretion';
      const notesVal = overrideNotes ? overrideNotes.value.trim() : '';
      if (!notesVal) {
        LifelineApp.showToast('Operational requirement: Please state an operational reason for modifying the recommended allocation.', 'warning');
        return;
      }
      overrideAuditNote = ` [Override Justification: ${reasonVal} - "${notesVal}"]`;
    }

    // Reserve stock at the hub
    const hubInv = LifelineData.getHubInventory(hubId, req.itemId);
    hubInv.reservedStock += qty;

    const isPartial = qty < req.quantityRequested;
    req.quantityAllocated = qty;
    req.allocatedHubId = hubId;
    req.status = isPartial ? 'partially_fulfilled' : 'allocated';

    const coordUser = LifelineData.getCurrentAuthUser() || { name: 'Relief Coordinator' };
    const nowIso = new Date().toISOString();
    req.history.push({
      status: req.status,
      timestamp: nowIso,
      actor: `${coordUser.name} (Coordinator)`,
      note: `Approved allocation of ${qty} units from ${getHubName(hubId)}.${overrideAuditNote}`
    });

    LifelineData.logActivity(
      'allocation',
      coordUser.name,
      `Allocated ${qty} units of ${LifelineData.ITEM_CATALOG[req.itemId].name} for ${req.id} (${req.contactName}). Reserved at ${getHubName(hubId)}.`,
      req.id
    );

    LifelineData.persist();
    LifelineApp.showToast(`Allocation confirmed: ${qty} units reserved for ${req.id} (${req.contactName}). Queued for dispatch.`, 'success');

    refreshViews();

    // If another request is pending, highlight it
    const remaining = LifelineData.getState().requests.filter(
      r => r.status === 'submitted' || r.status === 'under_review'
    );
    if (remaining.length > 0) {
      activeAllocationRequestId = remaining[0].id;
      renderAllocationWorkspace();
    }
  }

  /* ==========================================================================
     Screen 6: Delivery Tracking Fleet
     ========================================================================== */

  function bindDeliveryEvents() {
    const confirmDispatchBtn = document.getElementById('btn-confirm-dispatch-action');
    if (confirmDispatchBtn) {
      confirmDispatchBtn.addEventListener('click', handleDispatchSubmission);
    }
  }

  function renderDeliveriesTracker() {
    const tbody = document.getElementById('deliveries-datatable-tbody');
    if (!tbody) return;

    const state = LifelineData.getState();
    const deliveryQueue = state.requests.filter(
      r => r.status === 'allocated' || r.status === 'partially_fulfilled' || r.status === 'dispatched' || r.status === 'delivered'
    );

    if (deliveryQueue.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--slate-500);">
            No deliveries or allocated dispatches currently recorded in Kathmandu Valley.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = deliveryQueue.map(req => {
      const item = LifelineData.ITEM_CATALOG[req.itemId];
      const hubName = req.allocatedHubId ? getHubName(req.allocatedHubId) : 'Central Depot';
      const vehicle = state.vehicles.find(v => v.id === req.assignedVehicleId) || { name: 'Emergency Courier Unit' };

      let actionBtn = '';
      if (req.status === 'allocated' || req.status === 'partially_fulfilled') {
        actionBtn = `
          <button class="btn btn-primary btn-sm js-dispatch-order-btn" data-req-id="${req.id}">
            Assign Courier & Dispatch
          </button>
        `;
      } else if (req.status === 'dispatched') {
        actionBtn = `
          <button class="btn btn-success btn-sm js-confirm-delivery-btn" data-req-id="${req.id}">
            Confirm Handover
          </button>
        `;
      } else if (req.status === 'delivered') {
        actionBtn = `<span style="color: var(--status-success); font-weight: 600; font-size: 0.75rem;">✓ Handover Complete</span>`;
      }

      return `
        <tr>
          <td class="table-req-id">${req.id}</td>
          <td>
            <div class="table-household-name">${req.contactName}</div>
            <div class="table-household-comm">${req.municipality} (Ward ${req.ward}) — ${req.address}</div>
          </td>
          <td>${req.quantityAllocated || req.quantityRequested} ${item.unit}</td>
          <td>${hubName.split(':')[0]}</td>
          <td>
            <span class="badge badge-${req.status}">${formatStatusLabel(req.status)}</span>
          </td>
          <td>
            <span style="font-size: 0.78rem; color: var(--slate-700);">${req.assignedVehicleId ? vehicle.name : 'Unassigned'}</span>
          </td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.js-dispatch-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openDispatchModalFor(btn.dataset.reqId);
      });
    });

    tbody.querySelectorAll('.js-confirm-delivery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openConfirmDeliveryModalFor(btn.dataset.reqId);
      });
    });
  }

  function openDispatchModalFor(requestId) {
    const req = LifelineData.getState().requests.find(r => r.id === requestId);
    if (!req) return;

    document.getElementById('dispatch-modal-req-id').textContent = req.id;
    document.getElementById('dispatch-modal-dest').textContent = `${req.contactName} — ${req.municipality} (Ward ${req.ward}), ${req.address}`;

    const vehicleSelect = document.getElementById('dispatch-vehicle-select');
    const state = LifelineData.getState();
    vehicleSelect.innerHTML = state.vehicles.map(v => {
      return `<option value="${v.id}">${v.name} (${v.type} — ${v.status})</option>`;
    }).join('');

    openModal('dispatch-assignment-modal');
  }

  function handleDispatchSubmission() {
    const reqId = document.getElementById('dispatch-modal-req-id').textContent;
    const vehicleId = document.getElementById('dispatch-vehicle-select').value;
    const estArrival = document.getElementById('dispatch-eta-input').value.trim() || '30 mins';

    const req = LifelineData.getState().requests.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'dispatched';
    req.assignedVehicleId = vehicleId;

    const coordUser = LifelineData.getCurrentAuthUser() || { name: 'Logistics Dispatcher' };
    const nowIso = new Date().toISOString();
    req.history.push({
      status: 'dispatched',
      timestamp: nowIso,
      actor: `${coordUser.name} (Dispatcher)`,
      note: `Loaded onto ${getVehicleName(vehicleId)}. Target arrival in ${estArrival}.`
    });

    LifelineData.logActivity(
      'dispatch',
      coordUser.name,
      `Dispatched ${req.id} via ${getVehicleName(vehicleId)} to ${req.municipality} Ward ${req.ward}.`,
      req.id
    );

    LifelineData.persist();
    closeModal('dispatch-assignment-modal');
    LifelineApp.showToast(`Order ${req.id} dispatched via ${getVehicleName(vehicleId)}.`, 'success');

    refreshViews();
  }

  function openConfirmDeliveryModalFor(requestId) {
    const req = LifelineData.getState().requests.find(r => r.id === requestId);
    if (!req) return;

    document.getElementById('confirm-deliv-req-id').textContent = req.id;
    document.getElementById('confirm-deliv-recipient').textContent = req.contactName;
    document.getElementById('confirm-deliv-item').textContent = `${req.quantityAllocated} units of ${LifelineData.ITEM_CATALOG[req.itemId].name}`;

    openModal('confirm-handover-modal');
  }

  function handleConfirmHandoverAction() {
    const reqId = document.getElementById('confirm-deliv-req-id').textContent;
    const signerName = document.getElementById('confirm-deliv-signer').value.trim() || 'Recipient Signature Verified';
    const notes = document.getElementById('confirm-deliv-notes').value.trim() || 'Supplies handed over intact with security seals.';

    const req = LifelineData.getState().requests.find(r => r.id === reqId);
    if (!req) return;

    // Deduct stock permanently from hub inventory
    const hubInv = LifelineData.getHubInventory(req.allocatedHubId, req.itemId);
    if (hubInv) {
      const qtyDeducted = req.quantityAllocated;
      hubInv.totalStock = Math.max(0, hubInv.totalStock - qtyDeducted);
      hubInv.reservedStock = Math.max(0, hubInv.reservedStock - qtyDeducted);
    }

    req.status = 'delivered';
    req.quantityDelivered = req.quantityAllocated;

    const nowIso = new Date().toISOString();
    req.history.push({
      status: 'delivered',
      timestamp: nowIso,
      actor: `${signerName} (Recipient Handover)`,
      note: `Handover confirmed: ${notes}`
    });

    LifelineData.logActivity(
      'delivery',
      signerName,
      `Confirmed delivery of ${req.quantityDelivered} units to ${req.contactName} (${req.id}).`,
      req.id
    );

    LifelineData.persist();
    closeModal('confirm-handover-modal');
    LifelineApp.showToast(`Delivery handover completed for ${req.id}. Stock permanently reconciled.`, 'success');

    refreshViews();
  }

  /* ==========================================================================
     Screen 7: Comprehensive Activity Timeline Logic
     ========================================================================== */

  function bindTimelineEvents() {
    const searchInput = document.getElementById('timeline-search-input');
    const typeSelect = document.getElementById('timeline-type-filter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        timelineFilter.search = e.target.value.toLowerCase();
        renderFullActivityTimeline();
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        timelineFilter.type = e.target.value;
        renderFullActivityTimeline();
      });
    }
  }

  function renderFullActivityTimeline() {
    const container = document.getElementById('full-activity-timeline-container');
    const badge = document.getElementById('timeline-count-badge');
    if (!container) return;

    const state = LifelineData.getState();
    let activities = state.activities || [];

    if (timelineFilter.type !== 'ALL') {
      activities = activities.filter(a => a.type === timelineFilter.type);
    }

    if (timelineFilter.search) {
      const q = timelineFilter.search;
      activities = activities.filter(a => 
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.actor && a.actor.toLowerCase().includes(q)) ||
        (a.requestId && a.requestId.toLowerCase().includes(q))
      );
    }

    if (badge) {
      badge.textContent = `${activities.length} Events Logged`;
    }

    if (activities.length === 0) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--slate-500);">
          No events match the current timeline filter.
        </div>
      `;
      return;
    }

    container.innerHTML = activities.map(act => {
      let typeLabel = act.type.toUpperCase();
      let badgeClass = 'badge-submitted';
      if (act.type === 'intake') badgeClass = 'badge-under_review';
      else if (act.type === 'allocation') badgeClass = 'badge-allocated';
      else if (act.type === 'dispatch') badgeClass = 'badge-dispatched';
      else if (act.type === 'delivery') badgeClass = 'badge-delivered';
      else if (act.type === 'stock') badgeClass = 'badge-standard';
      else if (act.type === 'alert') badgeClass = 'badge-critical';

      return `
        <div class="timeline-event-item">
          <div class="timeline-dot"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="badge ${badgeClass}">${typeLabel}</span>
              ${act.requestId ? `<span class="timeline-req-tag">${act.requestId}</span>` : ''}
              <strong style="color: var(--slate-900); font-size: 0.82rem;">${act.actor}</strong>
            </div>
            <span style="font-size: 0.72rem; color: var(--slate-500);">${formatFullDemoTime(act.timestamp)}</span>
          </div>
          <div style="font-size: 0.82rem; color: var(--slate-700); line-height: 1.45;">
            ${act.description}
          </div>
        </div>
      `;
    }).join('');
  }

  function formatFullDemoTime(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  }

  /* Section 6 & 12 APM Showcase Scenario Shortcut Bindings */
  function bindScenarioShowcaseEvents() {
    const jumpBtn = document.getElementById('btn-jump-scenario-alloc');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        openAllocationWorkspaceFor('REQ-NEPAL-01');
      });
    }

    const selectNorthBtn = document.getElementById('btn-select-scenario-north');
    if (selectNorthBtn) {
      selectNorthBtn.addEventListener('click', () => {
        openAllocationWorkspaceFor('REQ-NEPAL-01');
      });
    }

    const selectSouthBtn = document.getElementById('btn-select-scenario-south');
    if (selectSouthBtn) {
      selectSouthBtn.addEventListener('click', () => {
        openAllocationWorkspaceFor('REQ-NEPAL-02');
      });
    }
  }

  /* Request Details Inspection Modal */
  function bindModalEvents() {
    document.querySelectorAll('.modal-close-btn, .js-cancel-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
      });
    });

    const confirmHandoverBtn = document.getElementById('btn-confirm-handover-action');
    if (confirmHandoverBtn) {
      confirmHandoverBtn.addEventListener('click', handleConfirmHandoverAction);
    }
  }

  function openRequestDetailModal(requestId) {
    currentSelectedRequestId = requestId;
    const req = LifelineData.getState().requests.find(r => r.id === requestId);
    if (!req) return;

    const item = LifelineData.ITEM_CATALOG[req.itemId];
    const rec = LifelineData.evaluateAllocationRecommendation(req, activeRoutingObjective);

    document.getElementById('modal-detail-id').textContent = req.id;
    document.getElementById('modal-detail-contact').textContent = `${req.contactName} (${req.phone})`;
    document.getElementById('modal-detail-ref').textContent = req.householdRef;
    document.getElementById('modal-detail-address').textContent = `${req.address}, ${req.municipality} (Ward ${req.ward})`;
    document.getElementById('modal-detail-item').textContent = `${req.quantityRequested} × ${item.name} (${item.unit})`;
    document.getElementById('modal-detail-urgency').innerHTML = `<span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span>`;
    document.getElementById('modal-detail-status').innerHTML = `<span class="badge badge-${req.status}">${formatStatusLabel(req.status)}</span>`;
    document.getElementById('modal-detail-notes').textContent = req.notes;

    const recBox = document.getElementById('modal-detail-rec-box');
    if (recBox) {
      recBox.className = `recommendation-box ${rec.isPartial ? 'partial' : rec.shortageDetected ? 'shortage' : 'full'}`;
      recBox.innerHTML = `
        <div class="recommendation-title">
          <span>Priority Score: <strong>${rec.priorityScore}/100</strong> | Feasible Hub: <strong>${rec.recommendedHubName.split(':')[0]}</strong></span>
        </div>
        <div class="recommendation-text">${rec.explanation}</div>
      `;
    }

    const timelineContainer = document.getElementById('modal-detail-timeline');
    if (timelineContainer) {
      timelineContainer.innerHTML = req.history.map(entry => {
        return `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-meta">
              <strong>${entry.actor}</strong> • ${formatActivityTime(entry.timestamp)}
            </div>
            <div class="timeline-content">${entry.note}</div>
          </div>
        `;
      }).join('');
    }

    const actionsFooter = document.getElementById('modal-detail-actions');
    if (actionsFooter) {
      let buttons = `<button class="btn btn-secondary js-cancel-modal-btn">Close</button>`;

      if (req.status === 'submitted') {
        buttons = `
          <button class="btn btn-secondary" onclick="CoordinatorModule.transitionRequestStatus('${req.id}', 'under_review')">
            Mark Under Review
          </button>
          <button class="btn btn-primary" onclick="CoordinatorModule.jumpToAllocation('${req.id}')">
            Proceed to Allocation Centre
          </button>
        `;
      } else if (req.status === 'under_review') {
        buttons = `
          <button class="btn btn-danger btn-sm" onclick="CoordinatorModule.transitionRequestStatus('${req.id}', 'unfulfilled')">
            Mark Unfulfilled
          </button>
          <button class="btn btn-primary" onclick="CoordinatorModule.jumpToAllocation('${req.id}')">
            Allocate Supplies & Route
          </button>
        `;
      } else if (req.status === 'allocated' || req.status === 'partially_fulfilled') {
        buttons = `
          <button class="btn btn-secondary" onclick="CoordinatorModule.cancelAllocation('${req.id}')">
            Cancel & Return Stock
          </button>
          <button class="btn btn-primary" onclick="CoordinatorModule.triggerDispatchFromModal('${req.id}')">
            Assign Courier & Dispatch
          </button>
        `;
      } else if (req.status === 'dispatched') {
        buttons = `
          <button class="btn btn-success" onclick="CoordinatorModule.triggerConfirmDeliveryFromModal('${req.id}')">
            Confirm Handover & Delivery
          </button>
        `;
      }

      actionsFooter.innerHTML = buttons;
    }

    openModal('request-details-modal');
  }

  function transitionRequestStatus(requestId, nextStatus) {
    const req = LifelineData.getState().requests.find(r => r.id === requestId);
    if (!req) return;

    req.status = nextStatus;
    const coordUser = LifelineData.getCurrentAuthUser() || { name: 'Relief Coordinator' };
    const nowIso = new Date().toISOString();
    req.history.push({
      status: nextStatus,
      timestamp: nowIso,
      actor: `${coordUser.name} (Coordinator)`,
      note: `Status updated to ${nextStatus.replace(/_/g, ' ')}.`
    });

    LifelineData.logActivity('alert', coordUser.name, `Request ${req.id} marked ${nextStatus.replace(/_/g, ' ')}.`, req.id);
    LifelineData.persist();
    closeAllModals();
    LifelineApp.showToast(`Request ${req.id} updated to ${nextStatus.replace(/_/g, ' ')}.`, 'info');
    refreshViews();
  }

  function cancelAllocation(requestId) {
    const req = LifelineData.getState().requests.find(r => r.id === requestId);
    if (!req) return;

    if (req.allocatedHubId && req.quantityAllocated > 0) {
      const inv = LifelineData.getHubInventory(req.allocatedHubId, req.itemId);
      if (inv) {
        inv.reservedStock = Math.max(0, inv.reservedStock - req.quantityAllocated);
      }
    }

    req.status = 'under_review';
    req.quantityAllocated = 0;
    req.allocatedHubId = null;

    const coordUser = LifelineData.getCurrentAuthUser() || { name: 'Relief Coordinator' };
    const nowIso = new Date().toISOString();
    req.history.push({
      status: 'under_review',
      timestamp: nowIso,
      actor: `${coordUser.name} (Coordinator)`,
      note: 'Allocation rescinded. Reserved inventory returned to active hub pool.'
    });

    LifelineData.logActivity('alert', coordUser.name, `Allocation for ${req.id} cancelled; inventory restored.`, req.id);
    LifelineData.persist();
    closeAllModals();
    LifelineApp.showToast(`Allocation cancelled. Stock returned to available warehouse pool.`, 'info');
    refreshViews();
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  function getHubName(hubId) {
    const hub = LifelineData.getState().hubs.find(h => h.id === hubId);
    return hub ? hub.name : hubId;
  }

  function getVehicleName(vehId) {
    const veh = LifelineData.getState().vehicles.find(v => v.id === vehId);
    return veh ? veh.name : vehId;
  }

  function formatStatusLabel(status) {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ');
  }

  function formatActivityTime(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '10:00 AM';
    }
  }

  function bindOverviewEvents() {}

  return {
    init,
    refreshViews,
    openAllocationWorkspaceFor,
    openRequestDetailModal,
    transitionRequestStatus,
    cancelAllocation,
    jumpToAllocation: function (requestId) {
      closeAllModals();
      openAllocationWorkspaceFor(requestId);
    },
    triggerDispatchFromModal: function (requestId) {
      closeAllModals();
      openDispatchModalFor(requestId);
    },
    triggerConfirmDeliveryFromModal: function (requestId) {
      closeAllModals();
      openConfirmDeliveryModalFor(requestId);
    }
  };
})();
