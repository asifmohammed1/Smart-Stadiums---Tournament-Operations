/**
 * @fileoverview UI utilities — toasts, counters, scroll-reveal, live clock,
 *               and navigation active-state tracking.
 * @module ui
 * @author Asif | AntiGravity
 * @version 2.2.0
 *
 * All DOM element references are cached once at module init-time to
 * avoid repeated querySelector/getElementById calls in hot paths.
 */

'use strict';

/* ====================================================================
   MODULE STATE
==================================================================== */

/** @type {HTMLElement|null} Cached toast container */
let _toastArea = null;

/** @type {IntersectionObserver|null} */
let _revealObserver = null;

/** @type {IntersectionObserver|null} */
let _navObserver    = null;

/** @type {number|null} Live-clock interval ID */
let _clockInterval  = null;

/** @type {number|null} Live fan-count interval ID */
let _fanCountInterval = null;

/** @type {number} Current language index (shared with chat.js via getter) */
let _langIndex = 0;

/* ── Cached DOM element references (populated in initUI) ─────────── */

/** @type {HTMLElement|null} */
let _totalFansEl = null;

/** @type {HTMLElement|null} */
let _langDisplayEl = null;

/** @type {HTMLSelectElement|null} */
let _chatLangEl = null;

/* ====================================================================
   TOAST NOTIFICATIONS
==================================================================== */

/**
 * Colour map for toast border and icon.
 * @type {Readonly<Record<string, {color: string, icon: string}>>}
 */
const TOAST_STYLES = Object.freeze({
  info:    { color: '#00d4ff', icon: 'ℹ️' },
  success: { color: '#00e676', icon: '✅' },
  warn:    { color: '#f5b400', icon: '⚠️' },
  error:   { color: '#e8002d', icon: '🚨' },
});

/**
 * Display a non-blocking toast notification.
 * Toasts auto-dismiss after 3.5 s. Users can also click ✕ to dismiss.
 *
 * @param {string}                         message - Text to display
 * @param {'info'|'success'|'warn'|'error'} [type='info'] - Toast type
 */
function showToast(message, type = 'info') {
  if (!_toastArea) {
    _toastArea = document.getElementById('toast-area');
    if (!_toastArea) {return;}
  }

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  // Build toast node with sanitized text content (no innerHTML for message)
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.borderLeftColor = style.color;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = style.icon;
  iconSpan.setAttribute('aria-hidden', 'true');

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message; // safe — textContent never executes scripts

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'toast-dismiss';
  dismissBtn.type = 'button';
  dismissBtn.textContent = '✕';
  dismissBtn.setAttribute('aria-label', 'Dismiss notification');
  dismissBtn.addEventListener('click', () => removeToast(toast), { once: true });

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  toast.appendChild(dismissBtn);
  _toastArea.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => removeToast(toast), 3500);

  // Track via GA if available
  if (typeof gtag === 'function') {
    gtag('event', 'toast_shown', { event_category: 'UI', event_label: type });
  }
}

/**
 * Fade out and remove a toast element.
 * @param {HTMLElement} toast
 * @returns {void}
 */
function removeToast(toast) {
  if (!toast.parentNode) {return;}
  toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  toast.style.opacity    = '0';
  toast.style.transform  = 'translateX(20px)';
  setTimeout(() => toast.remove(), 360);
}

/* ====================================================================
   ANIMATED COUNTER
==================================================================== */

/**
 * Animate an element's text from its current numeric value to `target`.
 * Uses requestAnimationFrame for GPU-friendly, 60 fps rendering.
 *
 * @param {HTMLElement} el       - The element whose text to animate
 * @param {number}      target   - Final numeric value
 * @param {string}      [suffix=''] - Optional suffix (e.g. '%', ' km')
 */
function animateCounter(el, target, suffix = '') {
  if (!el) {return;}

  const start    = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
  const duration = 1500; // ms
  let   startTime = null;

  /**
   * @param {number} timestamp - rAF timestamp
   */
  function step(timestamp) {
    if (!startTime) {startTime = timestamp;}
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased  = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);

    el.textContent = current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* ====================================================================
   LIVE FAN COUNT — simulated real-time update
==================================================================== */

/**
 * Start the live fan-count ticker.
 * Adjusts the displayed figure by ±20 every 5 s to simulate streaming data.
 * Only updates when the element is visible (saves CPU when scrolled away).
 * @returns {void}
 */
function startLiveFanCount() {
  _totalFansEl = _totalFansEl || document.getElementById('total-fans');
  if (!_totalFansEl) {return;}

  let isVisible = true;

  // Use IntersectionObserver to pause updates when element is off-screen
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    { threshold: 0 }
  );
  visibilityObserver.observe(_totalFansEl);

  _fanCountInterval = setInterval(() => {
    if (!isVisible) {return;} // Skip update when off-screen
    const current = parseInt(_totalFansEl.textContent.replace(/[^0-9]/g, ''), 10) || 87432;
    const delta   = Math.floor(Math.random() * 41) - 20; // -20 to +20
    _totalFansEl.textContent = (current + delta).toLocaleString();
  }, 5 * TIME_MS.SECOND);
}

