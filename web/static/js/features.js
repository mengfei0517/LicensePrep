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
    initKnowledgeHub();
    
    log('Features', 'Features module initialized successfully');
}

/**
 * Route Recording Feature
 */
function initRouteRecording() {
    const startRecordingBtn = document.getElementById('start-recording');
    const recentRoutesContainer = document.getElementById('recent-routes');
    
    if (!startRecordingBtn) return;
    
    // Load recent routes on initialization
    loadRecentRoutes();
    
    // Open route recorder in new window
    startRecordingBtn.addEventListener('click', function() {
        log('RouteRecord', 'Opening route recorder...');
        
        // Open in new window/tab
        const width = 1200;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        window.open(
            '/route-recorder',
            'RouteRecorder',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );
    });
    
    // Listen for storage changes (when new route is saved)
    window.addEventListener('storage', function(e) {
        if (e.key === 'recordedRoutes') {
            loadRecentRoutes();
        }
    });
    
    // Also refresh routes when window gets focus
    window.addEventListener('focus', function() {
        loadRecentRoutes();
    });
}

/**
 * Load recent routes from localStorage
 */
window.loadRecentRoutes = function() {
    const recentRoutesContainer = document.getElementById('recent-routes');
    const storageInfo = document.getElementById('storage-info');
    const storageText = document.getElementById('storage-text');
    
    if (!recentRoutesContainer) return;
    
    const routes = JSON.parse(localStorage.getItem('recordedRoutes') || '[]');
    
    // Update storage info
    if (storageInfo && storageText) {
        if (routes.length > 0) {
            storageInfo.style.display = 'block';
            
            // Calculate approximate storage size
            const storageSize = new Blob([JSON.stringify(routes)]).size;
            const sizeMB = (storageSize / 1024 / 1024).toFixed(2);
            storageText.textContent = `Storage: ${routes.length} route${routes.length > 1 ? 's' : ''} (~${sizeMB}MB)`;
        } else {
            storageInfo.style.display = 'none';
        }
    }
    
    if (routes.length === 0) {
        recentRoutesContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🚗</span>
                <p>No recent routes recorded yet</p>
                <button class="feature-button" id="start-recording">Start Recording</button>
            </div>
        `;
        // Re-attach event listener
        const btn = document.getElementById('start-recording');
        if (btn) {
            btn.addEventListener('click', function() {
                window.open('/route-recorder', 'RouteRecorder', 'width=1200,height=800');
            });
        }
        return;
    }
    
    // Display recent routes (limit to 5 most recent)
    recentRoutesContainer.innerHTML = '';
    
    // Add "Start New Recording" button at the top
    const newRecordingBtn = document.createElement('button');
    newRecordingBtn.className = 'feature-button';
    newRecordingBtn.id = 'start-recording-top';
    newRecordingBtn.style.width = '100%';
    newRecordingBtn.style.marginBottom = '15px';
    newRecordingBtn.innerHTML = '▶️ Start New Recording';
    newRecordingBtn.addEventListener('click', function() {
        window.open('/route-recorder', 'RouteRecorder', 'width=1200,height=800');
    });
    recentRoutesContainer.appendChild(newRecordingBtn);
    
    // Display routes
    routes.slice(0, 5).forEach(route => {
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item';
        routeItem.innerHTML = `
            <div class="route-preview" style="cursor: pointer;">
                <img src="${route.image}" alt="Route preview" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 15px;">
            </div>
            <div class="route-info">
                <div class="route-name">${route.name}</div>
                <div class="route-meta">
                    <span>📍 ${new Date(route.date).toLocaleDateString()}</span>
                    <span>⏱️ ${route.duration}</span>
                    <span>📏 ${route.distance} km</span>
                </div>
            </div>
            <button class="route-action-btn" onclick="viewRouteDetails('${route.id}')">View</button>
        `;
        recentRoutesContainer.appendChild(routeItem);
    });
}

// Removed old addRecentRoute function - now using loadRecentRoutes

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
 * Knowledge Hub Feature
 */
function initKnowledgeHub() {
    const openBtn = document.getElementById('open-knowledge-hub');
    const closeBtn = document.getElementById('close-knowledge-hub');
    const overlay = document.getElementById('knowledge-hub-overlay');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Open Knowledge Hub
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            log('KnowledgeHub', 'Opening Knowledge Hub...');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }
    
    // Close Knowledge Hub
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            log('KnowledgeHub', 'Closing Knowledge Hub...');
            overlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close on overlay click (outside modal)
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeBtn.click();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
                closeBtn.click();
            }
        });
    }
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            log('KnowledgeHub', `Switching to ${tabName} tab`);
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Initialize notes functionality in the hub
    initNotesInHub();
}

/**
 * Initialize notes functionality within the Knowledge Hub
 */
function initNotesInHub() {
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
                addNoteToList(noteContent, category);
                log('PersonalNotes', `Note added to ${category}`);
            }
        });
    }
}

/**
 * Add note to the notes list
 */
function addNoteToList(content, category) {
    const notesList = document.querySelector('.notes-list');
    const emptyMessage = notesList.querySelector('.empty-notes-message');
    
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        <div class="note-header">
            <span class="note-category-badge">${getCategoryEmoji(category)}</span>
            <span class="note-date">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="note-content">${content}</div>
    `;
    
    notesList.insertBefore(noteItem, notesList.firstChild);
}

/**
 * Get emoji for note category
 */
function getCategoryEmoji(category) {
    const emojis = {
        mistakes: '❌',
        tips: '💡',
        practice: '🎯',
        exam: '📋'
    };
    return emojis[category] || '📝';
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
window.viewRouteDetails = function(routeId) {
    const routes = JSON.parse(localStorage.getItem('recordedRoutes') || '[]');
    const route = routes.find(r => r.id == routeId);
    
    if (!route) {
        alert('Route not found!');
        return;
    }
    
    log('RouteRecord', `Viewing route: ${route.name}`);
    
    // Create modal to show route details
    const modal = document.createElement('div');
    modal.className = 'route-detail-modal';
    modal.innerHTML = `
        <div class="route-detail-container">
            <div class="route-detail-header">
                <h2>📍 ${route.name}</h2>
                <button class="close-route-detail" onclick="this.closest('.route-detail-modal').remove()">✕</button>
            </div>
            <div class="route-detail-content">
                <div class="route-detail-image">
                    <img src="${route.image}" alt="Route map" style="width: 100%; border-radius: 10px;">
                </div>
                <div class="route-detail-info">
                    <div class="detail-item">
                        <strong>📅 Date:</strong> ${new Date(route.date).toLocaleString()}
                    </div>
                    <div class="detail-item">
                        <strong>⏱️ Duration:</strong> ${route.duration}
                    </div>
                    <div class="detail-item">
                        <strong>📏 Distance:</strong> ${route.distance} km
                    </div>
                    <div class="detail-item">
                        <strong>📊 Points Recorded:</strong> ${route.points.length}
                    </div>
                    <div class="detail-item">
                        <strong>🗺️ Start Location:</strong> ${route.startLocation}
                    </div>
                    <div class="detail-item">
                        <strong>🏁 End Location:</strong> ${route.endLocation}
                    </div>
                    <div class="detail-item">
                        <strong>🎙️ Voice Notes:</strong> ${route.voiceNotes && route.voiceNotes.length > 0 ? route.voiceNotes.length : '0'}
                    </div>
                </div>
                ${route.voiceNotes && Array.isArray(route.voiceNotes) && route.voiceNotes.length > 0 ? `
                <div class="route-voice-notes" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <h4 style="margin: 0 0 15px 0; color: #495057;">🎙️ Voice Notes</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${route.voiceNotes.map((note, index) => {
                            const timeStr = formatNoteTimestamp(note.timestamp || 0);
                            const locationStr = (note.location && note.location.lat && note.location.lng) 
                                ? `📍 ${note.location.lat.toFixed(6)}, ${note.location.lng.toFixed(6)}` 
                                : '📍 No GPS location';
                            return `
                            <div style="background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #667eea;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">
                                    🎤 Note #${index + 1} - ${timeStr}
                                </div>
                                <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 8px;">
                                    ${locationStr}
                                </div>
                                <button class="voice-action-btn" onclick="playRouteVoiceNote('${routeId}', '${note.id}')" 
                                        style="background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85em;">
                                    ▶️ Play
                                </button>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                <div class="route-actions">
                    <button class="feature-button" onclick="downloadRouteData('${routeId}')">
                        📥 Download GPS Data
                    </button>
                    <button class="feature-button" onclick="deleteRoute('${routeId}')">
                        🗑️ Delete Route
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
};

window.downloadRouteData = function(routeId) {
    const routes = JSON.parse(localStorage.getItem('recordedRoutes') || '[]');
    const route = routes.find(r => r.id == routeId);
    
    if (!route) return;
    
    const dataStr = JSON.stringify(route.points, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route_${routeId}_gps_data.json`;
    link.click();
    URL.revokeObjectURL(url);
};

window.deleteRoute = function(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    let routes = JSON.parse(localStorage.getItem('recordedRoutes') || '[]');
    routes = routes.filter(r => r.id != routeId);
    localStorage.setItem('recordedRoutes', JSON.stringify(routes));
    
    // Close modal and refresh
    document.querySelector('.route-detail-modal')?.remove();
    document.body.style.overflow = '';
    loadRecentRoutes();
};

// Helper function to format voice note timestamp
function formatNoteTimestamp(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Play voice note from saved route
window.playRouteVoiceNote = function(routeId, noteId) {
    const routes = JSON.parse(localStorage.getItem('recordedRoutes') || '[]');
    const route = routes.find(r => r.id == routeId);
    
    if (!route || !route.voiceNotes) return;
    
    const note = route.voiceNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const audio = new Audio(note.audioData);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play voice note');
    });
};

window.startSimulation = function() {
    log('RouteSimulator', 'Starting route simulation...');
    alert('Starting interactive route simulation...\n\nThis feature will:\n- Show the route on a map\n- Highlight key decision points\n- Test your knowledge at intersections\n- Provide real-time feedback');
};

window.clearAllRoutes = function() {
    if (!confirm('Are you sure you want to delete ALL recorded routes?\n\nThis action cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('recordedRoutes');
    log('RouteRecord', 'All routes cleared');
    alert('All routes have been deleted.');
    
    // Refresh the display
    loadRecentRoutes();
};

