/**
 * @fileoverview Configuration & constants for the FIFA 2026 Smart Stadium Hub.
 * @module config
 * @author Asif | AntiGravity
 * @version 2.2.0
 *
 * All application-level constants live here so every other module
 * imports from a single source of truth — no magic strings scattered
 * across the codebase.
 *
 * @see {@link https://ai.google.dev/competition FIFA GenAI Hackathon — Problem Statement}
 * @see {@link https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026 FIFA 2026 Official}
 */

'use strict';

/* ====================================================================
   VERSION & TIME CONSTANTS
==================================================================== */

/** @type {string} Runtime version identifier for diagnostics and cache-busting */
const CONFIG_VERSION = '2.2.0';

/**
 * Named time constants (milliseconds) — avoids magic numbers throughout
 * the codebase. Used by countdown, intervals, and rate-limiting logic.
 * @readonly
 * @enum {number}
 */
const TIME_MS = Object.freeze({
  SECOND:  1000,
  MINUTE:  60000,
  HOUR:    3600000,
  DAY:     86400000,
});

/* ====================================================================
   GEMINI AI CONFIGURATION
   Replace API_KEY with your key from https://aistudio.google.com/apikey
==================================================================== */

/**
 * @type {Readonly<{API_KEY: string, MODEL: string, ENDPOINT: string, MAX_OUTPUT_TOKENS: number, TEMPERATURE: number, TOP_P: number, RATE_LIMIT_MS: number}>}
 * @readonly
 * @see {@link https://ai.google.dev/gemini-api/docs Gemini API Documentation}
 */
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

/**
 * System prompt defining StadiumAI persona.
 * Explicitly covers all 8 required FIFA 2026 hackathon verticals:
 *   1. Navigation  2. Crowd Management  3. Accessibility  4. Transportation
 *   5. Sustainability  6. Multilingual  7. Operational Intelligence  8. Real-time Decision Support
 *
 * @type {string}
 * @readonly
 * @see {@link https://ai.google.dev/competition Problem Statement — Required Verticals}
 */
const STADIUM_SYSTEM_PROMPT = `You are StadiumAI, the official AI assistant for FIFA World Cup 2026.
You help fans, volunteers, and staff across all 8 tournament operation verticals:

1. NAVIGATION — Stadium gates, sections, restrooms, concessions, first aid, exits, wayfinding
2. CROWD MANAGEMENT — Live zone density, overflow protocols, gate redistribution, queue prediction
3. ACCESSIBILITY — Wheelchair routes, sensory-friendly zones, sign language support, companion seating, hearing loops
4. TRANSPORTATION — Shuttles, metro, parking availability, rideshare drop-off zones, bike-share
5. SUSTAINABILITY — Eco scores, carbon offset tracking, renewable energy data, composting, FIFA Green Goals 2026
6. MULTILINGUAL — Respond in the same language the user writes in; support 48+ languages for all nations
7. OPERATIONAL INTELLIGENCE — Volunteer coordination, staff task assignment, resource allocation, shift management
8. REAL-TIME DECISION SUPPORT — Live alerts, weather advisories, countdown timers, crowd-triggered AI actions

Additional capabilities:
- Match schedules and team information for all 48 nations
- Food & beverage locations (halal, kosher, vegan, allergen-free options)
- Emergency procedures and safety information

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
 * @readonly
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

  'weather': '🌤️ **Current Weather at MetLife Stadium**\n\n🌡️ Temperature: **28°C (82°F)** — feels like 31°C\n💧 Humidity: 62%\n🌬️ Wind: 12 km/h NW\n☀️ UV Index: **7 (High)** — sunscreen recommended\n\n**Forecast:**\n- Kickoff (19:00): 25°C, clear skies ✅\n- Halftime (20:00): 23°C, 5% rain chance\n- Post-match: 21°C, calm winds\n\n💧 Free water stations at Gates A, C, E. Cooling zones in North and East concourses.\n\n*AI-generated — data from stadium weather sensors. Check local forecasts for updates.*',

  'volunteer': '🤝 **Volunteer & Staff Coordination**\n\n**Your Dashboard:**\n- 📋 Active Tasks: **3 pending** (2 crowd control, 1 accessibility escort)\n- ⏱️ Shift: 16:00–22:00 (Gate C, Level 2)\n- 📍 Station: West Concourse Info Desk\n\n**Quick Actions:**\n- "Accept" tasks from the AI queue in Staff Operations\n- Report issues via the alert broadcast system\n- Request backup: say **"I need help at [location]"**\n\n👥 **142 volunteers** currently active across all zones.\n\n*AI-generated — verify shift details with your coordinator.*',

  'food': '🍔 **Food & Beverage Guide**\n\n| Stall | Cuisine | Dietary | Location |\n|-------|---------|---------|----------|\n| Stall 5 | American BBQ | 🥩 Meat | North Concourse |\n| Stall 12 | 🟢 Halal Burgers | Halal | North Concourse |\n| Stall 19 | Middle Eastern | Halal / Vegan | East Concourse |\n| Stall 24 | Plant Kitchen | 🌱 Vegan | West Concourse |\n| Stall 31 | Asian Fusion | GF options | South Concourse |\n\n🥤 Beverages at every gate. **Free water refill stations** at Gates A, C, E.\n✅ All packaging is 100% compostable (FIFA Green Goals 2026).\n\n*AI-generated — allergen info available at each stall.*',

  'vegan': '🌱 **Vegan & Plant-Based Options**\n\n- **Stall 24** (West Concourse) — Full vegan menu: burgers, wraps, bowls\n- **Stall 19** (East Concourse) — Falafel, hummus plates, salads\n- **Stall 8** (North Concourse) — Vegan pizza, smoothies\n- **VIP Level 3** — Chef\'s plant-based tasting menu\n\n🌿 Every stall has at least **1 vegan option** (FIFA 2026 policy).\n♻️ All packaging is compostable.\n\n*AI-generated — ask stall staff for full allergen breakdown.*',

  'match schedule': '⚽ **FIFA 2026 — Today\'s Schedule at MetLife**\n\n**19:00 ET** — 🇦🇷 Argentina vs 🇧🇷 Brazil (Group A)\n**21:30 ET** — 🇫🇷 France vs 🇩🇪 Germany (Group B)\n\n📅 **Upcoming at this venue:**\n- Tomorrow 17:00 — 🇪🇸 Spain vs 🇯🇵 Japan\n- July 14, 20:00 — Round of 16 (TBD)\n\n🏟️ Gates open **3 hours** before kickoff.\n⚠️ South Stand at 94% — use **West Gate** for faster entry.\n\n*AI-generated — always check the official FIFA app for confirmed schedules.*',
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

/**
 * @type {ReadonlyArray<Language>}
 * @readonly
 */
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

/**
 * @type {ReadonlyArray<Venue>}
 * @readonly
 */
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

/**
 * @type {ReadonlyArray<CrowdZone>}
 * @readonly
 */
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

/**
 * @type {ReadonlyArray<AlertTemplate>}
 * @readonly
 */
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

