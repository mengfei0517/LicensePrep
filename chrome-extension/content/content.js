/**
 * LicensePrep Chrome Extension - Content Script
 * Injected into web pages, provides contextual notes, highlighting, etc.
 */

console.log('[LicensePrep] Content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ContentScript] Message received:', request);

  switch (request.action) {
    case 'translate':
      handleTranslate(request.text);
      break;
    
    case 'highlight':
      handleHighlight(request.text);
      break;
    
    default:
      console.warn('[ContentScript] Unknown action:', request.action);
  }
});

/**
 * Handle translation requests
 */
async function handleTranslate(text) {
  try {
    // Create translation overlay
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="licenseprep-translate-panel">
        <div class="panel-header">
          <h3>🌐 Translation</h3>
          <button class="close-btn">✕</button>
        </div>
        <div class="panel-content">
          <div class="original-text">
            <strong>Original:</strong>
            <p>${escapeHtml(text)}</p>
          </div>
          <div class="translated-text">
            <strong>Translating...</strong>
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind close button
    overlay.querySelector('.close-btn').addEventListener('click', () => {
      overlay.remove();
    });

    // Call translation API
    // Note: Translator API can only be used in Extension context
    // Needs to go through background script
    const result = await chrome.runtime.sendMessage({
      action: 'translateText',
      text: text,
      targetLang: 'en'
    });

    if (result.success) {
      overlay.querySelector('.translated-text').innerHTML = `
        <strong>Translated (${result.targetLanguage.toUpperCase()}):</strong>
        <p>${escapeHtml(result.translatedText)}</p>
      `;
    } else {
      overlay.querySelector('.translated-text').innerHTML = `
        <strong>Translation not available</strong>
        <p>Please use the extension popup for translation.</p>
      `;
    }

  } catch (error) {
    console.error('[ContentScript] Translation failed:', error);
  }
}

/**
 * Handle highlighting
 */
function handleHighlight(text) {
  try {
    // Find and highlight text
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'licenseprep-highlight';
      span.style.backgroundColor = '#fef08a';
      span.style.padding = '2px 4px';
      span.style.borderRadius = '2px';
      
      range.surroundContents(span);
      
      console.log('[ContentScript] Text highlighted');
    }

  } catch (error) {
    console.error('[ContentScript] Highlight failed:', error);
  }
}

/**
 * Create overlay
 */
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'licenseprep-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
  `;
  return overlay;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize: Check for pending questions
 */
async function init() {
  try {
    const { pendingQuestion } = await chrome.storage.local.get('pendingQuestion');
    
    if (pendingQuestion) {
      console.log('[ContentScript] Pending question found:', pendingQuestion);
      // Clear pending question
      await chrome.storage.local.remove('pendingQuestion');
    }

  } catch (error) {
    console.error('[ContentScript] Init failed:', error);
  }
}

// Initialize
init();

