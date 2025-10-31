/**
 * LicensePrep Chrome Extension - Popup Script
 * Main functionality: AI Q&A interface
 */

import { promptAPI } from '../utils/prompt-api.js';
import { translatorAPI } from '../utils/translator-api.js';
import { summarizerAPI } from '../utils/summarizer-api.js';
import { storage } from '../utils/storage.js';

// DOM Elements
let elements = {};

// Current answer data
let currentAnswer = null;

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing...');
  
  // Get DOM elements
  elements = {
    questionInput: document.getElementById('questionInput'),
    askButton: document.getElementById('askButton'),
    translateButton: document.getElementById('translateButton'),
    answerSection: document.getElementById('answerSection'),
    answerContent: document.getElementById('answerContent'),
    aiMode: document.getElementById('aiMode'),
    latency: document.getElementById('latency'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryButton: document.getElementById('retryButton'),
    summarizeButton: document.getElementById('summarizeButton'),
    saveButton: document.getElementById('saveButton'),
    copyButton: document.getElementById('copyButton'),
    apiStatus: document.getElementById('apiStatus'),
    historyLink: document.getElementById('historyLink'),
    settingsLink: document.getElementById('settingsLink'),
    openWebAppLink: document.getElementById('openWebAppLink'),
    historyPanel: document.getElementById('historyPanel'),
    closeHistoryButton: document.getElementById('closeHistoryButton'),
    historyList: document.getElementById('historyList')
  };

  // Bind events
  elements.askButton.addEventListener('click', handleAsk);
  elements.translateButton.addEventListener('click', handleTranslate);
  elements.retryButton.addEventListener('click', handleAsk);
  elements.summarizeButton.addEventListener('click', handleSummarize);
  elements.saveButton.addEventListener('click', handleSave);
  elements.copyButton.addEventListener('click', handleCopy);
  elements.historyLink.addEventListener('click', showHistory);
  elements.closeHistoryButton.addEventListener('click', hideHistory);
  elements.openWebAppLink.addEventListener('click', openWebApp);

  // Support Enter to submit (Shift+Enter for new line)
  elements.questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  });

  // Check API availability
  await checkAPIAvailability();

  console.log('[Popup] Initialized');
});

/**
 * Check Chrome Built-in AI API availability
 */
async function checkAPIAvailability() {
  try {
    const available = await promptAPI.checkAvailability();
    
    if (available === true) {
      updateAPIStatus('ready', '🔒 Local AI Ready');
    } else if (available === 'downloading') {
      updateAPIStatus('downloading', '⬇️ Downloading Model...');
    } else {
      updateAPIStatus('cloud', '☁️ Cloud Mode');
    }

  } catch (error) {
    console.error('[Popup] API check failed:', error);
    updateAPIStatus('cloud', '☁️ Cloud Mode');
  }
}

/**
 * Update API status display
 */
function updateAPIStatus(status, text) {
  elements.apiStatus.className = `status-indicator ${status}`;
  elements.apiStatus.querySelector('.status-text').textContent = text;
}

/**
 * Handle question submission
 */
async function handleAsk() {
  const question = elements.questionInput.value.trim();
  
  if (!question) {
    showError('Please enter a question');
    return;
  }

    // Show loading state
  showLoading();

  try {
    console.log('[Popup] Asking:', question);

    // Call Hybrid API
    const result = await promptAPI.queryHybrid(question, '');
    
    console.log('[Popup] Got answer:', result);

    // Save current answer
    currentAnswer = result;

    // Display answer
    displayAnswer(result);

    // Save to history
    await storage.saveQAHistory(question, result.answer, {
      mode: result.mode,
      source: result.source,
      latency: result.latency
    });

  } catch (error) {
    console.error('[Popup] Ask failed:', error);
    showError('Failed to get answer. Please try again.');
  }
}

/**
 * Handle translation
 */
async function handleTranslate() {
  const text = elements.questionInput.value.trim();
  
  if (!text) {
    return;
  }

  try {
    elements.translateButton.disabled = true;
    elements.translateButton.textContent = '🔄';

    const result = await translatorAPI.autoTranslate(text, 'en');

    if (result.success && !result.sameLanguage) {
      elements.questionInput.value = result.translatedText;
      
      // Show toast
      showToast(`Translated from ${result.sourceLanguage.toUpperCase()} to ${result.targetLanguage.toUpperCase()}`);
    } else if (result.sameLanguage) {
      showToast('Already in target language');
    } else {
      showToast('Translation not available');
    }

  } catch (error) {
    console.error('[Popup] Translation failed:', error);
    showToast('Translation failed');
  } finally {
    elements.translateButton.disabled = false;
    elements.translateButton.innerHTML = '<span class="btn-icon">🌐</span>';
  }
}

