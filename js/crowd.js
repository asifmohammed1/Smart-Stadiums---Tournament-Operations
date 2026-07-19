/**
 * @fileoverview Crowd management — interactive SVG stadium map, zone
 *               detail panel, AI overflow recommendations, and live metrics.
 * @module crowd
 * @author Asif | AntiGravity
 * @version 2.2.0
 */

'use strict';

/* ====================================================================
   ZONE INFO PANEL
==================================================================== */

/**
 * Zone status configuration.
 * @type {Readonly<Record<string, {borderColor: string, textColor: string, icon: string, message: string}>>}
 */
const ZONE_STYLES = Object.freeze({
  gold: {
    borderColor: 'rgba(245,180,0,0.3)',
    textColor:   'var(--brand-gold)',
    icon:        '⚠️',
    message:     'Approaching high density. Monitor entries and prepare overflow.',
    barClass:    'gold',
  },
  red: {
    borderColor: 'rgba(232,0,45,0.3)',
    textColor:   'var(--brand-red)',
    icon:        '🚨',
    message:     'Critical density — AI overflow protocol initiated. Staff deployed.',
    barClass:    'red',
  },
  green: {
    borderColor: 'rgba(0,230,118,0.3)',
    textColor:   'var(--accent-green)',
    icon:        '✅',
    message:     'Low density — all operations normal. No action required.',
    barClass:    'green',
  },
  cyan: {
    borderColor: 'rgba(0,212,255,0.3)',
    textColor:   'var(--accent-cyan)',
    icon:        'ℹ️',
    message:     'Normal operations — continuous AI monitoring in progress.',
    barClass:    '',
  },
  purple: {
    borderColor: 'rgba(150,80,255,0.3)',
    textColor:   '#9650ff',
    icon:        '👑',
    message:     'VIP section — access controlled, priority concierge active.',
    barClass:    '',
  },
});

/**
 * Map zone style icon to readable status label.
 * Hoisted to module scope to avoid re-creation on every showZoneInfo call.
 * @type {Readonly<Record<string, string>>}
 * @readonly
 */
const STATUS_LABELS = Object.freeze({
  '🚨': 'Critical',
  '⚠️': 'Moderate',
  '✅': 'Low',
  '👑': 'VIP',
  'ℹ️': 'Normal',
});

/**
 * Render zone details into the info panel when a SVG zone is clicked.
 * Uses only safe DOM APIs (no innerHTML with user data).
 *
 * @param {string} zoneName   - Display name of the clicked zone
 * @param {string} pctString  - Occupancy string e.g. "72%"
 * @param {string} colorKey   - Key into ZONE_STYLES
 * @returns {void}
 * @fires gtag#zone_click
 */
/**
 * Helper to build the header row for the zone info card.
 * @param {string} zoneName - Display name of the zone
 * @param {string} pctString - Occupancy percentage string
 * @param {any} style - Zone style configuration
 * @param {number} pct - Numeric occupancy value
 * @returns {HTMLDivElement} Configured header row element
 */
function createZoneHeader(zoneName, pctString, style, pct) {
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px';

  const iconEl = document.createElement('span');
  iconEl.textContent = style.icon;
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.style.fontSize = '20px';

  const titleGroup = document.createElement('div');
  const statusLabel = STATUS_LABELS[style.icon] || 'Normal';

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-family:var(--font-head);font-size:15px;font-weight:700';
  titleEl.textContent = `${zoneName} — ${statusLabel}`;

  const subEl = document.createElement('div');
  subEl.style.cssText = 'font-size:12px;color:var(--text-muted)';
  subEl.textContent = 'AI Zone Analysis';

  titleGroup.appendChild(titleEl);
  titleGroup.appendChild(subEl);

  const pctBadge = document.createElement('span');
  pctBadge.style.cssText = `margin-left:auto;font-family:var(--font-head);font-size:22px;font-weight:800;color:${style.textColor}`;
  pctBadge.textContent = pctString;
  pctBadge.setAttribute('aria-label', `${pct} percent occupied`);

  headerRow.appendChild(iconEl);
  headerRow.appendChild(titleGroup);
  headerRow.appendChild(pctBadge);

  return headerRow;
}

/**
 * Render zone details into the info panel when a SVG zone is clicked.
 * Uses only safe DOM APIs (no innerHTML with user data).
 *
 * @param {string} zoneName   - Display name of the clicked zone
 * @param {string} pctString  - Occupancy string e.g. "72%"
 * @param {string} colorKey   - Key into ZONE_STYLES
 * @returns {void}
 * @fires gtag#zone_click
 */
function showZoneInfo(zoneName, pctString, colorKey) {
  const panel = document.getElementById('zone-info-panel');
  if (!panel) {
    return;
  }

  const style = ZONE_STYLES[colorKey] || ZONE_STYLES.cyan;
  const pct   = parseInt(pctString, 10) || 0;

  // Clear existing content safely (no HTML parser involved)
  panel.replaceChildren();

  // Build card using DOM APIs only
  const card = document.createElement('div');
  card.className = 'card';
  card.style.borderColor = style.borderColor;

  // Header row
  const headerRow = createZoneHeader(zoneName, pctString, style, pct);

  // Description
  const desc = document.createElement('p');
  desc.style.cssText = 'font-size:13px;color:var(--text-muted);margin-bottom:14px';
  desc.textContent = style.message;

  // Progress bar
  const track = document.createElement('div');
  track.className = 'progress-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuenow', String(pct));
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-label', `${zoneName} occupancy: ${pct}%`);

  const fill = document.createElement('div');
  fill.className = `progress-fill${style.barClass ? ` ${style.barClass}` : ''}`;
  fill.style.width = '0%';
  track.appendChild(fill);

  card.appendChild(headerRow);
  card.appendChild(desc);
  card.appendChild(track);

  panel.appendChild(card);

  // Animate progress fill after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      fill.style.width = `${pct}%`;
    }, 50);
  });

  showToast(`📊 Zone: ${zoneName} — ${pctString}`, 'info');

  if (typeof gtag === 'function') {
    gtag('event', 'zone_click', {
      event_category: 'Crowd_Management',
      event_label:    zoneName,
    });
  }
}

/* ====================================================================
   AI ACTION EXECUTION
==================================================================== */

/**
 * Simulate executing an AI-recommended crowd action (e.g. open gates).
 * In production this would dispatch to a stadium operations API.
 *
 * @param {string} actionName - Human-readable action description
 * @returns {void}
 * @fires gtag#ai_action
 */
function aiRecommendAction(actionName) {
  showToast(`✅ AI Action executed: ${actionName}`, 'success');

  if (typeof gtag === 'function') {
    gtag('event', 'ai_action', {
      event_category: 'Crowd_Management',
      event_label:    actionName,
    });
  }
}

/**
 * Simulate broadcasting an alert to all staff in a zone.
 * @returns {void}
 */
function sendAlert() {
  showToast('📣 Alert broadcast to all South Stand staff', 'warn');
}

/* ====================================================================
   KEYBOARD ACCESSIBILITY FOR SVG ZONES
==================================================================== */

/**
 * Add keyboard event listeners to all SVG crowd zones so they can be
 * activated via Enter or Space, matching button behaviour.
 */
function initCrowdZoneKeyboard() {
  document.querySelectorAll('.crowd-zone').forEach((zone) => {
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        zone.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  });
}

/* ====================================================================
   MODULE INIT
==================================================================== */

/**
 * Initialise crowd management module.
 * Called once by app.js after DOM is ready.
 */
function initCrowd() {
  initCrowdZoneKeyboard();
}
