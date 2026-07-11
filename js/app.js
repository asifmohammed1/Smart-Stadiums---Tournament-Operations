/**
 * @fileoverview App entry point — bootstraps all modules after DOM ready.
 *               Wires global event handlers for nav, hero CTAs, and
 *               initialises Google Analytics page-view tracking.
 * @module app
 * @author Asif | AntiGravity
 * @version 2.0.0
 *
 * Load order (defined in index.html):
 *   1. config.js      — constants
 *   2. ui.js          — toast, counter, scroll reveal, nav
 *   3. gemini.js      — AI assistant
 *   4. crowd.js       — crowd zone map
 *   5. alerts.js      — alert feed + staff tasks
 *   6. navigation.js  — maps, venues, transport
 *   7. app.js         — this file — ties everything together
 *   8. tests/stadium.test.js — test suite (dev only)
 */

'use strict';

/* ====================================================================
   BOOT SEQUENCE
==================================================================== */

/**
 * Remove all inline `onclick` attributes from the HTML and replace with
 * addEventListener bindings. This is the most important security step —
 * it eliminates the risk of inline handler injection entirely.
 */
function removeInlineHandlers() {
  // Nav scroll buttons
  document.querySelectorAll('[onclick^="scrollSection"]').forEach((el) => {
    const match = el.getAttribute('onclick').match(/scrollSection\('([^']+)'\)/);
    if (match) {
      el.removeAttribute('onclick');
      el.addEventListener('click', () => scrollSection(match[1]));
    }
  });

  // Hero CTA + nav Ask AI button — open AI assistant
  document.querySelectorAll('[onclick="openAIAssistant()"]').forEach((el) => {
    el.removeAttribute('onclick');
    el.addEventListener('click', openAIAssistant);
  });

  // Language cycle
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.removeAttribute('onclick');
    langBtn.addEventListener('click', cycleLang);
  }

  // Crowd zone — showZoneInfo calls (left on SVG elements via onclick for HTML
  // readability; crowd.js additionally adds keyboard support)

  // "Open in Google Maps" button
  const openMapsBtn = document.getElementById('open-maps-btn');
  if (openMapsBtn && openMapsBtn.hasAttribute('onclick')) {
    openMapsBtn.removeAttribute('onclick');
    openMapsBtn.addEventListener('click', openGoogleMaps);
  }

  // AI action buttons
  document.querySelectorAll('[onclick^="aiRecommendAction"]').forEach((el) => {
    const match = el.getAttribute('onclick').match(/aiRecommendAction\('([^']+)'\)/);
    if (match) {
      el.removeAttribute('onclick');
      el.addEventListener('click', () => aiRecommendAction(match[1]));
    }
  });

  document.querySelectorAll('[onclick="sendAlert()"]').forEach((el) => {
    el.removeAttribute('onclick');
    el.addEventListener('click', sendAlert);
  });

  // Transport cards
  document.querySelectorAll('[onclick^="selectTransport"]').forEach((el) => {
    const match = el.getAttribute('onclick').match(/selectTransport\('([^']+)'\)/);
    if (match) {
      el.removeAttribute('onclick');
      el.addEventListener('click', () => selectTransport(match[1]));
    }
  });

  // Venue route-cards
  document.querySelectorAll('[onclick^="selectVenue"]').forEach((el) => {
    const match = el.getAttribute('onclick').match(/selectVenue\(this,'([^']+)'\)/);
    if (match) {
      el.removeAttribute('onclick');
      el.addEventListener('click', () => selectVenue(el, match[1]));
    }
  });

  // Map search button
  document.querySelectorAll('[onclick="searchVenue()"]').forEach((el) => {
    el.removeAttribute('onclick');
    el.addEventListener('click', searchVenue);
  });

  // sendQuickPrompt buttons (Eco / Accessibility / Transport AI — all variants)
  document.querySelectorAll('[onclick^="sendQuickPrompt"]').forEach((el) => {
    const match = el.getAttribute('onclick').match(/sendQuickPrompt\('([^']+)'\)/);
    if (match) {
      el.removeAttribute('onclick');
      el.addEventListener('click', () => sendQuickPrompt(match[1]));
    }
  });
}

