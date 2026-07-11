/**
 * @fileoverview Google Gemini AI integration for the stadium chat assistant.
 *               Handles API calls, rate limiting, input sanitisation,
 *               response rendering, and safe demo-mode fallback.
 * @module gemini
 * @author Asif | AntiGravity
 * @version 2.0.0
 */

'use strict';

/* ====================================================================
   MODULE STATE
==================================================================== */

/** @type {number|null} Timestamp of the last API call (for rate limiting) */
let _lastRequestTime = 0;

/** @type {boolean} Whether a request is currently in flight */
let _requestPending  = false;

/* ====================================================================
   INPUT SANITISATION
==================================================================== */

/**
 * Strip all HTML tags and dangerous characters from user input.
 * This prevents XSS when content is inserted into the DOM via
 * textContent (safe) or when used as an API payload.
 *
 * @param  {string} raw - Raw string from user input field
 * @returns {string}    Safe, trimmed, HTML-stripped string
 */
function sanitiseInput(raw) {
  return String(raw)
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .slice(0, 1000); // max 1000 chars — guards against large payload attacks
}

/* ====================================================================
   MARKDOWN-LITE FORMATTER
==================================================================== */

/**
 * Convert a limited subset of markdown to safe HTML for display
 * inside chat bubbles. Only a safe allowlist of tags is produced.
 *
 * Supported syntax:
 * - `**text**`  → `<strong>`
 * - `*text*`    → `<em>`
 * - `# Heading` → `<strong>` (simplified)
 * - `\n\n`      → paragraph break
 * - `\n`        → `<br>`
 * - `| a | b |` → simple table row
 *
 * @param  {string} text - Raw markdown text from AI
 * @returns {string}      Safe HTML string
 */
function formatMessage(text) {
  if (!text) return '';

  // Sanitise first — strip any HTML the model may have emitted
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply markdown transformations
  safe = safe
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/\n\n/g,          '</p><p>')
    .replace(/\n/g,            '<br>');

  return `<p>${safe}</p>`;
}

/* ====================================================================
   DEMO RESPONSE MATCHER
==================================================================== */

/**
 * Find the best matching demo response for a given user message.
 * Checks if the message contains any of the DEMO_RESPONSES keys.
 *
 * @param  {string}      message - Sanitised user message (lowercase)
 * @returns {string|null}         Matching demo response or null
 */
