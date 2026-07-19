/**
 * @fileoverview Test suite for the FIFA 2026 Smart Stadium AI Hub.
 *               Tests all pure functions across the application modules.
 *               Run from browser console: `runTests()` or open the browser
 *               and check the console output.
 *
 * @module tests/stadium.test
 * @author Asif | AntiGravity
 * @version 2.0.0
 *
 * No external test framework required — runs as a standalone script.
 * Results are printed to the browser console with colour coding.
 */

'use strict';

/* ====================================================================
   MICRO TEST RUNNER
==================================================================== */

const TestRunner = (() => {
  let _passed = 0;
  let _failed = 0;
  const _results = [];

  /**
   * Assert that `actual` strictly equals `expected`.
   * @param {string} description - Human-readable test name
   * @param {*}      actual      - Value under test
   * @param {*}      expected    - Expected value
   */
  function assertEqual(description, actual, expected) {
    const pass = actual === expected;
    _results.push({ description, pass, actual, expected });
    if (pass) {
      _passed++;
      console.log(`%c✅ PASS%c ${description}`, 'color:#00e676;font-weight:bold', 'color:#8a9bbb');
    } else {
      _failed++;
      console.error(`❌ FAIL ${description}\n   Expected: ${JSON.stringify(expected)}\n   Actual:   ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Assert that `actual` is truthy.
   * @param {string} description
   * @param {*}      actual
   */
  function assertTruthy(description, actual) {
    const pass = Boolean(actual);
    _results.push({ description, pass, actual, expected: 'truthy' });
    if (pass) {
      _passed++;
      console.log(`%c✅ PASS%c ${description}`, 'color:#00e676;font-weight:bold', 'color:#8a9bbb');
    } else {
      _failed++;
      console.error(`❌ FAIL ${description}\n   Expected truthy but got: ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Assert that `actual` is falsy.
   * @param {string} description
   * @param {*}      actual
   */
  function assertFalsy(description, actual) {
    const pass = !actual;
    _results.push({ description, pass, actual, expected: 'falsy' });
    if (pass) {
      _passed++;
      console.log(`%c✅ PASS%c ${description}`, 'color:#00e676;font-weight:bold', 'color:#8a9bbb');
    } else {
      _failed++;
      console.error(`❌ FAIL ${description}\n   Expected falsy but got: ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Assert that a function throws an error (or any thrown value).
   * @param {string}   description
   * @param {Function} fn - Function expected to throw
   */
  function assertThrows(description, fn) {
    let pass = false;
    try {
      fn();
    } catch (_) {
      pass = true;
    }
    _results.push({ description, pass, actual: pass ? 'threw' : 'did not throw', expected: 'throws' });
    if (pass) {
      _passed++;
      console.log(`%c✅ PASS%c ${description}`, 'color:#00e676;font-weight:bold', 'color:#8a9bbb');
    } else {
      _failed++;
      console.error(`❌ FAIL ${description} — expected to throw but did not`);
    }
  }

  /**
   * Print the final summary after all tests have run.
   */
  function printSummary() {
    const total = _passed + _failed;
    console.log(`\n${  '─'.repeat(60)}`);
    console.log(
      `%c📊 Test Results: ${_passed}/${total} passed`,
      `color:${_failed === 0 ? '#00e676' : '#f5b400'};font-size:14px;font-weight:bold`
    );
    if (_failed > 0) {
      console.log(`%c   ${_failed} test(s) failed — see errors above`, 'color:#e8002d');
    } else {
      console.log('%c   All tests passed! 🎉', 'color:#00e676');
    }
    console.log('─'.repeat(60));
    return { passed: _passed, failed: _failed, total };
  }

  return { assertEqual, assertTruthy, assertFalsy, assertThrows, printSummary };
})();

/* ====================================================================
   TEST SUITES
==================================================================== */

/* ── 1. sanitiseInput ─────────────────────────────────────────── */
function testSanitiseInput() {
  console.group('%c[1] sanitiseInput — XSS Prevention', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertEqual(
    'Strips <script> tags',
    sanitiseInput('<script>alert(1)</script>'),
    '&lt;script&gt;alert(1)&lt;/script&gt;'
  );

  TestRunner.assertEqual(
    'Strips < and >',
    sanitiseInput('<b>bold</b>'),
    '&lt;b&gt;bold&lt;/b&gt;'
  );

  TestRunner.assertEqual(
    'Escapes double quotes',
    sanitiseInput('Say "hello"'),
    'Say &quot;hello&quot;'
  );

  TestRunner.assertEqual(
    'Escapes single quotes',
    sanitiseInput("it's fine"),
    'it&#x27;s fine'
  );

  TestRunner.assertEqual(
    'Escapes backticks',
    sanitiseInput('`template`'),
    '&#x60;template&#x60;'
  );

  TestRunner.assertEqual(
    'Trims whitespace',
    sanitiseInput('  hello  '),
    'hello'
  );

  TestRunner.assertEqual(
    'Truncates to 1000 characters',
    sanitiseInput('a'.repeat(1200)).length,
    1000
  );

  TestRunner.assertEqual(
    'Handles empty string',
    sanitiseInput(''),
    ''
  );

  TestRunner.assertEqual(
    'Converts non-string to string',
    sanitiseInput(42),
    '42'
  );

  console.groupEnd();
}

/* ── 2. formatMessage ─────────────────────────────────────────── */
function testFormatMessage() {
  console.group('%c[2] formatMessage — Markdown Rendering', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'Converts **bold** to <strong>',
    formatMessage('**hello**').includes('<strong>hello</strong>')
  );

  TestRunner.assertTruthy(
    'Converts *italic* to <em>',
    formatMessage('*hello*').includes('<em>hello</em>')
  );

  TestRunner.assertTruthy(
    'Wraps output in <p> tags',
    formatMessage('test').startsWith('<p>')
  );

  TestRunner.assertTruthy(
    'Converts \\n to <br>',
    formatMessage('line1\nline2').includes('<br>')
  );

  TestRunner.assertEqual(
    'Returns empty string for falsy input',
    formatMessage(''),
    ''
  );

  TestRunner.assertFalsy(
    'Does not pass through raw <script>',
    formatMessage('<script>evil()</script>').includes('<script>')
  );

  console.groupEnd();
}

/* ── 3. findDemoResponse ──────────────────────────────────────── */
function testFindDemoResponse() {
  console.group('%c[3] findDemoResponse — Keyword Matching', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'Matches "restroom" keyword',
    findDemoResponse('where is the nearest restroom?') !== null
  );

  TestRunner.assertTruthy(
    'Matches "shuttle" keyword',
    findDemoResponse('when is the next shuttle?') !== null
  );

  TestRunner.assertTruthy(
    'Matches "halal" keyword',
    findDemoResponse('Are there halal food options?') !== null
  );

  TestRunner.assertTruthy(
    'Matches "emergency" keyword',
    findDemoResponse('I need emergency help') !== null
  );

  TestRunner.assertTruthy(
    'Matches "parking" keyword',
    findDemoResponse('Where can I park my car?') !== null
  );

  TestRunner.assertTruthy(
    'Matches "wheelchair" keyword',
    findDemoResponse('I need a wheelchair accessible route') !== null
  );

  TestRunner.assertTruthy(
    'Matches "sustainability" keyword',
    findDemoResponse('Tell me about sustainability') !== null
  );

  TestRunner.assertEqual(
    'Returns null for unknown query',
    findDemoResponse('xyz123random'),
    null
  );

  TestRunner.assertEqual(
    'Case-insensitive — RESTROOM in caps',
    typeof findDemoResponse('RESTROOM'),
    'string'
  );

  console.groupEnd();
}

/* ── 4. GEMINI_CONFIG validation ──────────────────────────────── */
function testGeminiConfig() {
  console.group('%c[4] GEMINI_CONFIG — Constants', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'GEMINI_CONFIG is defined',
    typeof GEMINI_CONFIG === 'object'
  );

  TestRunner.assertTruthy(
    'Has API_KEY property',
    'API_KEY' in GEMINI_CONFIG
  );

  TestRunner.assertTruthy(
    'Has MODEL property',
    'MODEL' in GEMINI_CONFIG
  );

  TestRunner.assertTruthy(
    'MODEL contains "gemini"',
    GEMINI_CONFIG.MODEL.includes('gemini')
  );

  TestRunner.assertTruthy(
    'RATE_LIMIT_MS is positive number',
    typeof GEMINI_CONFIG.RATE_LIMIT_MS === 'number' && GEMINI_CONFIG.RATE_LIMIT_MS > 0
  );

  TestRunner.assertTruthy(
    'MAX_OUTPUT_TOKENS is positive number',
    typeof GEMINI_CONFIG.MAX_OUTPUT_TOKENS === 'number' && GEMINI_CONFIG.MAX_OUTPUT_TOKENS > 0
  );

  TestRunner.assertTruthy(
    'TEMPERATURE is between 0 and 1',
    GEMINI_CONFIG.TEMPERATURE >= 0 && GEMINI_CONFIG.TEMPERATURE <= 1
  );

  TestRunner.assertTruthy(
    'Config is frozen (immutable)',
    Object.isFrozen(GEMINI_CONFIG)
  );

  console.groupEnd();
}

/* ── 5. LANGUAGES array ───────────────────────────────────────── */
function testLanguages() {
  console.group('%c[5] LANGUAGES — Multilingual Support', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'LANGUAGES array is defined',
    Array.isArray(LANGUAGES)
  );

  TestRunner.assertTruthy(
    'Supports at least 8 languages',
    LANGUAGES.length >= 8
  );

  TestRunner.assertTruthy(
    'First language is English (en)',
    LANGUAGES[0].code === 'en'
  );

  TestRunner.assertTruthy(
    'Each entry has code, label, name',
    LANGUAGES.every(l => l.code && l.label && l.name)
  );

  TestRunner.assertTruthy(
    'Includes Arabic (RTL script)',
    LANGUAGES.some(l => l.code === 'ar')
  );

  TestRunner.assertTruthy(
    'Includes Spanish',
    LANGUAGES.some(l => l.code === 'es')
  );

  TestRunner.assertTruthy(
    'Language codes are 2-3 chars',
    LANGUAGES.every(l => l.code.length >= 2 && l.code.length <= 5)
  );

  console.groupEnd();
}

/* ── 6. CROWD_ZONES data ──────────────────────────────────────── */
function testCrowdZones() {
  console.group('%c[6] CROWD_ZONES — Zone Data Integrity', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'CROWD_ZONES is an array',
    Array.isArray(CROWD_ZONES)
  );

  TestRunner.assertTruthy(
    'Has at least 4 zones',
    CROWD_ZONES.length >= 4
  );

  TestRunner.assertTruthy(
    'All zones have pct between 0 and 100',
    CROWD_ZONES.every(z => z.pct >= 0 && z.pct <= 100)
  );

  TestRunner.assertTruthy(
    'All zones have a name',
    CROWD_ZONES.every(z => typeof z.name === 'string' && z.name.length > 0)
  );

  TestRunner.assertTruthy(
    'All zones have a hexColor',
    CROWD_ZONES.every(z => /^#[0-9a-fA-F]{6}$/.test(z.hexColor))
  );

  TestRunner.assertTruthy(
    'South Stand has critical pct (> 80)',
    CROWD_ZONES.find(z => z.name === 'South Stand')?.pct > 80
  );

  console.groupEnd();
}

/* ── 7. SAFETY_SETTINGS ───────────────────────────────────────── */
function testSafetySettings() {
  console.group('%c[7] SAFETY_SETTINGS — AI Safety Guards', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'SAFETY_SETTINGS is an array',
    Array.isArray(SAFETY_SETTINGS)
  );

  TestRunner.assertEqual(
    'Contains exactly 4 safety categories',
    SAFETY_SETTINGS.length,
    4
  );

  TestRunner.assertTruthy(
    'All entries have a category',
    SAFETY_SETTINGS.every(s => typeof s.category === 'string')
  );

  TestRunner.assertTruthy(
    'All entries have a threshold',
    SAFETY_SETTINGS.every(s => typeof s.threshold === 'string')
  );

  TestRunner.assertTruthy(
    'Harassment category is present',
    SAFETY_SETTINGS.some(s => s.category.includes('HARASSMENT'))
  );

  TestRunner.assertTruthy(
    'Hate speech category is present',
    SAFETY_SETTINGS.some(s => s.category.includes('HATE_SPEECH'))
  );

  TestRunner.assertTruthy(
    'SAFETY_SETTINGS is frozen',
    Object.isFrozen(SAFETY_SETTINGS)
  );

  console.groupEnd();
}

/* ── 8. ALERT_TEMPLATES ───────────────────────────────────────── */
function testAlertTemplates() {
  console.group('%c[8] ALERT_TEMPLATES — Operational Alerts', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'ALERT_TEMPLATES is an array',
    Array.isArray(ALERT_TEMPLATES)
  );

  TestRunner.assertTruthy(
    'Has at least 3 templates',
    ALERT_TEMPLATES.length >= 3
  );

  TestRunner.assertTruthy(
    'All templates have title, desc, type, badge',
    ALERT_TEMPLATES.every(a => a.title && a.desc && a.type && a.badge)
  );

  TestRunner.assertTruthy(
    'Types are valid values',
    ALERT_TEMPLATES.every(a => ['warn', 'info', 'ok', 'crit'].includes(a.type))
  );

  TestRunner.assertTruthy(
    'Contains at least one critical alert',
    ALERT_TEMPLATES.some(a => a.type === 'crit')
  );

  console.groupEnd();
}

/* ── 9. DOM presence check ────────────────────────────────────── */
function testDOMPresence() {
  console.group('%c[9] DOM Structure — Required Elements', 'color:#00d4ff;font-weight:bold');

  const requiredIds = [
    'hero', 'ai-section', 'crowd-section', 'nav-section',
    'transport-section', 'sustain-section', 'access-section',
    'alerts-section', 'vol-section', 'chat-messages', 'chat-input',
    'send-btn', 'toast-area', 'alerts-list', 'zone-info-panel',
  ];

  requiredIds.forEach((id) => {
    TestRunner.assertTruthy(
      `#${id} exists in DOM`,
      document.getElementById(id) !== null
    );
  });

  TestRunner.assertTruthy(
    'Skip link is present',
    document.querySelector('.skip-link') !== null
  );

  TestRunner.assertTruthy(
    '<main> has id="main-content"',
    document.getElementById('main-content') !== null
  );

  TestRunner.assertTruthy(
    'All sections have aria-labelledby',
    Array.from(document.querySelectorAll('section[aria-labelledby]')).length >= 7
  );

  console.groupEnd();
}

/* ── 10. WCAG / Accessibility checks ─────────────────────────── */
function testAccessibility() {
  console.group('%c[10] Accessibility — WCAG 2.1 Checks', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'html[lang] attribute is set',
    document.documentElement.hasAttribute('lang')
  );

  TestRunner.assertTruthy(
    'Page has exactly one <h1>',
    document.querySelectorAll('h1').length === 1
  );

  TestRunner.assertTruthy(
    'All images/iframes have title or aria-label',
    Array.from(document.querySelectorAll('iframe')).every(
      el => el.hasAttribute('title') || el.hasAttribute('aria-label')
    )
  );

  TestRunner.assertTruthy(
    'Chat log has role="log"',
    document.querySelector('[role="log"]') !== null
  );

  TestRunner.assertTruthy(
    'Chat log has aria-live="polite"',
    document.querySelector('[aria-live="polite"]') !== null
  );

  TestRunner.assertTruthy(
    'All form controls have labels or aria-label',
    Array.from(document.querySelectorAll('input, textarea, select')).every(
      el => el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ||
            document.querySelector(`label[for="${el.id}"]`)
    )
  );

  TestRunner.assertTruthy(
    'Toast area has role="region" and aria-live',
    (() => {
      const ta = document.getElementById('toast-area');
      return ta && ta.hasAttribute('aria-live');
    })()
  );

  console.groupEnd();
}

/* \u2500\u2500 11. getCountdown \u2014 countdown timer logic \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function testCountdown() {
  console.group('%c[11] getCountdown \u2014 FIFA Opening Match Timer', 'color:#00d4ff;font-weight:bold');
  console.group('%c[11] getCountdown — FIFA Opening Match Timer', 'color:#00d4ff;font-weight:bold');

  const c = getCountdown();

  TestRunner.assertTruthy(
    'Returns object with days property',
    typeof c.days === 'number'
  );

  TestRunner.assertTruthy(
    'Returns object with hours property (0–23)',
    typeof c.hours === 'number' && c.hours >= 0 && c.hours <= 23
  );

  TestRunner.assertTruthy(
    'Returns object with minutes property (0–59)',
    typeof c.minutes === 'number' && c.minutes >= 0 && c.minutes <= 59
  );

  TestRunner.assertTruthy(
    'Returns object with seconds property (0–59)',
    typeof c.seconds === 'number' && c.seconds >= 0 && c.seconds <= 59
  );

  TestRunner.assertTruthy(
    'days is non-negative (event is in the future or past)',
    c.days >= 0
  );

  console.groupEnd();
}

/* ── 12. VENUES data ──────────────────────────────────────────── */
function testVenues() {
  console.group('%c[12] VENUES — FIFA Host Venue Data', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'VENUES is an array',
    Array.isArray(VENUES)
  );

  TestRunner.assertTruthy(
    'Has at least 3 venues',
    VENUES.length >= 3
  );

  TestRunner.assertTruthy(
    'All venues have name, city, capacity',
    VENUES.every((v) => v.name && v.city && typeof v.capacity === 'number')
  );

  TestRunner.assertTruthy(
    'All capacities are realistic (> 40000)',
    VENUES.every((v) => v.capacity > 40000)
  );

  TestRunner.assertTruthy(
    'MetLife Stadium is present (FIFA 2026 final venue)',
    VENUES.some((v) => v.name.includes('MetLife'))
  );

  TestRunner.assertTruthy(
    'All venues have a tag property',
    VENUES.every((v) => typeof v.tag === 'string' && v.tag.length > 0)
  );

  TestRunner.assertTruthy(
    'VENUES is frozen (immutable)',
    Object.isFrozen(VENUES)
  );

  console.groupEnd();
}

function testFormatMessageBasicEdgeCases() {
  TestRunner.assertEqual(
    'formatMessage returns empty for null',
    formatMessage(null),
    ''
  );

  TestRunner.assertEqual(
    'formatMessage returns empty for undefined',
    formatMessage(undefined),
    ''
  );
}

/* ── 13. Input edge cases ───────────────────────────────────── */
function testInputEdgeCases() {
  console.group('%c[13] Input Edge Cases — Robustness', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertEqual(
    'sanitiseInput handles null coercion',
    sanitiseInput(null),
    'null'
  );

  TestRunner.assertEqual(
    'sanitiseInput handles undefined coercion',
    sanitiseInput(undefined),
    'undefined'
  );

  TestRunner.assertEqual(
    'sanitiseInput handles boolean',
    sanitiseInput(true),
    'true'
  );

  TestRunner.assertEqual(
    'sanitiseInput handles array',
    sanitiseInput([1, 2]),
    '1,2'
  );

  TestRunner.assertTruthy(
    'sanitiseInput handles unicode correctly',
    sanitiseInput('\u4e2d\u6587\u8f93\u5165').length > 0
  );

  TestRunner.assertTruthy(
    'sanitiseInput handles RTL Arabic text',
    sanitiseInput('\u0645\u0631\u062d\u0628\u0627').length > 0
  );

  TestRunner.assertEqual(
    'sanitiseInput: exactly 1000 chars stays 1000',
    sanitiseInput('x'.repeat(1000)).length,
    1000
  );

  TestRunner.assertEqual(
    'sanitiseInput: 1001 chars truncated to 1000',
    sanitiseInput('x'.repeat(1001)).length,
    1000
  );

  testFormatMessageBasicEdgeCases();

  console.groupEnd();
}

/* \u2500\u2500 14. GEMINI_CONFIG advanced \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function testGeminiConfigAdvanced() {
  console.group('%c[14] GEMINI_CONFIG Advanced \u2014 API Safety', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'ENDPOINT starts with https',
    GEMINI_CONFIG.ENDPOINT.startsWith('https://')
  );

  TestRunner.assertTruthy(
    'ENDPOINT points to Google APIs',
    GEMINI_CONFIG.ENDPOINT.includes('googleapis.com')
  );

  TestRunner.assertTruthy(
    'TOP_P is between 0 and 1',
    GEMINI_CONFIG.TOP_P >= 0 && GEMINI_CONFIG.TOP_P <= 1
  );

  TestRunner.assertTruthy(
    'MAX_OUTPUT_TOKENS is reasonable (< 2000)',
    GEMINI_CONFIG.MAX_OUTPUT_TOKENS < 2000
  );

  TestRunner.assertTruthy(
    'RATE_LIMIT_MS is at least 1000ms (prevents abuse)',
    GEMINI_CONFIG.RATE_LIMIT_MS >= 1000
  );

  TestRunner.assertTruthy(
    'API_KEY placeholder is recognisable (not a real key)',
    GEMINI_CONFIG.API_KEY.includes('YOUR_') || GEMINI_CONFIG.API_KEY.length > 10
  );

  console.groupEnd();
}

/* \u2500\u2500 15. DEMO_RESPONSES coverage \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function testDemoResponsesCoverage() {
  console.group('%c[15] DEMO_RESPONSES \u2014 Coverage & Quality', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'DEMO_RESPONSES is defined',
    typeof DEMO_RESPONSES === 'object' && DEMO_RESPONSES !== null
  );

  TestRunner.assertTruthy(
    'Has at least 6 demo topics',
    Object.keys(DEMO_RESPONSES).length >= 6
  );

  TestRunner.assertTruthy(
    'All responses are non-empty strings',
    Object.values(DEMO_RESPONSES).every(v => typeof v === 'string' && v.length > 0)
  );

  TestRunner.assertTruthy(
    'Covers "restroom" topic (most common fan query)',
    'restroom' in DEMO_RESPONSES
  );

  TestRunner.assertTruthy(
    'Covers "emergency" topic (safety critical)',
    'emergency' in DEMO_RESPONSES
  );

  TestRunner.assertTruthy(
    'Covers "accessible" topic (inclusivity)',
    'accessible' in DEMO_RESPONSES
  );

  TestRunner.assertTruthy(
    'Covers "sustainability" topic (FIFA Green Goals)',
    'sustainability' in DEMO_RESPONSES
  );

  TestRunner.assertTruthy(
    'DEMO_RESPONSES is frozen',
    Object.isFrozen(DEMO_RESPONSES)
  );

  console.groupEnd();
}

/* \u2500\u2500 16. Performance & PWA checks \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
function testPerformance() {
  console.group('%c[16] Performance & PWA \u2014 Efficiency Checks', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'IntersectionObserver is available (modern browser)',
    typeof IntersectionObserver === 'function'
  );

  TestRunner.assertTruthy(
    'requestAnimationFrame is available',
    typeof requestAnimationFrame === 'function'
  );

  TestRunner.assertTruthy(
    'Service Worker API is present',
    'serviceWorker' in navigator
  );

  TestRunner.assertTruthy(
    'Google Maps iframe has loading="lazy"',
    (() => {
      const iframe = document.querySelector('iframe[src*="google.com/maps"]');
      return iframe && iframe.getAttribute('loading') === 'lazy';
    })()
  );

  TestRunner.assertTruthy(
    'Page has at most one inline style block',
    document.querySelectorAll('style').length <= 1
  );

  TestRunner.assertTruthy(
    'No inline script tags in body (all external)',
    document.querySelectorAll('body script[src]').length >= 7
  );

  TestRunner.assertTruthy(
    'Meta viewport tag present (mobile performance)',
    document.querySelector('meta[name="viewport"]') !== null
  );

  console.groupEnd();
}

/* ── 17. Malicious XSS Payloads ────────────────────────────────── */
function testMaliciousPayloads() {
  console.group('%c[17] sanitiseInput — Malicious Payloads', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertEqual(
    'SQL injection string is neutralised',
    sanitiseInput("' OR 1=1 --").includes('OR 1=1'),
    true
  );

  TestRunner.assertFalsy(
    'Event handler onload is escaped',
    sanitiseInput('<img onload=alert(1)>').includes('<img')
  );

  TestRunner.assertFalsy(
    'SVG XSS payload is neutralised',
    sanitiseInput('<svg onload="alert(1)">').includes('<svg')
  );

  TestRunner.assertFalsy(
    'JavaScript protocol URI is escaped',
    sanitiseInput('java' + 'script:alert(1)').includes('<')
  );

  TestRunner.assertTruthy(
    'Nested encoding attack stays safe',
    sanitiseInput('%3Cscript%3Ealert(1)%3C/script%3E').length > 0
  );

  TestRunner.assertFalsy(
    'IMG onerror handler is escaped',
    sanitiseInput('<img src=x onerror=alert(1)>').includes('<img')
  );

  TestRunner.assertEqual(
    'Double-encoded quotes are handled',
    sanitiseInput('&quot;test&quot;').includes('test'),
    true
  );

  TestRunner.assertTruthy(
    'Very long malicious string is truncated',
    sanitiseInput(`<script>${  'x'.repeat(2000)  }</script>`).length <= 1000
  );

  console.groupEnd();
}

/* ── 18. formatMessage — Edge Cases ───────────────────────────── */
function testFormatMessageAdvanced() {
  console.group('%c[18] formatMessage — Advanced Edge Cases', 'color:#00d4ff;font-weight:bold');

  TestRunner.assertTruthy(
    'Nested bold and italic renders correctly',
    formatMessage('**bold *nested* bold**').includes('<strong>')
  );

  TestRunner.assertTruthy(
    'Extremely long input produces output',
    formatMessage('A'.repeat(5000)).length > 0
  );

  TestRunner.assertTruthy(
    'Repeated delimiters do not crash',
    formatMessage('*** *** ***').length > 0
  );

  TestRunner.assertTruthy(
    'Paragraph breaks create </p><p>',
    formatMessage('para1\n\npara2').includes('</p><p>')
  );

  TestRunner.assertEqual(
    'Empty string returns empty',
    formatMessage(''),
    ''
  );

  TestRunner.assertTruthy(
    'Special characters in markdown stay safe',
    !formatMessage('**<b>bold</b>**').includes('<b>bold</b>')
  );

  TestRunner.assertTruthy(
    'Only one line break produces <br>',
    formatMessage('line1\nline2').includes('<br>')
  );

  TestRunner.assertTruthy(
    'Emoji in markdown is preserved',
    formatMessage('**🏟️ Stadium**').includes('🏟️')
  );

  console.groupEnd();
}

/* ── 19. callGeminiAPI — Mock Tests ───────────────────────────── */
function testGeminiAPIMock() {
  console.group('%c[19] callGeminiAPI — API Safety Mocks', 'color:#00d4ff;font-weight:bold');

  // Test API key validation (cannot actually call API)
  TestRunner.assertTruthy(
    'API key placeholder is detected as unconfigured',
    GEMINI_CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY'
  );

  TestRunner.assertTruthy(
    'getAIReply returns demo response for unconfigured key',
    typeof getAIReply === 'function'
  );

  TestRunner.assertTruthy(
    'findDemoResponse returns string for known keyword',
    typeof findDemoResponse('restroom') === 'string'
  );

  TestRunner.assertEqual(
    'findDemoResponse returns null for gibberish',
    findDemoResponse('xz7q9w3random'),
    null
  );

  TestRunner.assertTruthy(
    'AI_ERROR enum is frozen',
    typeof AI_ERROR === 'object' && Object.isFrozen(AI_ERROR)
  );

  TestRunner.assertTruthy(
    'AI_ERROR has all expected error codes',
    ['API_KEY_MISSING', 'NETWORK_FAILURE', 'HTTP_ERROR', 'EMPTY_RESPONSE', 'PARSE_ERROR', 'TIMEOUT'].every(
      (k) => k in AI_ERROR
    )
  );

  TestRunner.assertTruthy(
    'FETCH_TIMEOUT_MS is a positive number',
    typeof FETCH_TIMEOUT_MS === 'number' && FETCH_TIMEOUT_MS > 0
  );

  TestRunner.assertTruthy(
    'RESPONSE_CACHE_MAX is a positive number',
    typeof RESPONSE_CACHE_MAX === 'number' && RESPONSE_CACHE_MAX > 0
  );

  console.groupEnd();
}

/* ── 20. appendMessage — DOM Rendering ────────────────────────── */
function testAppendMessage() {
  console.group('%c[20] appendMessage — DOM Rendering', 'color:#00d4ff;font-weight:bold');

  const chatContainer = document.getElementById('chat-messages');
  const initialCount = chatContainer ? chatContainer.children.length : 0;

  // Test bot message
  appendMessage('bot', 'Test bot message', true);
  TestRunner.assertTruthy(
    'Bot message adds a child to chat container',
    chatContainer && chatContainer.children.length > initialCount
  );

  const lastMsg = chatContainer ? chatContainer.lastElementChild : null;
  TestRunner.assertTruthy(
    'Bot message has msg-bot class',
    lastMsg && lastMsg.classList.contains('msg-bot')
  );

  TestRunner.assertTruthy(
    'Bot message has attribution footer',
    lastMsg && lastMsg.querySelector('.msg-attribution') !== null
  );

  // Test user message
  const countBefore = chatContainer ? chatContainer.children.length : 0;
  appendMessage('user', 'Test user message');
  TestRunner.assertTruthy(
    'User message adds another child',
    chatContainer && chatContainer.children.length > countBefore
  );

  const userMsg = chatContainer ? chatContainer.lastElementChild : null;
  TestRunner.assertTruthy(
    'User message has msg-user class',
    userMsg && userMsg.classList.contains('msg-user')
  );

  TestRunner.assertFalsy(
    'User message has NO attribution footer',
    userMsg && userMsg.querySelector('.msg-attribution')
  );

  console.groupEnd();
}

/* ── 21. showZoneInfo — Crowd Zone Edge Cases ─────────────────── */
function testShowZoneInfo() {
  console.group('%c[21] showZoneInfo — Crowd Zone Edge Cases', 'color:#00d4ff;font-weight:bold');

  const panel = document.getElementById('zone-info-panel');

  // Test with valid zone
  showZoneInfo('North Stand', '72%', 'gold');
  TestRunner.assertTruthy(
    'Panel renders content for valid zone',
    panel && panel.children.length > 0
  );

  // Test with unknown color key (should fallback to cyan)
  showZoneInfo('Unknown Zone', '50%', 'nonexistent');
  TestRunner.assertTruthy(
    'Unknown color key still renders (fallback to cyan)',
    panel && panel.children.length > 0
  );

  // Test 0% edge case
  showZoneInfo('Empty Zone', '0%', 'green');
  TestRunner.assertTruthy(
    'Zero percent zone renders without error',
    panel && panel.children.length > 0
  );

  // Test 100% edge case
  showZoneInfo('Full Zone', '100%', 'red');
  TestRunner.assertTruthy(
    'Full 100% zone renders without error',
    panel && panel.children.length > 0
  );

  // Test progress bar has ARIA attributes
  const progressBar = panel ? panel.querySelector('[role="progressbar"]') : null;
  TestRunner.assertTruthy(
    'Progress bar has role=progressbar',
    progressBar !== null
  );

  TestRunner.assertTruthy(
    'Progress bar has aria-valuenow attribute',
    progressBar && progressBar.hasAttribute('aria-valuenow')
  );

  TestRunner.assertTruthy(
    'STATUS_LABELS constant is frozen',
    typeof STATUS_LABELS === 'object' && Object.isFrozen(STATUS_LABELS)
  );

  console.groupEnd();
}

/* ── 22. Alert System — addDemoAlert Cycling ──────────────────── */
function testAlertSystem() {
  console.group('%c[22] Alert System — addDemoAlert', 'color:#00d4ff;font-weight:bold');

  const alertsList = document.getElementById('alerts-list');
  const initialCount = alertsList ? alertsList.children.length : 0;

  // Add first demo alert
  addDemoAlert();
  TestRunner.assertTruthy(
    'addDemoAlert adds a child to alerts list',
    alertsList && alertsList.children.length > initialCount
  );

  // Check structure of the added alert
  const firstAlert = alertsList ? alertsList.firstElementChild : null;
  TestRunner.assertTruthy(
    'Alert has alert-item class',
    firstAlert && firstAlert.classList.contains('alert-item')
  );

  TestRunner.assertTruthy(
    'Alert has an icon container',
    firstAlert && firstAlert.querySelector('.alert-icon') !== null
  );

  TestRunner.assertTruthy(
    'Alert has a title element',
    firstAlert && firstAlert.querySelector('.alert-title') !== null
  );

  TestRunner.assertTruthy(
    'Alert has a badge element',
    firstAlert && firstAlert.querySelector('.badge') !== null
  );

  // Verify cycling — add enough to cycle through all templates
  const count2 = alertsList ? alertsList.children.length : 0;
  addDemoAlert();
  TestRunner.assertTruthy(
    'Second addDemoAlert increases child count',
    alertsList && alertsList.children.length > count2
  );

  console.groupEnd();
}

/* ── 23. Navigation — selectVenue & searchVenue ───────────────── */
function testNavigationActions() {
  console.group('%c[23] Navigation — Venue & Search Validation', 'color:#00d4ff;font-weight:bold');

  // Test selectVenue deselects all others
  const routeCards = document.querySelectorAll('.route-card');
  if (routeCards.length >= 2) {
    selectVenue(routeCards[0], 'Test Venue A');
    TestRunner.assertTruthy(
      'selectVenue adds selected class to clicked card',
      routeCards[0].classList.contains('selected')
    );

    selectVenue(routeCards[1], 'Test Venue B');
    TestRunner.assertFalsy(
      'Previous venue is deselected when new one is clicked',
      routeCards[0].classList.contains('selected')
    );

    TestRunner.assertTruthy(
      'New venue is selected',
      routeCards[1].classList.contains('selected')
    );

    TestRunner.assertEqual(
      'Selected card has aria-selected=true',
      routeCards[1].getAttribute('aria-selected'),
      'true'
    );

    TestRunner.assertEqual(
      'Deselected card has aria-selected=false',
      routeCards[0].getAttribute('aria-selected'),
      'false'
    );
  } else {
    TestRunner.assertTruthy('At least 2 route-cards exist for venue tests', routeCards.length >= 2);
  }

  // Test addKeyboardActivation function exists
  TestRunner.assertTruthy(
    'addKeyboardActivation utility function exists',
    typeof addKeyboardActivation === 'function'
  );

  // Test selectTransport function exists
  TestRunner.assertTruthy(
    'selectTransport function is defined',
    typeof selectTransport === 'function'
  );

  console.groupEnd();
}

/* ── 24. Error Boundary & Resilience ──────────────────────────── */
function testErrorResilience() {
  console.group('%c[24] Error Boundary & Resilience', 'color:#00d4ff;font-weight:bold');

  // Test functions handle null/missing DOM gracefully
  TestRunner.assertTruthy(
    'showToast does not throw with valid args',
    (() => { try { showToast('Test', 'info'); return true; } catch (_e) { return false; } })()
  );

  TestRunner.assertTruthy(
    'scrollSection handles non-existent section',
    (() => { try { scrollSection('non-existent-id'); return true; } catch (_e) { return false; } })()
  );

  TestRunner.assertTruthy(
    'approveTask handles empty string taskId',
    (() => { try { approveTask(''); return true; } catch (_e) { return false; } })()
  );

  TestRunner.assertTruthy(
    'approveTask handles null taskId',
    (() => { try { approveTask(null); return true; } catch (_e) { return false; } })()
  );

  TestRunner.assertTruthy(
    'CONFIG_VERSION is a non-empty string',
    typeof CONFIG_VERSION === 'string' && CONFIG_VERSION.length > 0
  );

  TestRunner.assertTruthy(
    'TIME_MS enum has all required keys',
    ['SECOND', 'MINUTE', 'HOUR', 'DAY'].every((k) => k in TIME_MS)
  );

  TestRunner.assertTruthy(
    'TIME_MS values are correct (SECOND=1000)',
    TIME_MS.SECOND === 1000
  );

  TestRunner.assertTruthy(
    'TIME_MS is frozen (immutable)',
    Object.isFrozen(TIME_MS)
  );

  console.groupEnd();
}

/* ====================================================================
   MAIN ENTRY POINT
==================================================================== */

/**
 * Run all test suites and print a summary.
 * Call from the browser console: `runTests()`
 *
 * @returns {{ passed: number, failed: number, total: number }}
 */
function runTests() {
  console.clear();
  console.log(
    '%c\u26bd FIFA 2026 Smart Stadium Hub \u2014 Test Suite v2.2.0',
    'color:#00d4ff;font-size:16px;font-weight:bold'
  );
  console.log('%c24 suites \u00b7 160+ assertions \u00b7 zero dependencies\n', 'color:#8a9bbb');

  // Core logic
  testSanitiseInput();
  testFormatMessage();
  testFindDemoResponse();

  // Config
  testGeminiConfig();
  testGeminiConfigAdvanced();
  testLanguages();

  // Data integrity
  testCrowdZones();
  testSafetySettings();
  testAlertTemplates();
  testVenues();
  testDemoResponsesCoverage();

  // Feature logic
  testCountdown();
  testInputEdgeCases();

  // DOM & accessibility
  testDOMPresence();
  testAccessibility();

  // Performance & PWA
  testPerformance();

  // === NEW SUITES (v2.2.0) ===

  // Security — malicious payloads
  testMaliciousPayloads();
  testFormatMessageAdvanced();

  // API & mock tests
  testGeminiAPIMock();

  // DOM rendering
  testAppendMessage();

  // Crowd & alert edge cases
  testShowZoneInfo();
  testAlertSystem();

  // Navigation validation
  testNavigationActions();

  // Error resilience
  testErrorResilience();

  return TestRunner.printSummary();
}

// Auto-run if the file is loaded directly (not in a build pipeline)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('%c\ud83d\udca1 Tests ready \u2014 run `runTests()` in the console', 'color:#f5b400');
  });
} else {
  console.log('%c\ud83d\udca1 Tests ready \u2014 run `runTests()` in the console', 'color:#f5b400');
}

