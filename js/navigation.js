/**
 * @fileoverview Navigation & transport module — Google Maps integration,
 *               venue selection, route display, and transport mode logic.
 * @module navigation
 * @author Asif | AntiGravity
 * @version 2.0.0
 */

'use strict';

/* ====================================================================
   VENUE SELECTION
==================================================================== */

/**
 * Highlight the clicked venue card and show a toast.
 * Removes the 'selected' class from all other route-cards first.
 *
 * @param {HTMLElement} el   - The clicked card element
 * @param {string}      name - Venue display name
 */
function selectVenue(el, name) {
  document.querySelectorAll('.route-card').forEach((card) => {
    card.classList.remove('selected');
    card.setAttribute('aria-selected', 'false');
  });

  el.classList.add('selected');
  el.setAttribute('aria-selected', 'true');

  showToast(`📍 Selected: ${name}`, 'info');

  if (typeof gtag === 'function') {
    gtag('event', 'venue_select', {
      event_category: 'Navigation',
      event_label:    name,
    });
  }
}

/* ====================================================================
   MAP SEARCH (demo / UI only — production uses Maps JS API)
==================================================================== */

/**
 * Read the map search input value and display a toast.
 * In production this would call the Google Maps Places API.
 */
function searchVenue() {
  const input = document.getElementById('map-search-input');
  if (!input) return;

  const query = input.value.trim();
  if (!query) {
    showToast('Please enter a venue or facility name', 'warn');
    return;
  }

  showToast(`🔍 Searching: ${query}`, 'info');

  if (typeof gtag === 'function') {
    gtag('event', 'venue_search', {
      event_category: 'Navigation',
      event_label:    query,
    });
  }
}

/* ====================================================================
   OPEN GOOGLE MAPS EXTERNAL LINK
==================================================================== */

/**
 * Open Google Maps in a new tab pointing to MetLife Stadium.
 * Uses rel="noopener noreferrer" equivalent via window.open flags.
 */
function openGoogleMaps() {
  window.open(
    'https://maps.google.com?q=MetLife+Stadium+East+Rutherford+NJ',
    '_blank',
    'noopener,noreferrer'
  );

  if (typeof gtag === 'function') {
    gtag('event', 'maps_open', {
      event_category: 'Navigation',
      event_label:    'MetLife Stadium',
    });
  }
}

/* ====================================================================
   TRANSPORT CARD INTERACTIONS
==================================================================== */

/**
 * Handle transport card click — show a toast and open the AI assistant
 * with a pre-filled transport query.
 *
 * @param {string} mode - Transport mode label (e.g. 'Shuttle Bus', 'Metro')
 */
function selectTransport(mode) {
  showToast(`🚌 Loading ${mode} info…`, 'info');
  sendQuickPrompt(`Tell me about ${mode} options to reach the stadium`);

  if (typeof gtag === 'function') {
    gtag('event', 'transport_select', {
      event_category: 'Transport',
      event_label:    mode,
    });
  }
}

/* ====================================================================
   MAP SEARCH — Enter key support
==================================================================== */

/**
 * Allow pressing Enter inside the map search box to trigger search.
 * @param {KeyboardEvent} event
 */
function handleMapSearchKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchVenue();
  }
}

/* ====================================================================
   MODULE INIT
==================================================================== */

/**
 * Attach event listeners for navigation and transport interactions.
 * Removes inline onclick attributes and replaces with addEventListener.
 * Called once by app.js after DOM is ready.
 */
function initNavigation() {
  // Map search input — keyboard support
  const mapSearch = document.getElementById('map-search-input');
  if (mapSearch) {
    mapSearch.addEventListener('keydown', handleMapSearchKey);
  }

  // Open maps button
  const openMapsBtn = document.getElementById('open-maps-btn');
  if (openMapsBtn) {
    openMapsBtn.removeAttribute('onclick');
    openMapsBtn.addEventListener('click', openGoogleMaps);
  }

  // Venue route-cards — keyboard support
  document.querySelectorAll('.route-card').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'option');
    card.setAttribute('aria-selected', card.classList.contains('selected') ? 'true' : 'false');

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  });

  // Transport cards — keyboard support
  document.querySelectorAll('.transport-card').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  });
}