function findDemoResponse(message) {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(DEMO_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return null;
}

/* ====================================================================
   GEMINI API CALL
==================================================================== */

/**
 * Send a message to the Google Gemini API and return the text response.
 * Includes rate limiting (GEMINI_CONFIG.RATE_LIMIT_MS between calls).
 *
 * @param  {string}          userMessage - Sanitised user input
 * @param  {string}          lang        - BCP-47 language code for response
 * @returns {Promise<string>}             AI response text
 * @throws {Error}                        On network failure or non-2xx response
 */
async function callGeminiAPI(userMessage, lang) {
  // Rate limit guard
  const now     = Date.now();
  const elapsed = now - _lastRequestTime;
  if (elapsed < GEMINI_CONFIG.RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, GEMINI_CONFIG.RATE_LIMIT_MS - elapsed));
  }
  _lastRequestTime = Date.now();

  // Validate API key format (basic check — not empty, not the placeholder)
  if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error('API key not configured');
  }

  const langInstruction = lang !== 'en'
    ? `\n\nIMPORTANT: Respond in the language with BCP-47 code "${lang}".`
    : '';

  const prompt = `${STADIUM_SYSTEM_PROMPT}${langInstruction}\n\nUser: ${userMessage}`;

  const url = `${GEMINI_CONFIG.ENDPOINT}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     GEMINI_CONFIG.TEMPERATURE,
        maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
        topP:            GEMINI_CONFIG.TOP_P,
      },
      safetySettings: SAFETY_SETTINGS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return text;
}

/* ====================================================================
   CHAT MESSAGE RENDERING
==================================================================== */

/**
 * Append a message bubble to the chat messages container.
 *
 * @param {'bot'|'user'} role     - Sender role
 * @param {string}       content  - Raw markdown text (for bot) or sanitised text (for user)
 * @param {boolean}      [isDemo=false] - Whether response came from demo mode
 */
function appendMessage(role, content, isDemo = false) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = `msg msg-${role}`;

  const label = document.createElement('div');
  label.className   = 'msg-label';
  label.textContent = role === 'bot' ? 'StadiumAI' : 'You';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (role === 'bot') {
    // Safe: formatMessage only produces allowlisted tags
    bubble.innerHTML = formatMessage(content);
  } else {
    // User content: always use textContent — never innerHTML
    bubble.textContent = content;
  }

  wrapper.appendChild(label);
  wrapper.appendChild(bubble);

  // Attribution footer on bot messages
  if (role === 'bot') {
    const attr = document.createElement('div');
    attr.className = 'msg-attribution';

    const sourceIcon = document.createElement('span');
    sourceIcon.setAttribute('aria-hidden', 'true');
    sourceIcon.textContent = isDemo ? '📋' : '🤖';

    const sourceText = document.createElement('span');
    sourceText.textContent = isDemo
      ? 'Demo response — configure API key for live AI'
      : 'Powered by Google Gemini 2.0 · AI-generated, verify with staff';

    attr.appendChild(sourceIcon);
    attr.appendChild(sourceText);
    wrapper.appendChild(attr);
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;

  // Announce to screen readers
  container.setAttribute('aria-label', `Chat messages, last from ${role}`);
}

/**
 * Show the animated typing indicator in the chat.
 * @returns {HTMLElement} The indicator element (caller should remove it when done)
 */
function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'msg msg-bot';
  wrapper.id = 'typing-indicator';
  wrapper.setAttribute('aria-label', 'AI is typing');

  const label = document.createElement('div');
  label.className   = 'msg-label';
  label.textContent = 'StadiumAI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }

  bubble.appendChild(indicator);
  wrapper.appendChild(label);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;

  return wrapper;
}

/* ====================================================================
   AI REPLY RESOLVER — separated from UI concerns
==================================================================== */

/**
 * Resolve the AI reply text, either from the live Gemini API or from
 * demo mode. Separated from sendMessage so each function has one
 * clear responsibility and stays under 40 lines.
 *
 * @param  {string}          safe - Already-sanitised user message
 * @param  {string}          lang - BCP-47 language code
 * @returns {Promise<{reply: string, isDemo: boolean}>}
 */
async function getAIReply(safe, lang) {
  const isApiConfigured =
    GEMINI_CONFIG.API_KEY && GEMINI_CONFIG.API_KEY !== 'YOUR_GEMINI_API_KEY';

  if (isApiConfigured) {
    const reply = await callGeminiAPI(safe, lang);
    return { reply, isDemo: false };
  }

  // Demo mode — simulate realistic network latency
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));
  const reply = findDemoResponse(safe)
    || 'Thank you for your question! 🏆 I\'m StadiumAI, your FIFA 2026 assistant.\n\n'
    + 'To enable live AI responses, add your **Google Gemini API key** in `js/config.js`.\n\n'
    + 'Meanwhile, try the quick-prompt chips above — I can help with restrooms, shuttles, '
    + 'parking, food, accessibility, emergencies, and more!';
  return { reply, isDemo: true };
}

/* ====================================================================
   MAIN SEND HANDLER
==================================================================== */

/**
 * Read the chat input, resolve an AI reply, and render it.
 * Handles UI state (disable/enable button, typing indicator) and
 * delegates all AI logic to getAIReply().
 *
 * @returns {Promise<void>}
 */
async function sendMessage() {
  if (_requestPending) return; // Prevent double-submit

  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const langSel = document.getElementById('chat-lang');

  if (!inputEl || !sendBtn) return;

  const rawMessage = inputEl.value;
  if (!rawMessage.trim()) return;

  const safe = sanitiseInput(rawMessage);
  const lang = langSel ? langSel.value : 'en';

  appendMessage('user', safe);
  inputEl.value       = '';
  _requestPending     = true;
  sendBtn.disabled    = true;
  sendBtn.textContent = '⏳';

  if (typeof gtag === 'function') {
    gtag('event', 'ai_message_sent', { event_category: 'AI_Assistant', event_label: lang });
  }

  const typingEl = showTypingIndicator();

  try {
    const { reply, isDemo } = await getAIReply(safe, lang);
    if (typingEl) typingEl.remove();
    appendMessage('bot', reply, isDemo);
  } catch (err) {
    console.error('[StadiumAI] Gemini error:', err.message);
    if (typingEl) typingEl.remove();
    appendMessage(
      'bot',
      '⚠️ I\'m having trouble connecting right now. Please try again in a moment, '
      + 'or visit the nearest **Information Desk** for immediate assistance.\n\n'
      + '📞 Emergency: **+1-800-FIFA-911**',
      true
    );
    showToast('AI connection issue — using offline mode', 'warn');
  } finally {
    _requestPending     = false;
    sendBtn.disabled    = false;
    sendBtn.textContent = '➤ Send';
  }
}

/* ====================================================================
   QUICK PROMPT CHIP HANDLER
==================================================================== */

/**
 * Pre-fill the chat input with a prompt text and auto-send it.
 * Scrolls the AI section into view first.
 *
 * @param {string} text - Prompt text to send
 */
function sendQuickPrompt(text) {
  const aiSection = document.getElementById('ai-section');
  const inputEl   = document.getElementById('chat-input');

  if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (inputEl) inputEl.value = text;

  // Small delay so the scroll completes before sending
  setTimeout(sendMessage, 350);
}

/* ====================================================================
   OPEN AI ASSISTANT SHORTCUT (hero CTA button)
==================================================================== */

/**
 * Scroll to the AI section and focus the chat input.
 */
function openAIAssistant() {
  const aiSection = document.getElementById('ai-section');
  const inputEl   = document.getElementById('chat-input');

  if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (inputEl)   setTimeout(() => inputEl.focus(), 500);
}

/* ====================================================================
   KEYBOARD SHORTCUT — Enter to send
==================================================================== */

/**
 * Handle keydown on the chat textarea.
 * Enter (without Shift) submits the message.
 *
 * @param {KeyboardEvent} event
 */
function handleChatKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

/* ====================================================================
   MODULE INIT
==================================================================== */

/**
 * Attach event listeners to the chat input and send button.
 * Called once by app.js after DOM is ready.
 */
function initGemini() {
  const inputEl  = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('send-btn');

  if (inputEl) inputEl.addEventListener('keydown', handleChatKey);
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  // Quick-prompt chip click handler (delegated to container)
  const quickPromptsContainer = document.querySelector('.chat-quick-prompts');
  if (quickPromptsContainer) {
    quickPromptsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.quick-chip');
      if (chip) sendQuickPrompt(chip.textContent.trim());
    });
  }
}
