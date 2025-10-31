/**
 * LicensePrep Chrome Extension - Background Service Worker
 * Handles background tasks, context menus, message passing, etc.
 */

// Create context menus on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[ServiceWorker] Extension installed');

  // Context menu: Save selected text as note
  chrome.contextMenus.create({
    id: 'saveToNotes',
    title: '📝 Save to LicensePrep Notes',
    contexts: ['selection']
  });

  // Context menu: Translate selected text
  chrome.contextMenus.create({
    id: 'translateText',
    title: '🌐 Translate with LicensePrep',
    contexts: ['selection']
  });

  // Context menu: Ask about selected text
  chrome.contextMenus.create({
    id: 'askAbout',
    title: '🤖 Ask Driving Coach about this',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('[ServiceWorker] Context menu clicked:', info.menuItemId);

  switch (info.menuItemId) {
    case 'saveToNotes':
      await handleSaveToNotes(info, tab);
      break;
    
    case 'translateText':
      await handleTranslate(info, tab);
      break;
    
    case 'askAbout':
      await handleAskAbout(info, tab);
      break;
  }
});

/**
 * Save selected text as note
 */
async function handleSaveToNotes(info, tab) {
  try {
    const selectedText = info.selectionText;
    
    const note = {
      type: 'web_highlight',
      content: selectedText,
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    };

    // Save to Chrome Storage
    const { notes = [] } = await chrome.storage.local.get('notes');
    notes.unshift({
      id: Date.now(),
      ...note
    });
    await chrome.storage.local.set({ notes });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'LicensePrep',
      message: '✅ Saved to notes!',
      priority: 1
    });

    console.log('[ServiceWorker] Note saved:', note);

  } catch (error) {
    console.error('[ServiceWorker] Save note failed:', error);
  }
}

/**
 * Translate selected text
 */
async function handleTranslate(info, tab) {
  try {
    const selectedText = info.selectionText;

    // Send message to content script to execute translation
    await chrome.tabs.sendMessage(tab.id, {
      action: 'translate',
      text: selectedText
    });

  } catch (error) {
    console.error('[ServiceWorker] Translation failed:', error);
  }
}

/**
 * Ask question about selected text
 */
async function handleAskAbout(info, tab) {
  try {
    const selectedText = info.selectionText;

    // Open popup and prefill question
    await chrome.storage.local.set({
      pendingQuestion: `Explain: ${selectedText}`
    });

    // Open popup
    chrome.action.openPopup();

  } catch (error) {
    console.error('[ServiceWorker] Ask about failed:', error);
  }
}

/**
 * Listen for messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ServiceWorker] Message received:', request);

  switch (request.action) {
    case 'getAPIStatus':
      handleGetAPIStatus(sendResponse);
      return true; // keep message channel open
    
    case 'syncData':
      handleSyncData(request.data, sendResponse);
      return true;
    
    default:
      console.warn('[ServiceWorker] Unknown action:', request.action);
  }
});

/**
 * Get API status
 */
async function handleGetAPIStatus(sendResponse) {
  try {
    // Can check API config, user subscription status, etc.
    const status = {
      promptAPI: 'unknown', // need to check in page context
      backendConnected: false,
      userSubscription: 'free'
    };

    sendResponse({ success: true, status });

  } catch (error) {
    console.error('[ServiceWorker] Get API status failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Sync data to backend
 */
async function handleSyncData(data, sendResponse) {
  try {
    // Implement Firebase or backend data sync here
    console.log('[ServiceWorker] Syncing data:', data);

    // TODO: Implement actual sync logic

    sendResponse({ success: true });

  } catch (error) {
    console.error('[ServiceWorker] Data sync failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Listen for extension icon clicks (optional)
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('[ServiceWorker] Extension icon clicked');
  // Default opens popup, custom behavior can be added here
});

/**
 * Periodic data sync (optional)
 */
chrome.alarms.create('syncData', {
  periodInMinutes: 30 // sync every 30 minutes
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    console.log('[ServiceWorker] Auto sync triggered');
    // TODO: Implement auto-sync logic
  }
});

console.log('[ServiceWorker] Background script loaded');

