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
    container.innerHTML = `<p class="error">❌ ${message}</p>`;
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