/**
 * Handle summarization
 */
async function handleSummarize() {
  if (!currentAnswer || !currentAnswer.answer) {
    return;
  }

  try {
    elements.summarizeButton.disabled = true;
    elements.summarizeButton.textContent = '⏳ Summarizing...';

    const result = await summarizerAPI.extractKeyPoints(currentAnswer.answer);
    
    // Display summarized content
    displayAnswer({
      ...currentAnswer,
      answer: result.summary,
      summarized: true
    });

    showToast('Answer summarized');

  } catch (error) {
    console.error('[Popup] Summarization failed:', error);
    showToast('Summarization not available');
  } finally {
    elements.summarizeButton.disabled = false;
    elements.summarizeButton.innerHTML = '<span class="btn-icon">📝</span> Summarize';
  }
}

/**
 * Handle save to notes
 */
async function handleSave() {
  if (!currentAnswer) {
    return;
  }

  try {
    const question = elements.questionInput.value.trim();
    
    await storage.saveNote({
      type: 'qa',
      question: question,
      answer: currentAnswer.answer,
      source: currentAnswer.source,
      mode: currentAnswer.mode
    });

    showToast('✅ Saved to notes');

  } catch (error) {
    console.error('[Popup] Save failed:', error);
    showToast('❌ Save failed');
  }
}

/**
 * Handle copy to clipboard
 */
async function handleCopy() {
  if (!currentAnswer) {
    return;
  }

  try {
    const question = elements.questionInput.value.trim();
    const text = `Question: ${question}\n\nAnswer:\n${currentAnswer.answer}`;
    
    await navigator.clipboard.writeText(text);
    showToast('✅ Copied to clipboard');

  } catch (error) {
    console.error('[Popup] Copy failed:', error);
    showToast('❌ Copy failed');
  }
}

/**
 * Display answer
 */
function displayAnswer(result) {
  // Hide other states
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.add('hidden');

  // Show answer section
  elements.answerSection.classList.remove('hidden');

  // Set answer content
  elements.answerContent.innerHTML = formatAnswer(result.answer);

  // Set mode badge
  if (result.mode === 'local') {
    elements.aiMode.className = 'badge local';
    elements.aiMode.textContent = '🔒 Local AI';
  } else {
    elements.aiMode.className = 'badge cloud';
    elements.aiMode.textContent = '☁️ Cloud API';
  }

  // Set latency
  if (result.latency) {
    elements.latency.textContent = `${result.latency}ms`;
  }
}

/**
 * Format answer text (simple Markdown to HTML)
 */
function formatAnswer(text) {
  let formatted = text
    // Paragraphs
    .split('\n\n').map(p => `<p>${p}</p>`).join('')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // List items
    .replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap lists
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  return formatted;
}

/**
 * Show loading state
 */
function showLoading() {
  elements.answerSection.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.loadingState.classList.remove('hidden');
  elements.askButton.disabled = true;
}

/**
 * Show error state
 */
function showError(message) {
  elements.answerSection.classList.add('hidden');
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.remove('hidden');
  elements.errorMessage.textContent = message;
  elements.askButton.disabled = false;
}

/**
 * Show toast message
 */
function showToast(message) {
  console.log(`[Toast] ${message}`);
  
  // Temporarily show in status bar
  const originalText = elements.apiStatus.querySelector('.status-text').textContent;
  elements.apiStatus.querySelector('.status-text').textContent = message;
  
  setTimeout(() => {
    elements.apiStatus.querySelector('.status-text').textContent = originalText;
  }, 2000);
}

/**
 * Show history panel
 */
async function showHistory() {
  try {
    const history = await storage.getQAHistory(20);
    
    if (history.length === 0) {
      elements.historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No history yet</p>';
    } else {
      elements.historyList.innerHTML = history.map(item => `
        <div class="history-item" data-question="${escapeHtml(item.question)}">
          <div class="history-item-question">${escapeHtml(item.question)}</div>
          <div class="history-item-time">${formatTime(item.timestamp)}</div>
        </div>
      `).join('');

      // Bind click events
      elements.historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
          const question = item.dataset.question;
          elements.questionInput.value = question;
          hideHistory();
        });
      });
    }

    elements.historyPanel.classList.remove('hidden');

  } catch (error) {
    console.error('[Popup] Show history failed:', error);
  }
}

/**
 * Hide history panel
 */
function hideHistory() {
  elements.historyPanel.classList.add('hidden');
}

/**
 * Open Web App
 */
function openWebApp() {
  chrome.tabs.create({ url: 'http://localhost:5000' });
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
 * Format timestamp
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} min ago`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} hours ago`;
  } else {
    return date.toLocaleDateString();
  }
}

