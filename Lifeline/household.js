/**
 * Lifeline — Emergency Essential Supplies Coordination Platform
 * Household Portal Module (Nepal Setting)
 * Handles citizen emergency intake, instant validation, privacy protection,
 * and single-household request tracking in Kathmandu Valley.
 */

const HouseholdModule = (function () {
  'use strict';

  let selectedItemId = 'food';
  let selectedUrgency = 'high';
  let isSubmitting = false;

  // Initialize Household module events & UI
  function init() {
    bindFormEvents();
    renderMunicipalityOptions();
    renderNearbyAssistancePoints();
    renderHouseholdRequestHistory();
    updateLoggedInHouseholdBadge();
  }

  // Update banner showing currently authenticated household
  function updateLoggedInHouseholdBadge() {
    const user = LifelineData.getCurrentAuthUser();
    const nameEl = document.getElementById('hh-auth-user-name');
    const locEl = document.getElementById('hh-auth-user-loc');
    const nameInput = document.getElementById('hh-name-input');
    const phoneInput = document.getElementById('hh-phone-input');
    const addressInput = document.getElementById('hh-address-input');

    if (user && user.role === 'household') {
      if (nameEl) nameEl.textContent = user.name;
      if (locEl) locEl.textContent = `${user.municipality} (Ward ${user.ward}) — ${user.locality}`;
      if (nameInput) nameInput.value = user.name;
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '9841-XXXXXX';
      if (addressInput && !addressInput.value) addressInput.value = user.locality;

      // Pre-select municipality
      const muniSelect = document.getElementById('hh-municipality-select');
      if (muniSelect && user.municipality) {
        muniSelect.value = user.municipality;
        populateWardsForMunicipality(user.municipality, user.ward);
      }
    }
  }

  // Render municipality dropdown for Kathmandu Valley
  function renderMunicipalityOptions() {
    const select = document.getElementById('hh-municipality-select');
    if (!select) return;

    const municipalities = [
      'Kathmandu Metropolitan City',
      'Lalitpur Metropolitan City',
      'Bhaktapur Municipality'
    ];

    select.innerHTML = '<option value="">-- Select Municipality in Kathmandu Valley --</option>' +
      municipalities.map(m => `<option value="${m}">${m}</option>`).join('');

    select.addEventListener('change', function () {
      populateWardsForMunicipality(this.value);
    });
  }

  function populateWardsForMunicipality(municipality, selectedWard = null) {
    const wardSelect = document.getElementById('hh-ward-select');
    if (!wardSelect) return;

    let maxWards = 32;
    if (municipality === 'Lalitpur Metropolitan City') maxWards = 29;
    if (municipality === 'Bhaktapur Municipality') maxWards = 10;

    let options = '<option value="">-- Select Ward No. --</option>';
    for (let w = 1; w <= maxWards; w++) {
      const isSel = selectedWard && parseInt(selectedWard, 10) === w ? 'selected' : '';
      options += `<option value="${w}" ${isSel}>Ward No. ${w}</option>`;
    }
    wardSelect.innerHTML = options;
  }

  // Bind all interactive form controls
  function bindFormEvents() {
    // Item selector cards
    const itemCards = document.querySelectorAll('.js-item-choice');
    itemCards.forEach(card => {
      card.addEventListener('click', function () {
        itemCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedItemId = this.dataset.itemId;
        updateItemUnitNotice(selectedItemId);
      });
    });

    // Urgency radio cards
    const urgencyCards = document.querySelectorAll('.js-urgency-choice');
    urgencyCards.forEach(card => {
      card.addEventListener('click', function () {
        urgencyCards.forEach(c => {
          c.classList.remove('selected-critical', 'selected-high', 'selected-standard');
        });
        const urgency = this.dataset.urgency;
        selectedUrgency = urgency;
        this.classList.add(`selected-${urgency}`);
      });
    });

    // Quantity stepper buttons
    const qtyInput = document.getElementById('hh-quantity-input');
    const btnMinus = document.getElementById('hh-qty-minus');
    const btnPlus = document.getElementById('hh-qty-plus');

    if (btnMinus && qtyInput) {
      btnMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
    }

    if (btnPlus && qtyInput) {
      btnPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < 50) qtyInput.value = val + 1;
      });
    }

    // Submit request button
    const submitBtn = document.getElementById('hh-submit-request-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', handleRequestSubmission);
    }

    // Submit another request button from receipt card
    const anotherBtn = document.getElementById('hh-submit-another-btn');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', resetFormToFresh);
    }
  }

  function updateItemUnitNotice(itemId) {
    const catalog = LifelineData.ITEM_CATALOG;
    const item = catalog[itemId];
    const unitNotice = document.getElementById('hh-item-unit-notice');
    if (unitNotice && item) {
      unitNotice.textContent = `Standard rationing unit: ${item.unit}. ${item.description}`;
    }
  }

  // Handle Form Submission with thorough validation and duplicate prevention
  function handleRequestSubmission(e) {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks

    clearValidationErrors();

    const contactName = document.getElementById('hh-name-input').value.trim();
    const phone = document.getElementById('hh-phone-input').value.trim();
    const municipality = document.getElementById('hh-municipality-select').value;
    const ward = document.getElementById('hh-ward-select').value;
    const address = document.getElementById('hh-address-input').value.trim();
    const qtyInput = document.getElementById('hh-quantity-input');
    const quantity = parseInt(qtyInput.value, 10);
    const notes = document.getElementById('hh-notes-input').value.trim();

    let hasError = false;

    if (!contactName) {
      showError('hh-name-group', 'Please provide your household or contact person name.');
      hasError = true;
    }

    if (!municipality) {
      showError('hh-municipality-group', 'Please select your municipality in the Kathmandu Valley.');
      hasError = true;
    }

    if (!ward) {
      showError('hh-ward-group', 'Please specify your administrative Ward number.');
      hasError = true;
    }

    if (!address) {
      showError('hh-address-group', 'Street address or landmark description is required for dispatch.');
      hasError = true;
    }

    if (isNaN(quantity) || quantity <= 0) {
      showError('hh-qty-group', 'Quantity must be a positive whole number (minimum 1 unit).');
      hasError = true;
    } else if (quantity > 50) {
      showError('hh-qty-group', 'Emergency rations are capped at 50 units per single household intake.');
      hasError = true;
    }

    if (hasError) {
      LifelineApp.showToast('Please fix the highlighted errors before submitting.', 'warning');
      return;
    }

    // Lock submission state
    isSubmitting = true;
    const submitBtn = document.getElementById('hh-submit-request-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Verifying & Logging Request...
    `;

    setTimeout(() => {
      const state = LifelineData.getState();
      const user = LifelineData.getCurrentAuthUser() || { id: 'HH-ANON-' + Date.now().toString(36) };
      const nextNum = 101 + state.requests.length;
      const newRequestId = `REQ-NEPAL-0${nextNum}`;
      const nowIso = new Date().toISOString();

      const newRequest = {
        id: newRequestId,
        householdId: user.id,
        householdRef: `${user.id} (${contactName})`,
        contactName: contactName,
        phone: phone || 'Civil Uplink Direct',
        municipality: municipality,
        ward: parseInt(ward, 10),
        community: `${municipality} (Ward ${ward})`,
        address: address,
        itemId: selectedItemId,
        quantityRequested: quantity,
        quantityAllocated: 0,
        quantityDelivered: 0,
        urgency: selectedUrgency,
        notes: notes || 'No additional special constraints reported.',
        status: 'submitted', // Honest initial status
        allocatedHubId: null,
        assignedVehicleId: null,
        createdAt: nowIso,
        waitingHours: 0,
        history: [
          {
            status: 'submitted',
            timestamp: nowIso,
            actor: `${contactName} (Household Citizen)`,
            note: 'Lodged via Kathmandu Valley Civilian Emergency Portal.'
          }
        ]
      };

      // Add to shared data state
      state.requests.unshift(newRequest);
      LifelineData.logActivity(
        'intake',
        contactName,
        `New emergency request ${newRequestId}: ${quantity} units of ${LifelineData.ITEM_CATALOG[selectedItemId].name} in ${municipality} Ward ${ward}.`,
        newRequestId
      );
      LifelineData.persist();

      // Show receipt view
      displaySubmissionReceipt(newRequest);

      // Unlock button
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      // Update household tracking list
      renderHouseholdRequestHistory();
      
      // Notify user
      LifelineApp.showToast(`Request ${newRequestId} registered successfully in sector queue.`, 'success');

      // Refresh coordinator views dynamically so data is synchronized
      if (typeof CoordinatorModule !== 'undefined') {
        CoordinatorModule.refreshViews();
      }
    }, 450);
  }

  function showError(groupId, message) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = message;
  }

  function clearValidationErrors() {
    const errorGroups = document.querySelectorAll('.has-error');
    errorGroups.forEach(g => g.classList.remove('has-error'));
  }

  // Display receipt state after submission
  function displaySubmissionReceipt(request) {
    const formCard = document.getElementById('hh-request-form-card');
    const receiptCard = document.getElementById('hh-receipt-card');
    
    if (formCard) formCard.style.display = 'none';
    if (receiptCard) {
      receiptCard.style.display = 'block';

      document.getElementById('receipt-req-id').textContent = request.id;
      document.getElementById('receipt-contact-name').textContent = request.contactName;
      document.getElementById('receipt-item-details').textContent = `${request.quantityRequested} × ${LifelineData.ITEM_CATALOG[request.itemId].name}`;
      document.getElementById('receipt-community').textContent = `${request.municipality} (Ward ${request.ward})`;
      document.getElementById('receipt-status-badge').innerHTML = `<span class="badge badge-submitted">Submitted — Under Review Queue</span>`;
      document.getElementById('receipt-urgency-badge').innerHTML = `<span class="badge badge-${request.urgency}">${request.urgency.toUpperCase()} PRIORITY</span>`;
      
      receiptCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFormToFresh() {
    const formCard = document.getElementById('hh-request-form-card');
    const receiptCard = document.getElementById('hh-receipt-card');
    
    if (formCard) formCard.style.display = 'block';
    if (receiptCard) receiptCard.style.display = 'none';

    document.getElementById('hh-quantity-input').value = '2';
    document.getElementById('hh-notes-input').value = '';
    clearValidationErrors();
  }

  // Render household history with multi-step tracking progress bar
  // PRIVACY RULE: Household users MUST NOT see other households' personal details or requests!
  function renderHouseholdRequestHistory() {
    const container = document.getElementById('hh-history-list');
    if (!container) return;

    const user = LifelineData.getCurrentAuthUser();
    if (!user || user.role !== 'household') {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--slate-500);">
          Please log in as a household citizen to view personal emergency requests.
        </div>
      `;
      return;
    }

    // Only get requests belonging to this household!
    const myRequests = LifelineData.getRequestsForHousehold(user.id);

    if (myRequests.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--slate-200); color: var(--slate-500);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; color: var(--slate-400);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <p style="font-weight: 600; color: var(--slate-800);">No active requests on record for ${user.name}.</p>
          <small>Use the form above to submit your first emergency intake for food, water, or medicine.</small>
        </div>
      `;
      return;
    }

    container.innerHTML = myRequests.map(req => {
      const item = LifelineData.ITEM_CATALOG[req.itemId] || { name: req.itemId, unit: 'units' };
      const unmetQuantity = Math.max(0, req.quantityRequested - req.quantityAllocated);
      
      const stepIndexMap = {
        'submitted': 1,
        'under_review': 2,
        'allocated': 3,
        'dispatched': 4,
        'delivered': 5,
        'partially_fulfilled': 3,
        'unfulfilled': 2
      };
      const currentStep = stepIndexMap[req.status] || 1;

      // Status explanation message for citizens
      let statusExplanation = 'Your request has been registered in the Kathmandu Valley post-snap emergency queue and is awaiting coordinator triage.';
      if (req.status === 'under_review') {
        statusExplanation = 'A relief coordinator is currently assessing available warehouse stock and open road transit routes across the Valley.';
      } else if (req.status === 'allocated') {
        statusExplanation = `Supplies have been approved and reserved at ${req.allocatedHubId ? getHubName(req.allocatedHubId) : 'Central Depot'}. Waiting for transport team assignment.`;
      } else if (req.status === 'dispatched') {
        statusExplanation = `Supplies are en route via ${req.assignedVehicleId || 'Sector Courier Team'}. Please remain at your designated shelter address.`;
      } else if (req.status === 'delivered') {
        statusExplanation = `Supplies have been confirmed delivered. Handover complete for ${req.quantityDelivered} ${item.unit}.`;
      } else if (req.status === 'partially_fulfilled') {
        statusExplanation = `Partial Allocation Delivered: ${req.quantityAllocated} of ${req.quantityRequested} ${item.unit} approved. The remaining unmet demand (${unmetQuantity} units) is actively backordered for the next convoy due to depot stock limits.`;
      } else if (req.status === 'unfulfilled') {
        statusExplanation = 'Currently unfulfilled due to critical depot stockout across Kathmandu Valley. Request retained in emergency backorder priority.';
      }

      return `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${req.urgency === 'critical' ? 'var(--status-critical)' : req.urgency === 'high' ? 'var(--status-high)' : 'var(--navy-600)'};">
          <div class="card-header">
            <div>
              <span class="table-req-id" style="font-size: 0.95rem;">${req.id}</span>
              <span style="margin-left: 0.5rem; font-size: 0.82rem; color: var(--slate-600);">${req.contactName} (${req.community})</span>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="badge badge-${req.urgency}">${req.urgency.toUpperCase()}</span>
              <span class="badge badge-${req.status}">${formatStatusLabel(req.status)}</span>
            </div>
          </div>
          <div class="card-body">
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <strong style="color: var(--slate-900); font-size: 1rem;">${req.quantityRequested} × ${item.name}</strong>
                <p style="font-size: 0.76rem; color: var(--slate-500); margin-top: 0.2rem;">Delivery Locality: ${req.address}</p>
              </div>
              <div style="text-align: right; font-size: 0.78rem;">
                <div style="color: var(--slate-700);">
                  Allocated: <strong>${req.quantityAllocated}</strong> / Requested: <strong>${req.quantityRequested}</strong>
                </div>
                ${unmetQuantity > 0 ? `<div style="color: var(--status-critical); font-weight: 700; font-size: 0.74rem;">Unmet Demand: ${unmetQuantity} ${item.unit}</div>` : ''}
              </div>
            </div>

            <!-- 5-Step Visual Stepper -->
            <div class="tracking-stepper">
              <div class="tracking-step ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'current') : ''}">
                <div class="step-node">${currentStep > 1 ? '✓' : '1'}</div>
                <div class="step-text">Submitted</div>
              </div>
              <div class="tracking-step ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : ''}">
                <div class="step-node">${currentStep > 2 ? '✓' : '2'}</div>
                <div class="step-text">Under Review</div>
              </div>
              <div class="tracking-step ${currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'current') : ''}">
                <div class="step-node">${currentStep > 3 ? '✓' : '3'}</div>
                <div class="step-text">${req.status === 'partially_fulfilled' ? 'Partially Filled' : 'Allocated'}</div>
              </div>
              <div class="tracking-step ${currentStep >= 4 ? (currentStep > 4 ? 'completed' : 'current') : ''}">
                <div class="step-node">${currentStep > 4 ? '✓' : '4'}</div>
                <div class="step-text">Dispatched</div>
              </div>
              <div class="tracking-step ${currentStep >= 5 ? 'completed' : ''}">
                <div class="step-node">${currentStep >= 5 ? '✓' : '5'}</div>
                <div class="step-text">Delivered</div>
              </div>
            </div>

            <div style="background-color: var(--slate-50); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8rem; color: var(--slate-800); border: 1px solid var(--slate-200); margin-top: 0.75rem;">
              <strong>Current Status Explanation:</strong> ${statusExplanation}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render open civilian distribution hubs in Kathmandu Valley
  function renderNearbyAssistancePoints() {
    const container = document.getElementById('hh-assistance-points');
    if (!container) return;

    const state = LifelineData.getState();
    container.innerHTML = state.hubs.map(hub => {
      return `
        <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--slate-900);">${hub.name}</h4>
              <p style="font-size: 0.78rem; color: var(--slate-600); margin-top: 0.15rem;">${hub.location} (${hub.municipality}, Ward ${hub.ward})</p>
              <p style="font-size: 0.72rem; color: var(--slate-500); margin-top: 0.25rem;">Supervising Officer: ${hub.officer}</p>
            </div>
            <span class="badge ${hub.status.includes('Fully') ? 'badge-delivered' : 'badge-allocated'}">
              ${hub.status}
            </span>
          </div>
          <div style="margin-top: 0.5rem; font-size: 0.75rem; background-color: var(--slate-50); padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); color: var(--slate-700);">
            <strong>Road Access:</strong> ${hub.accessRoads}
          </div>
        </div>
      `;
    }).join('');
  }

  function getHubName(hubId) {
    const hub = LifelineData.getState().hubs.find(h => h.id === hubId);
    return hub ? hub.name : hubId;
  }

  function formatStatusLabel(status) {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ');
  }

  return {
    init,
    refreshViews: function () {
      updateLoggedInHouseholdBadge();
      renderHouseholdRequestHistory();
      renderNearbyAssistancePoints();
    }
  };
})();
