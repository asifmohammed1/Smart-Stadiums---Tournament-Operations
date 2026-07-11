/**
 * @fileoverview Configuration & constants for the FIFA 2026 Smart Stadium Hub.
 * @module config
 * @author Asif | AntiGravity
 * @version 2.0.0
 *
 * All application-level constants live here so every other module
 * imports from a single source of truth — no magic strings scattered
 * across the codebase.
 */

'use strict';

/* ====================================================================
   GEMINI AI CONFIGURATION
   Replace API_KEY with your key from https://aistudio.google.com/apikey
==================================================================== */

/** @type {Readonly<{API_KEY: string, MODEL: string, ENDPOINT: string, MAX_OUTPUT_TOKENS: number, TEMPERATURE: number}>} */
const GEMINI_CONFIG = Object.freeze({
  /** Google AI Studio API key — set before use */
  API_KEY:          'YOUR_GEMINI_API_KEY',
  /** Gemini model to use */
  MODEL:            'gemini-2.0-flash-exp',
  /** Base endpoint URL */
  ENDPOINT:         'https://generativelanguage.googleapis.com/v1beta/models',
  /** Maximum tokens in AI response */
  MAX_OUTPUT_TOKENS: 600,
  /** Creativity level (0 = deterministic, 1 = creative) */
  TEMPERATURE:       0.7,
  /** Top-P sampling value */
  TOP_P:             0.9,
  /** Minimum milliseconds between AI requests (rate limiting) */
  RATE_LIMIT_MS:     2000,
});

/* ====================================================================
   SAFETY SETTINGS — Gemini content filters
==================================================================== */

/** @typedef {'BLOCK_MEDIUM_AND_ABOVE'|'BLOCK_ONLY_HIGH'|'BLOCK_NONE'} SafetyThreshold */

/**
 * @type {Array<{category: string, threshold: SafetyThreshold}>}
 */
const SAFETY_SETTINGS = Object.freeze([
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
]);

/* ====================================================================
   SYSTEM PROMPT — Stadium AI persona
==================================================================== */

/** @type {string} */
const STADIUM_SYSTEM_PROMPT = `You are StadiumAI, the official AI assistant for FIFA World Cup 2026.
You help fans, volunteers, and staff with:
- Stadium navigation (gates, sections, restrooms, concessions, first aid, exits)
- Match schedules and team information for all 48 nations
- Transportation (shuttles, metro, parking, rideshare drop-off zones)
- Accessibility support (wheelchair routes, sensory-friendly zones, sign language)
- Food & beverage locations (halal, kosher, vegan, allergen-free options)
- Emergency procedures and safety information
- Sustainability initiatives and eco-friendly choices
- Weather advisories and outdoor conditions
- Volunteer and staff coordination

Always respond in the same language the user writes in.
Be concise (max 200 words), helpful, and friendly.
For emergencies, immediately direct to the hotline: +1-800-FIFA-911.
Cite that responses are AI-generated and encourage users to verify with staff for critical info.`;

/* ====================================================================
   DEMO RESPONSES — used when API_KEY is not configured
==================================================================== */

/**
 * Map of keyword triggers to pre-written responses for demo mode.
 * Keys are lowercase strings matched against the user's input.
 * @type {Readonly<Record<string, string>>}
 */
