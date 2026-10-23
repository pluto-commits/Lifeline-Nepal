/**
 * Lifeline — Emergency Essential Supplies Coordination Platform
 * Application Core Controller & State Router (Nepal Kathmandu Valley Setting)
 * Handles navigation, role-based views, logout, toast notifications,
 * and state updates.
 */

const LifelineApp = (function () {
  'use strict';

  let currentMode = 'coordinator'; // 'coordinator' | 'household'
  let currentView = 'overview';    // 'overview' | 'requests' | 'inventory' | 'allocation' | 'deliveries' | 'timeline' | 'household-portal'

  // View metadata for top operational header
  const VIEW_METADATA = {
    'overview': {
      title: 'Kathmandu Valley Operations Command Overview',
      desc: 'Real-time post-snap crisis situational awareness & regional resource monitoring'
    },
    'requests': {
      title: 'Household Emergency Requests Registry',
      desc: 'Centralized registry of intake demands across KMC, Lalitpur, and Bhaktapur'
    },
    'inventory': {
      title: 'Regional Inventory & Resources',
      desc: 'Multi-hub stock levels, reserve tracking, and inbound convoy receipts'
    },
    'allocation': {
      title: 'Explainable Allocation Centre & Route Optimizer',
      desc: 'Deterministic heuristic decision workspace with Dijkstra shortest-path route planning'
    },
    'deliveries': {
      title: 'Logistics Fleet & Delivery Handover',
      desc: 'Tracking transit couriers, field vehicle dispatches, and end-to-end receipt confirmations'
    },
    'timeline': {
      title: 'Operations Activity Timeline',
      desc: 'Comprehensive audit trail of intake, allocations, dispatches, and handovers'
    },
    'household-portal': {
      title: 'Civilian Emergency Assistance Portal',
      desc: 'Direct intake terminal for affected households to request critical survival rations'
    }
  };

  function init() {
    // Separate Authentication Gateway: Check if a user is currently logged in
    const user = LifelineData.getCurrentAuthUser();
    if (!user || !user.role) {
      window.location.href = 'login.html';
      return;
    }

    bindGlobalNavigation();
    bindLogoutEvents();
    bindMobileSidebar();

    // Initialize sub-modules
    if (typeof HouseholdModule !== 'undefined') {
      HouseholdModule.init();
    }
    if (typeof CoordinatorModule !== 'undefined') {
      CoordinatorModule.init();
    }

    // Set active mode and default view according to authenticated role
    currentMode = user.role;
    currentView = user.role === 'household' ? 'household-portal' : 'overview';
    applyRoleViewPermissions(user.role);
    navigateTo(currentView);
  }

  // Bind Sidebar Navigation Links
  function bindGlobalNavigation() {
    const navLinks = document.querySelectorAll('.js-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetView = this.dataset.view;
        if (targetView) {
          navigateTo(targetView);
          closeMobileSidebar();
        }
      });
    });
  }

  // Navigate between application sections
  function navigateTo(viewId) {
    if (!VIEW_METADATA[viewId]) return;
    currentView = viewId;

    // Update active class on nav links
    document.querySelectorAll('.js-nav-link').forEach(link => {
      if (link.dataset.view === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle active view container
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${viewId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Top Operational Header
    const titleEl = document.getElementById('header-section-title');
    const descEl = document.getElementById('header-section-desc');
    if (titleEl) titleEl.textContent = VIEW_METADATA[viewId].title;
    if (descEl) descEl.textContent = VIEW_METADATA[viewId].desc;

    // Refresh sub-views
    if (viewId === 'overview' && typeof CoordinatorModule !== 'undefined') {
      CoordinatorModule.refreshViews();
    } else if (viewId === 'household-portal' && typeof HouseholdModule !== 'undefined') {
      HouseholdModule.refreshViews();
    }
  }

  // Bind all Logout / Sign Out buttons across header, sidebar, and household hero
  function bindLogoutEvents() {
    document.querySelectorAll('.js-logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    });
  }

  // Sign out current authenticated user and return to standalone login page
  function logoutUser() {
    LifelineData.clearAuthUser();
    window.location.href = 'login.html';
  }

  // Apply Role-Based View Permissions (Household vs Coordinator)
  function applyRoleViewPermissions(role) {
    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('app-sidebar');
    const header = document.getElementById('app-header');
    const coordNav = document.getElementById('sidebar-coordinator-nav');
    const hhNav = document.getElementById('sidebar-household-nav');
    const modeBadge = document.getElementById('header-mode-badge');
    const logoutBtn = document.getElementById('header-logout-btn');

    if (appContainer) appContainer.style.display = 'flex';
    if (sidebar) sidebar.style.display = 'flex';
    if (header) header.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';

    // Update Header User Profile Badge
    const user = LifelineData.getCurrentAuthUser();
    const userNameEl = document.getElementById('header-user-name');
    const userRoleEl = document.getElementById('header-user-role');
    const userAvatarEl = document.getElementById('header-user-avatar');

    if (user) {
      if (userNameEl) userNameEl.textContent = user.name || 'Active User';
      if (userRoleEl) {
        userRoleEl.textContent = user.role === 'household'
          ? `${user.municipality || 'Civilian'} (W-${user.ward || 1})`
          : (user.title || 'Relief Coordinator');
      }
      if (userAvatarEl) {
        userAvatarEl.textContent = user.avatar || (user.name ? user.name.substring(0, 2).toUpperCase() : 'US');
        userAvatarEl.className = 'avatar-circle' + (user.role === 'coordinator' ? ' coord' : '');
      }
    }

    if (role === 'household') {
      if (coordNav) coordNav.style.display = 'none';
      if (hhNav) hhNav.style.display = 'block';

      if (modeBadge) {
        modeBadge.className = 'mode-badge-indicator household';
        modeBadge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          Household Portal
        `;
      }
    } else {
      if (coordNav) coordNav.style.display = 'block';
      if (hhNav) hhNav.style.display = 'none';

      if (modeBadge) {
        modeBadge.className = 'mode-badge-indicator coordinator';
        modeBadge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Relief Coordinator Mode
        `;
      }
    }
  }

  // In-App Confirmation Modal Manager (Replaces native alert/confirm)
  function showConfirmModal(title, message, onConfirm, confirmBtnText = 'Confirm', isDanger = true) {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) {
      if (onConfirm) onConfirm();
      return;
    }

    const titleEl = document.getElementById('confirmation-modal-title');
    const msgEl = document.getElementById('confirmation-modal-message');
    const confirmBtn = document.getElementById('confirmation-modal-confirm-btn');
    const cancelBtn = document.getElementById('confirmation-modal-cancel-btn');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    if (confirmBtn) {
      confirmBtn.textContent = confirmBtnText;
      confirmBtn.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';

      // Clear previous event listeners
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.addEventListener('click', () => {
        closeConfirmModal();
        if (onConfirm) onConfirm();
      });
    }

    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.addEventListener('click', closeConfirmModal);
    }

    modal.classList.add('active');
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) modal.classList.remove('active');
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    if (type === 'success') {
      toast.style.borderLeft = '4px solid var(--status-delivered)';
      icon = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === 'warning') {
      toast.style.borderLeft = '4px solid var(--status-high)';
      icon = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        </svg>
      `;
    } else if (type === 'danger') {
      toast.style.borderLeft = '4px solid var(--status-critical)';
      icon = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // Mobile sidebar drawer
  function bindMobileSidebar() {
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
  }

  // Auto-boot on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    navigateTo,
    logoutUser,
    showToast,
    showConfirmModal,
    getCurrentMode: () => currentMode,
    getCurrentView: () => currentView
  };
})();
