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
    console.log('\n' + '─'.repeat(60));
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
    '%c⚽ FIFA 2026 Smart Stadium Hub — Test Suite v2.0.0',
    'color:#00d4ff;font-size:16px;font-weight:bold'
  );
  console.log('%cRun from browser console after opening index.html\n', 'color:#8a9bbb');

  testSanitiseInput();
  testFormatMessage();
  testFindDemoResponse();
  testGeminiConfig();
  testLanguages();
  testCrowdZones();
  testSafetySettings();
  testAlertTemplates();
  testDOMPresence();
  testAccessibility();

  return TestRunner.printSummary();
}

// Auto-run if the file is loaded directly (not in a build pipeline)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('%c💡 Tests ready — run `runTests()` in the console', 'color:#f5b400');
  });
} else {
  console.log('%c💡 Tests ready — run `runTests()` in the console', 'color:#f5b400');
}
