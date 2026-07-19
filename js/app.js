/**
 * @fileoverview App entry point — bootstraps all modules after DOM ready.
 *               Wires global event handlers for nav, hero CTAs, and
 *               initialises Google Analytics page-view tracking.
 * @module app
 * @author Asif | AntiGravity
 * @version 2.2.0
 *
 * Load order (defined in index.html):
 *   1. config.js      — constants, time enums, demo responses
 *   2. ui.js          — toast, counter, scroll reveal, nav
 *   3. gemini.js      — AI assistant, response cache, abort controller
 *   4. crowd.js       — crowd zone map, status labels
 *   5. alerts.js      — alert feed + staff tasks
 *   6. navigation.js  — maps, venues, transport, keyboard utility
 *   7. app.js         — this file — ties everything together
 *   8. tests/stadium.test.js — test suite (dev only)
 *
 * @see {@link module:config}      for all application constants
 * @see {@link module:ui}          for UI utilities
 * @see {@link module:gemini}      for AI assistant logic
 * @see {@link module:crowd}       for crowd zone management
 * @see {@link module:alerts}      for operational alert system
 * @see {@link module:navigation}  for maps and transport
 */

'use strict';

/* ====================================================================
   BOOT SEQUENCE
==================================================================== */

/**
 * Dispatch map: regex pattern → handler factory.
 * Matches onclick value patterns to their corresponding event listeners.
 * @type {Array<{regex: RegExp, handler: (el: HTMLElement, match: RegExpMatchArray) => Function}>}
 */
const HANDLER_MAP = [
  {
    regex: /^scrollSection\('([^']+)'\)$/,
    handler: (_el, m) => () => scrollSection(m[1]),
  },
  {
    regex: /^openAIAssistant\(\)$/,
    handler: () => openAIAssistant,
  },
  {
    regex: /^aiRecommendAction\('([^']+)'\)$/,
    handler: (_el, m) => () => aiRecommendAction(m[1]),
  },
  {
    regex: /^sendAlert\(\)$/,
    handler: () => sendAlert,
  },
  {
    regex: /^selectTransport\('([^']+)'\)$/,
    handler: (_el, m) => () => selectTransport(m[1]),
  },
  {
    regex: /^selectVenue\(this,'([^']+)'\)$/,
    handler: (el, m) => () => selectVenue(el, m[1]),
  },
  {
    regex: /^searchVenue\(\)$/,
    handler: () => searchVenue,
  },
  {
    regex: /^sendQuickPrompt\('([^']+)'\)$/,
    handler: (_el, m) => () => sendQuickPrompt(m[1]),
  },
  {
    regex: /^rejectTask\(\)$/,
    handler: () => rejectTask,
  },
];

/**
 * Remove all inline `onclick` attributes from the HTML and replace with
 * addEventListener bindings. Uses a single DOM traversal for efficiency
 * (1 querySelectorAll pass instead of 9 separate passes).
 *
 * @returns {void}
 */
function removeInlineHandlers() {
  // Single DOM traversal — finds ALL elements with onclick attributes
  document.querySelectorAll('[onclick]').forEach((el) => {
    const onclickValue = el.getAttribute('onclick');
    if (!onclickValue) {
      return;
    }

    for (const { regex, handler } of HANDLER_MAP) {
      const match = onclickValue.match(regex);
      if (match) {
        el.removeAttribute('onclick');
        el.addEventListener('click', handler(el, match));
        return; // matched — stop searching
      }
    }
  });

  // Language cycle button (uses id, not generic onclick)
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.removeAttribute('onclick');
    langBtn.addEventListener('click', cycleLang);
  }
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
  if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {return;}

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
  if (typeof gtag !== 'function') {return;}
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
 * Uses named TIME_MS constants from config.js for clarity.
 * @returns {{ days: number, hours: number, minutes: number, seconds: number }}
 */
function getCountdown() {
  const target  = new Date('2026-06-11T20:00:00Z');
  const now     = new Date();
  const diff    = Math.max(0, target - now);

  return {
    days:    Math.floor(diff / TIME_MS.DAY),
    hours:   Math.floor((diff % TIME_MS.DAY)  / TIME_MS.HOUR),
    minutes: Math.floor((diff % TIME_MS.HOUR) / TIME_MS.MINUTE),
    seconds: Math.floor((diff % TIME_MS.MINUTE) / TIME_MS.SECOND),
  };
}

/**
 * Update the countdown display element every second.
 * Uses TIME_MS.SECOND named constant from config.js.
 * @returns {void}
 */
function startCountdown() {
  const el = document.getElementById('countdown-display');
  if (!el) {return;}

  /** @param {void} */
  function tick() {
    const { days, hours, minutes, seconds } = getCountdown();
    el.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  tick();
  setInterval(tick, TIME_MS.SECOND);
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
    `%c⚽ FIFA 2026 Smart Stadium AI Hub — v${CONFIG_VERSION}`,
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

/* ====================================================================
   SERVICE WORKER — offline-first caching
==================================================================== */

/**
 * Register the service worker for offline support and static asset caching.
 * Only runs in secure contexts (HTTPS or localhost).
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('%c✅ Service Worker registered — offline mode active', 'color:#00e676;font-size:11px');
        reg.addEventListener('updatefound', () => {
          console.log('%c🔄 Service Worker update found — reload to get latest', 'color:#f5b400;font-size:11px');
        });
      })
      .catch((err) => {
        // Non-fatal — app works fine without SW (e.g. on file:// protocol)
        console.info('[SW] Registration skipped:', err.message);
      });
  });
}

/* ====================================================================
   GLOBAL ERROR BOUNDARY
==================================================================== */

/**
 * Catch unhandled promise rejections (e.g. network failures, Gemini
 * API errors that escape the try/catch in sendMessage).
 * Prevents silent failures and logs structured diagnostics without
 * exposing internal details to users.
 *
 * @listens window#unhandledrejection
 */
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errorCode = reason?.message?.split(':')[0] || 'E_UNKNOWN';
  console.error(`[StadiumAI] Unhandled async error [${errorCode}]:`, reason);
  // Prevent the default browser unhandled rejection warning in console
  event.preventDefault();
  // Show user-friendly toast if the UI is ready
  if (typeof showToast === 'function') {
    showToast('A background error occurred — please refresh if needed.', 'warn');
  }
});
