/**
 * @fileoverview Real-time alerts system — renders, prepends, and manages
 *               the operational alert feed for stadium staff and organizers.
 * @module alerts
 * @author Asif | AntiGravity
 * @version 2.0.0
 */

'use strict';

/* ====================================================================
   MODULE STATE
==================================================================== */

/** @type {number} Index cycling through ALERT_TEMPLATES */
let _alertIndex = 0;

/* ====================================================================
   ALERT RENDERING
==================================================================== */

/**
 * Build a single alert article element using safe DOM APIs (no innerHTML).
 *
 * @param {AlertTemplate} template - Alert data object from ALERT_TEMPLATES
 * @param {string}        timeAgo  - Human-readable time string e.g. "Just now"
 * @returns {HTMLElement}           Fully constructed <article> element
 */
function buildAlertElement(template, timeAgo = 'Just now') {
  const article = document.createElement('article');
  article.className = 'alert-item';
  article.setAttribute('aria-labelledby', `alert-dyn-${Date.now()}-title`);

  // Icon container
  const iconWrap = document.createElement('div');
  iconWrap.className = `alert-icon ${template.type}`;
  iconWrap.setAttribute('aria-hidden', 'true');
  iconWrap.textContent = template.icon;

  // Text content
  const content = document.createElement('div');
  content.style.flex = '1';

  const titleEl = document.createElement('div');
  titleEl.className   = 'alert-title';
  titleEl.textContent = template.title;

  const descEl = document.createElement('div');
  descEl.className   = 'alert-desc';
  descEl.textContent = template.desc;

  const timeEl = document.createElement('div');
  timeEl.className   = 'alert-time';
  timeEl.textContent = `⏱ ${timeAgo}`;

  content.appendChild(titleEl);
  content.appendChild(descEl);
  content.appendChild(timeEl);

  // Badge
  const badge = document.createElement('span');
  badge.className   = `badge ${template.badgeClass}`;
  badge.textContent = template.badge;
  badge.style.cssText = 'margin-left:auto;flex-shrink:0';
  badge.setAttribute('aria-label', `Severity: ${template.badge}`);

  article.appendChild(iconWrap);
  article.appendChild(content);
  article.appendChild(badge);

  return article;
}

/* ====================================================================
   ADD DEMO ALERT (simulated AI alert)
==================================================================== */

/**
 * Prepend a new simulated AI alert to the top of the alerts list.
 * Cycles through ALERT_TEMPLATES so each click shows a different alert.
 * Announces the new alert to screen readers via aria-live region.
 */
function addDemoAlert() {
  const list = document.getElementById('alerts-list');
  if (!list) return;

  const template = ALERT_TEMPLATES[_alertIndex % ALERT_TEMPLATES.length];
  _alertIndex++;

  const el = buildAlertElement(template, 'Just now');
  el.style.opacity   = '0';
  el.style.transform = 'translateY(-10px)';

  list.insertBefore(el, list.firstChild);

  // Animate in
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';
  });

  const toastType = template.type === 'crit' ? 'error'
    : template.type === 'warn' ? 'warn'
    : 'info';

  showToast(`🔔 New Alert: ${template.title}`, toastType);

  if (typeof gtag === 'function') {
    gtag('event', 'alert_simulated', {
      event_category: 'Operations',
      event_label:    template.title,
    });
  }
}

/* ====================================================================
   VOLUNTEER / STAFF TASK ACTIONS
==================================================================== */

/**
 * Approve an AI-generated staff task.
 * Disables the approve button and shows a success toast.
 *
 * @param {string} taskId - Task identifier used to locate the button by ID
 */
function approveTask(taskId) {
  const btn = document.getElementById(`approve-${taskId}-btn`);
  if (btn) {
    btn.textContent = '✓ Approved';
    btn.disabled    = true;
  }
  showToast(`✅ Task approved and dispatched to staff`, 'success');

  if (typeof gtag === 'function') {
    gtag('event', 'task_approved', {
      event_category: 'Staff_Operations',
      event_label:    taskId,
    });
  }
}

/**
 * Reject an AI-generated staff task.
 * In production this would re-queue the task for human review.
 */
function rejectTask() {
  showToast('✗ Task rejected — AI will reassign resources', 'warn');
}

/* ====================================================================
   MODULE INIT
==================================================================== */

/**
 * Initialise the alerts module.
 * Called once by app.js after DOM is ready.
 */
function initAlerts() {
  const addBtn = document.getElementById('add-alert-btn');
  if (addBtn) addBtn.addEventListener('click', addDemoAlert);

  // Staff task approve/reject buttons (delegated)
  document.querySelectorAll('[id^="approve-"]').forEach((btn) => {
    const taskId = btn.id.replace('approve-', '').replace('-btn', '');
    btn.addEventListener('click', () => approveTask(taskId));
  });

  const rejectBtns = document.querySelectorAll('[onclick="rejectTask()"]');
  rejectBtns.forEach((btn) => {
    btn.removeAttribute('onclick');
    btn.addEventListener('click', rejectTask);
  });
}