/* ====================================================================
   LIVE CLOCK
==================================================================== */

/**
 * Update the browser tab title with a live clock every second.
 * @returns {void}
 */
function startLiveClock() {
  _clockInterval = setInterval(() => {
    const now  = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    document.title = `FIFA 2026 AI Hub · ${time}`;
  }, TIME_MS.SECOND);
}

/**
 * Stop the live clock ticker and restore the default page title.
 * Call this before navigating away or in SPA teardown.
 * Idempotent — safe to call multiple times.
 * @returns {void}
 */
function stopLiveClock() {
  if (_clockInterval !== null) {
    clearInterval(_clockInterval);
    _clockInterval = null;
    document.title = 'FIFA 2026 · Smart Stadium AI Hub';
  }
}

/* ====================================================================
   SCROLL REVEAL ANIMATIONS
==================================================================== */

/**
 * Initialise the IntersectionObserver that triggers .reveal → .visible
 * when elements enter the viewport.
 */
function initScrollReveal() {
  _revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once visible, unobserve to free resources
          _revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    _revealObserver.observe(el);
  });
}

/* ====================================================================
   NAV ACTIVE STATE
==================================================================== */

/** Ordered list of section IDs to track */
const NAV_SECTION_IDS = Object.freeze([
  'hero', 'ai-section', 'crowd-section', 'nav-section',
  'transport-section', 'sustain-section', 'access-section',
  'alerts-section', 'vol-section',
]);

/**
 * Initialise the IntersectionObserver that highlights the matching nav
 * link as sections scroll into the viewport.
 */
function initNavActiveState() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) {return;}

  _navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {return;}
        const idx = NAV_SECTION_IDS.indexOf(entry.target.id);
        if (idx === -1) {return;}

        navLinks.forEach((link) => link.classList.remove('active'));
        if (navLinks[idx]) {navLinks[idx].classList.add('active');}
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  NAV_SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {_navObserver.observe(el);}
  });
}

/* ====================================================================
   SMOOTH SECTION SCROLL
==================================================================== */

/**
 * Smoothly scroll to a section by its ID and track the event.
 * @param {string} sectionId - The HTML element ID to scroll to
 * @returns {void}
 * @fires gtag#section_click
 */
function scrollSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) {return;}

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (typeof gtag === 'function') {
    gtag('event', 'section_click', {
      event_category: 'Navigation',
      event_label:    sectionId,
    });
  }
}

/* ====================================================================
   LANGUAGE CYCLE (header globe button)
==================================================================== */

/**
 * Cycle through the LANGUAGES array, updating the header label and
 * the chat language dropdown, and dispatching a custom event so other
 * modules can react.
 * @returns {void}
 * @fires gtag#language_switch
 */
function cycleLang() {
  _langIndex = (_langIndex + 1) % LANGUAGES.length;
  const lang = LANGUAGES[_langIndex];

  // Update header button label (use cached ref)
  _langDisplayEl = _langDisplayEl || document.getElementById('lang-display');
  if (_langDisplayEl) {_langDisplayEl.textContent = lang.label;}

  // Update chat language select (use cached ref)
  _chatLangEl = _chatLangEl || document.getElementById('chat-lang');
  if (_chatLangEl) {_chatLangEl.value = lang.code;}

  // Update <html lang> attribute for screen readers
  document.documentElement.lang = lang.code;

  showToast(`🌐 Language switched to ${lang.name}`, 'info');

  if (typeof gtag === 'function') {
    gtag('event', 'language_switch', {
      event_category: 'Accessibility',
      event_label:    lang.code,
    });
  }
}

/**
 * Get the currently selected language index.
 * Used by gemini.js to read the active BCP-47 language without
 * importing the full LANGUAGES array.
 *
 * @returns {number} Zero-based index into the LANGUAGES array
 */
function getCurrentLangIndex() {
  return _langIndex;
}

/* ====================================================================
   MODULE INIT
==================================================================== */

/**
 * Bootstrap all UI subsystems.
 * Called once by app.js after DOM is ready.
 */
function initUI() {
  initScrollReveal();
  initNavActiveState();
  startLiveClock();
  startLiveFanCount();

  // Animate hero fan counter
  const fanEl = document.getElementById('stat-fans');
  if (fanEl) {animateCounter(fanEl, 87432);}
}
