/**
 * Features Module
 * Handles new feature interactions: route recording, data review, route simulation, and notes
 */
import { log } from './utils.js';

/**
 * Initialize all feature modules
 */
export function initFeatures() {
    log('Features', 'Initializing features module...');
    
    initRouteRecording();
    initDataReview();
    initRouteSimulator();
    initPersonalNotes();
    
    log('Features', 'Features module initialized successfully');
}

/**
 * Route Recording Feature
 */
function initRouteRecording() {
    const startRecordingBtn = document.getElementById('start-recording');
    const recentRoutesContainer = document.getElementById('recent-routes');
    
    if (!startRecordingBtn) return;
    
    startRecordingBtn.addEventListener('click', function() {
        log('RouteRecord', 'Starting route recording...');
        
        // Simulate starting recording
        this.textContent = 'Recording...';
        this.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        
        // TODO: Implement actual GPS tracking
        setTimeout(() => {
            this.textContent = 'Stop Recording';
            addRecentRoute();
        }, 1000);
    });
}

/**
 * Add a recent route to the list
 */
function addRecentRoute() {
    const recentRoutesContainer = document.getElementById('recent-routes');
    const emptyState = recentRoutesContainer.querySelector('.empty-state');
    
    if (emptyState) {
        emptyState.remove();
    }
    
    const routeItem = document.createElement('div');
    routeItem.className = 'route-item';
    routeItem.innerHTML = `
        <div class="route-info">
            <div class="route-name">Route ${Date.now()}</div>
            <div class="route-meta">
                <span>📍 ${new Date().toLocaleDateString()}</span>
                <span>⏱️ ${Math.floor(Math.random() * 30 + 10)} min</span>
            </div>
        </div>
        <button class="route-action-btn" onclick="viewRoute(this)">View</button>
    `;
    
    recentRoutesContainer.insertBefore(routeItem, recentRoutesContainer.firstChild);
    log('RouteRecord', 'Route added to recent list');
}

/**
 * Recorded Data Review Feature
 */
function initDataReview() {
    const viewHistoryBtn = document.getElementById('view-history');
    
    if (!viewHistoryBtn) return;
    
    viewHistoryBtn.addEventListener('click', function() {
        log('DataReview', 'Opening data history...');
        
        // TODO: Open modal or new page with recorded data
        alert('Data review feature coming soon! This will show all your recorded driving sessions.');
    });
}

/**
 * Route Simulator Feature
 */
function initRouteSimulator() {
    const simulatorForm = document.getElementById('route-simulator');
    
    if (!simulatorForm) return;
    
    simulatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const startPos = document.getElementById('start-pos').value;
        const endPos = document.getElementById('end-pos').value;
        
        if (!startPos || !endPos) {
            alert('Please enter both start and end positions');
            return;
        }
        
        log('RouteSimulator', `Simulating route from ${startPos} to ${endPos}`);
        
        const resultContainer = document.getElementById('simulation-result');
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = `
            <h4 style="margin-top: 0; color: #667eea;">🗺️ Route Simulation</h4>
            <p><strong>From:</strong> ${startPos}</p>
            <p><strong>To:</strong> ${endPos}</p>
            <p><strong>Estimated Duration:</strong> ${Math.floor(Math.random() * 20 + 15)} minutes</p>
            <p><strong>Key Points:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>2 traffic light intersections</li>
                <li>1 roundabout</li>
                <li>Highway merge practice</li>
                <li>30 zone navigation</li>
            </ul>
            <button class="feature-button" style="margin-top: 10px;" onclick="startSimulation()">
                Start Simulation →
            </button>
        `;
    });
}

/**
 * Personal Notes Feature
 */
function initPersonalNotes() {
    const noteCategories = document.querySelectorAll('.note-category');
    const addNoteBtn = document.getElementById('add-note');
    
    // Category click handler
    noteCategories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryType = this.dataset.category;
            log('PersonalNotes', `Opening ${categoryType} notes`);
            
            // TODO: Open modal to show notes in this category
            alert(`${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} notes will be displayed here.`);
        });
    });
    
    // Add note button handler
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', function() {
            log('PersonalNotes', 'Adding new note...');
            
            const noteContent = prompt('Enter your driving note:');
            if (noteContent) {
                // TODO: Save note to backend
                const category = prompt('Category (mistakes/tips/practice/exam):') || 'tips';
                incrementNoteCount(category);
                log('PersonalNotes', `Note added to ${category}`);
            }
        });
    }
}

/**
 * Increment note count for a category
 */
function incrementNoteCount(categoryType) {
    const category = document.querySelector(`.note-category[data-category="${categoryType}"]`);
    if (category) {
        const countElement = category.querySelector('.note-count');
        const currentCount = parseInt(countElement.textContent) || 0;
        countElement.textContent = currentCount + 1;
    }
}

// Global functions for inline onclick handlers
window.viewRoute = function(button) {
    const routeItem = button.closest('.route-item');
    const routeName = routeItem.querySelector('.route-name').textContent;
    log('RouteRecord', `Viewing route: ${routeName}`);
    alert(`Viewing details for ${routeName}.\n\nThis will show:\n- GPS tracking data\n- Speed analysis\n- Mistakes identified\n- Practice points`);
};

window.startSimulation = function() {
    log('RouteSimulator', 'Starting route simulation...');
    alert('Starting interactive route simulation...\n\nThis feature will:\n- Show the route on a map\n- Highlight key decision points\n- Test your knowledge at intersections\n- Provide real-time feedback');
};