const DEMO_RESPONSES = Object.freeze({
  'restroom': '🚻 **Nearest Restrooms**\n\nBased on your location (Section 104):\n- **Section 104** — 30 m left, Level 1\n- **Section 106** — 50 m right, Level 1\n- **Accessible restroom** — Gate B, Level 2 (elevator available)\n\nAvg. wait time: 2.3 min. AI suggests Section 104 is least congested right now.\n\n*AI-generated response — verify with stadium staff for real-time updates.*',

  'match': '⚽ **Today\'s Matches at MetLife**\n\n**19:00** — Argentina vs Brazil (Group A)\n**21:30** — France vs Germany (Group B)\n\n🏟️ Gates open 3 hours before kickoff. Arrive early — South Stand at 94% capacity. West Gate recommended.\n\n*AI-generated — always check official FIFA app for latest schedules.*',

  'shuttle': '🚌 **Shuttle Bus Schedule**\n\n**From Stadium → Downtown:**\n- Next departure: **4 minutes** (Platform 3)\n- Every 8 min until 01:00\n- **Free** with match ticket\n\n⚠️ Due to South Stand congestion, use **West Gate shuttle stop** for faster boarding.\n\n*AI-generated response.*',

  'accessible': '♿ **Accessible Entry Gates**\n\n- **Gate A** — North side, ground level, ramp\n- **Gate C** — West side, elevator to all levels ✅ Recommended\n- **Gate E** — East side, priority lanes\n\n📞 Accessibility desk: **ext. 2200**\n🤝 Escort volunteer available at all accessible gates.\n\n*AI-generated — staff available to assist anytime.*',

  'parking': '🅿️ **Parking Availability**\n\n| Lot | Space | Walk |\n|-----|-------|------|\n| Lot A | 77% free ✅ | 8 min |\n| Lot B | 45% free ⚠️ | 5 min |\n| Lot C | 15% free 🔴 | 3 min |\n| Lot D | 69% free ✅ | 10 min |\n\n🤖 AI recommends **Lot A** — most space, smooth post-match exit.\n\n*AI-generated — data updates every 60 seconds.*',

  'halal': '🥙 **Halal Food Options**\n\nAll marked with 🟢 Halal symbol:\n- **Stall 12** (North Concourse) — Halal burgers, wraps\n- **Stall 19** (East Concourse) — Middle Eastern cuisine\n- **Stall 31** (South Concourse) — Halal chicken & rice\n- **VIP Level 3** — Full halal menu\n\n✅ All certified by ISNA. Vegan options at every stall.\n\n*AI-generated response.*',

  'emergency': '🆘 **Emergency Services**\n\n📞 **Hotline: +1-800-FIFA-911**\n🏥 Medical Stations: Gates A, C, E (all levels)\n👮 Security posts every 50 m on main concourse\n🚒 Fire exits: Green signs throughout\n\n**For immediate help:** Press SOS in the app or tell any staff member.\nAverage response time: **1.8 minutes**.\n\n*If this is a life-threatening emergency, call 911 first.*',

  'fan zone': '🎉 **Fan Zone — MetLife**\n\n📍 **South Plaza** — Outside Gate D\n⏰ Open: 4 hours pre-kickoff, 2 hours post-match\n\n🎵 Live music & entertainment\n🍺 Food & beverage village (100+ stalls)\n⚽ Interactive football challenges\n🏆 Trophy replica photo opp\n📱 Giant screens for away matches\n\n**Free entry** with match ticket!\n\n*AI-generated — event schedule subject to change.*',

  'sustainability': '🌍 **FIFA 2026 Sustainability**\n\n**MetLife Eco Score: 94/100 🌿**\n\n✅ 94% renewable energy (solar + wind)\n✅ 87% water recycling\n✅ 78% waste diverted from landfill\n🔄 62% carbon offset progress\n✅ 100% compostable food packaging\n🚲 700 bike-share stations near venues\n\n*Contribute: use shuttles, recycle, choose plant-based meals!*\n\n*AI-generated — data sourced from FIFA Green Goals 2026.*',

  'wheelchair': '♿ **Wheelchair Route to Your Seat**\n\n1. Enter via **Gate C** (West — ground level, zero steps)\n2. Take the **Accessibility Elevator** to your floor\n3. Follow green ♿ floor markers to your section\n4. **Companion seats** available beside all wheelchair positions\n\n👋 Call ext. **2200** for an escort volunteer.\n🔊 Hearing loop active at all accessible seating.\n\n*AI-generated — staff available 24/7.*',
});

/* ====================================================================
   LANGUAGE CONFIGURATION
==================================================================== */

/**
 * @typedef  {Object} Language
 * @property {string} code  - BCP-47 language code
 * @property {string} label - Short display label
 * @property {string} name  - Full human-readable name
 */

/** @type {ReadonlyArray<Language>} */
const LANGUAGES = Object.freeze([
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'ja', label: 'JA', name: '日本語' },
  { code: 'zh', label: 'ZH', name: '中文' },
  { code: 'hi', label: 'HI', name: 'हिन्दी' },
  { code: 'ko', label: 'KO', name: '한국어' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'it', label: 'IT', name: 'Italiano' },
]);

/* ====================================================================
   VENUE DATA
==================================================================== */