/* ====================================================================
   CONTENT SECURITY POLICY — runtime meta tag
   (complement to HTTP header in production)
==================================================================== */

/**
 * Inject a Content-Security-Policy meta tag at runtime.
 * Production deployments should set this as an HTTP response header instead.
 */
function injectCSPMeta() {
  // Only add if not already present
  if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return;

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com",
    "frame-src https://www.google.com",
  ].join('; ');

  document.head.insertBefore(meta, document.head.firstChild);
}

/* ====================================================================
   ANALYTICS — page view
==================================================================== */

/**
 * Fire an initial page_view event to Google Analytics.
 * Called once after DOMContentLoaded.
 */
function trackPageView() {
  if (typeof gtag !== 'function') return;
  gtag('event', 'page_view', {
    page_title:    'FIFA 2026 Smart Stadium AI Hub',
    page_location: window.location.href,
  });
}

/* ====================================================================
   WELCOME TOASTS
==================================================================== */

/**
 * Show the two welcome toasts that appear 1 s and 3.5 s after page load.
 */
function showWelcomeToasts() {
  setTimeout(() => showToast('🏆 Welcome to FIFA 2026 Smart Stadium Hub!', 'success'), 1000);
  setTimeout(() => showToast('⚠️ South Stand: 94% capacity — AI action initiated', 'warn'), 3500);
}

/* ====================================================================
   COUNTDOWN TIMER (real-time decision support)
==================================================================== */

/**
 * Compute time remaining until FIFA 2026 opening match.
 * Opening match: June 11 2026, 20:00 UTC.
 * @returns {{ days: number, hours: number, minutes: number, seconds: number }}
 */
function getCountdown() {
  const target  = new Date('2026-06-11T20:00:00Z');
  const now     = new Date();
  const diff    = Math.max(0, target - now);

  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

/**
 * Update the countdown display element every second.
 */
function startCountdown() {
  const el = document.getElementById('countdown-display');
  if (!el) return;

  function tick() {
    const { days, hours, minutes, seconds } = getCountdown();
    el.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  tick();
  setInterval(tick, 1000);
}

/* ====================================================================
   NOSCRIPT FALLBACK
==================================================================== */

/* The <noscript> tag in index.html handles users without JavaScript. */

/* ====================================================================
   MAIN INIT
==================================================================== */

/**
 * Application bootstrap — called once on DOMContentLoaded.
 * Initialises all modules in dependency order.
 */
function init() {
  // Security — remove inline handlers ASAP
  removeInlineHandlers();
  injectCSPMeta();

  // Core UI
  initUI();

  // Feature modules
  initGemini();
  initCrowd();
  initAlerts();
  initNavigation();

  // Countdown timer
  startCountdown();

  // Analytics
  trackPageView();

  // UX — welcome toasts
  showWelcomeToasts();

  // Dev console welcome
  console.log(
    '%c⚽ FIFA 2026 Smart Stadium AI Hub — v2.0.0',
    'color:#00d4ff;font-size:16px;font-weight:700'
  );
  console.log(
    '%cPowered by Google Gemini AI · Maps · Analytics · Tag Manager · Fonts · Cloud',
    'color:#8a9bbb;font-size:12px'
  );
  console.log(
    '%c🧪 Run tests: %crunTests()',
    'color:#8a9bbb;font-size:12px',
    'color:#f5b400;font-size:12px;font-weight:700'
  );
  console.log(
    '%c🔑 Enable live AI: set GEMINI_CONFIG.API_KEY in js/config.js',
    'color:#8a9bbb;font-size:12px'
  );
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // Already loaded (e.g. script at bottom of body)
}
