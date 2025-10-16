/**
 * Main Application Entry Point
 * Coordinates initialization of all modules
 */
import { log } from './utils.js';
import { initQA } from './qa.js';
import { initCategories } from './category.js';
import { initFeatures } from './features.js';

document.addEventListener('DOMContentLoaded', function() {
    log('App', '🚀 LicensePrep application starting...');
    
    try {
        initQA(); // Q&A module
    } catch (error) {
        console.error('[App] Error initializing Q&A module:', error);
    }

    try {
        initCategories(); // Categories module
    } catch (error) {
        console.error('[App] Error initializing category module:', error);
    }

    try {
        initFeatures(); // Features module (route recording, notes, etc.)
    } catch (error) {
        console.error('[App] Error initializing features module:', error);
    }

    log('App', '✅ Application initialized successfully');
});

// Debug utility
window.LicensePrep = {
    version: '1.0.0',
    debug: {
        clearVisited: () => {
            import('./category.js').then(module => {
                module.clearVisitedState();
                console.log('✅ Cleared all visited state');
            });
        }
    }
};

log('App', 'LicensePrep global object available in console: window.LicensePrep');