/**
 * @typedef  {Object} Venue
 * @property {string} name     - Stadium name
 * @property {string} city     - Host city
 * @property {number} capacity - Seat capacity
 * @property {string} tag      - Event tag (e.g. "Final", "Group")
 * @property {string} tagClass - Badge CSS class
 */

/** @type {ReadonlyArray<Venue>} */
const VENUES = Object.freeze([
  { name: 'MetLife Stadium',  city: 'East Rutherford, NJ', capacity: 82500, tag: 'Final',    tagClass: 'badge-gold' },
  { name: 'SoFi Stadium',     city: 'Inglewood, CA',       capacity: 70240, tag: 'Group',    tagClass: 'badge-cyan' },
  { name: 'AT&T Stadium',     city: 'Arlington, TX',       capacity: 80000, tag: 'Semi-final',tagClass: 'badge-cyan' },
  { name: 'Estadio Azteca',   city: 'Mexico City, MX',     capacity: 87523, tag: 'Opening',  tagClass: 'badge-green' },
  { name: 'BC Place',         city: 'Vancouver, CA',       capacity: 54500, tag: 'Group',    tagClass: 'badge-cyan' },
]);

/* ====================================================================
   CROWD ZONE DATA
==================================================================== */

/**
 * @typedef  {Object} CrowdZone
 * @property {string} name       - Zone display name
 * @property {number} pct        - Occupancy percentage (0-100)
 * @property {string} colorClass - CSS color class
 * @property {string} status     - Human-readable status label
 */

/** @type {ReadonlyArray<CrowdZone>} */
const CROWD_ZONES = Object.freeze([
  { name: 'North Stand', pct: 72, colorClass: 'gold',   hexColor: '#f5b400', status: 'Moderate'  },
  { name: 'South Stand', pct: 94, colorClass: 'red',    hexColor: '#e8002d', status: 'CRITICAL'  },
  { name: 'East Stand',  pct: 38, colorClass: 'green',  hexColor: '#00e676', status: 'Low'       },
  { name: 'West Stand',  pct: 61, colorClass: 'cyan',   hexColor: '#00d4ff', status: 'Normal'    },
  { name: 'VIP Box',     pct: 55, colorClass: 'purple', hexColor: '#9650ff', status: 'Normal'    },
]);

/* ====================================================================
   DEMO ALERT TEMPLATES
==================================================================== */

/**
 * @typedef  {Object} AlertTemplate
 * @property {'warn'|'info'|'ok'|'crit'} type
 * @property {string} icon
 * @property {string} title
 * @property {string} desc
 * @property {string} badge
 * @property {string} badgeClass
 */

/** @type {ReadonlyArray<AlertTemplate>} */
const ALERT_TEMPLATES = Object.freeze([
  {
    type: 'warn', icon: '🔋',
    title: 'Battery Station — Low Stock',
    desc:  'EV charging pods at Gate E running low. Maintenance requested.',
    badge: 'WARN', badgeClass: 'badge-gold',
  },
  {
    type: 'ok',   icon: '✅',
    title: 'Gate B — Queue Cleared',
    desc:  'AI rerouting successful. South Gate B queue reduced from 18 min to 4 min.',
    badge: 'RESOLVED', badgeClass: 'badge-green',
  },
  {
    type: 'info', icon: '📢',
    title: 'PA Announcement — AI Draft Ready',
    desc:  'Gemini AI drafted multilingual PA message re: South Stand congestion in 12 languages.',
    badge: 'INFO', badgeClass: 'badge-cyan',
  },
  {
    type: 'crit', icon: '🚑',
    title: 'Medical Assistance — Section 112',
    desc:  'Fan reported feeling unwell. Medical team dispatched. ETA 90 seconds.',
    badge: 'URGENT', badgeClass: 'badge-red',
  },
]);

/* ====================================================================
   GOOGLE ANALYTICS & TAG MANAGER IDs
   Replace with your real IDs from https://analytics.google.com
   and https://tagmanager.google.com
==================================================================== */

/**
 * Google Analytics 4 measurement ID.
 * @type {string}
 * @see https://support.google.com/analytics/answer/9304153
 */
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

/**
 * Google Tag Manager container ID.
 * @type {string}
 * @see https://support.google.com/tagmanager/answer/6103696
 */
const GTM_ID = 'GTM-XXXXXXX';

