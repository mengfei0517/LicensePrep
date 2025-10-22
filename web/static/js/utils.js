/**
 * Utility functions shared across modules
 */

/**
 * Show a loading spinner in a container
 * @param {HTMLElement} container - The container element
 */
export function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
        </div>
    `;
}

/**
 * Show an error message
 * @param {HTMLElement} container - The container element
 * @param {string} message - The error message
 */
export function showError(container, message) {
    // Convert \n to <br> for proper line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    container.innerHTML = `<div class="error-message">${formattedMessage}</div>`;
}

/**
 * Log with timestamp (development helper)
 * @param {string} module - Module name
 * @param {string} message - Log message
 */
export function log(module, message) {
    console.log(`[${module}] ${message}`);
}

/**
 * Smooth fade-in animation
 * @param {HTMLElement} element - Element to animate
 */
export function fadeIn(element) {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

/**
 * Display structured JSON answer in the answer container
 * @param {HTMLElement} container - The container element
 * @param {Object} jsonAnswer - The structured JSON answer
 * @param {boolean} isOffline - Whether this is offline mode (no context)
 */
export function displayStructuredAnswer(container, jsonAnswer, isOffline = false) {
    const offlineBadge = isOffline 
        ? '<span class="offline-badge">⚠️ Offline Mode (No Knowledge Base Context)</span>' 
        : '';
    
    let html = `
        <div class="structured-answer">
            ${offlineBadge}
            <div class="answer-section">
                <h3>📋 Answer</h3>
                <p>${jsonAnswer.answer || 'No answer provided'}</p>
            </div>
    `;
    
    if (jsonAnswer.explanation) {
        html += `
            <div class="answer-section">
                <h3>💡 Explanation</h3>
                <p>${jsonAnswer.explanation}</p>
            </div>
        `;
    }
    
    if (jsonAnswer.examples && jsonAnswer.examples.length > 0) {
        html += `
            <div class="answer-section">
                <h3>📝 Examples</h3>
                <ul>
                    ${jsonAnswer.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (jsonAnswer.related_topics && jsonAnswer.related_topics.length > 0) {
        html += `
            <div class="answer-section">
                <h3>🔗 Related Topics</h3>
                <ul>
                    ${jsonAnswer.related_topics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    fadeIn(container);
}
