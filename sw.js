/**
 * @fileoverview Service Worker — offline-first caching strategy for
 *               the FIFA 2026 Smart Stadium AI Hub.
 *
 * Strategy:
 *   - Static shell (HTML, CSS, JS, fonts) → Cache First
 *   - Gemini API calls                    → Network Only (dynamic)
 *   - Google Maps iframe                  → Network First with stale fallback
 *
 * @version 2.2.0
 * @author  Asif | AntiGravity
 */

'use strict';

const CACHE_NAME    = 'stadium-hub-v2.2.0';
const OFFLINE_URL   = '/index.html';

/** Static assets to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/ui.js',
  '/js/gemini.js',
  '/js/crowd.js',
  '/js/alerts.js',
  '/js/navigation.js',
  '/js/app.js',
  '/manifest.json',
];

/* ── Install: pre-cache static shell ────────────────────────────── */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: delete stale caches ──────────────────────────────── */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for static, network-only for API ─────────── */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Gemini API — always network only (never cache AI responses)
  if (url.hostname === 'generativelanguage.googleapis.com') {
    return; // let browser handle normally
  }

  // Google Analytics / Tag Manager — network only
  if (
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com')
  ) {
    return;
  }

  // Static assets — Cache First
  if (
    request.method === 'GET' &&
    (url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.js')  ||
     url.pathname.endsWith('.html'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {return cached;}
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Google Fonts — Stale-While-Revalidate (serve cached, update in background)
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => cached); // Offline fallback to cache

        return cached || networkFetch;
      })
    );
  }
});
