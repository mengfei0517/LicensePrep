/**
 * Category Module - Handles knowledge category cards and subcategories
 */
import { log } from './utils.js';

export function initCategories() {
  log('Category', 'Initializing category module...');

  const categoryCards = document.querySelectorAll('.category-card');
  if (categoryCards.length === 0) {
    log('Category', 'No category cards found on this page. Skipping initialization.');
    return;
  }

  categoryCards.forEach(card => {
    // Handle click on the main category card area
    card.addEventListener('click', function (e) {
      // Prevent the click event from the subcategory card from triggering the parent category collapse/expand
      if (e.target.closest('.subcategory-card')) {
        e.stopPropagation();
        return;
      }

      const id = this.dataset.categoryId || 'unknown';

      if (this.classList.contains('expanded')) {
        this.classList.remove('expanded');
        log('Category', `Category ${id} collapsed`);
      } else {
        // Close other expanded categories for single expansion mode
        document.querySelectorAll('.category-card.expanded').forEach(c => {
          c.classList.remove('expanded');
          log('Category', `Category ${c.dataset.categoryId || 'unknown'} collapsed`);
        });
        this.classList.add('expanded');
        log('Category', `Category ${id} expanded`);
      }
    });
  });

  log('Category', `Registered ${categoryCards.length} category cards`);

  // Subcategory click handler: handles navigation or in-card detail expansion
  const subcategoryCards = document.querySelectorAll('.subcategory-card');
  subcategoryCards.forEach(card => {
    card.addEventListener('click', function (e) {
      e.stopPropagation(); // Prevent event from bubbling up to the category card

      // Mark as visited (for UI persistence)
      const sid = this.dataset.subcategoryId;
      if (sid) {
        this.classList.add('visited');
        localStorage.setItem(`visited-${sid}`, 'true');
        log('Category', `Marked subcategory ${sid} as visited`);
      }

      // Check for in-card expansion details element
      const details = this.querySelector('.subcategory-details');
      if (details) {
        // Logic for in-card detail expansion
        details.classList.toggle('hidden');
        this.classList.toggle('expanded');
        log('Category', `Subcategory ${sid} toggled in-card expansion.`);
      } else {
        // Fallback to page navigation: /subcategory/<category>/<subcategory>
        const categoryCard = this.closest('.category-card');
        const categoryId = categoryCard ? categoryCard.dataset.categoryId : null;
        const subcategoryId = this.dataset.subcategoryId;

        if (categoryId && subcategoryId) {
          log('Category', `Navigating to subcategory ${categoryId}/${subcategoryId}`);
          window.location.href = `/subcategory/${categoryId}/${subcategoryId}`;
        } else {
          log('Category', 'Error: Could not determine category or subcategory ID for navigation.');
        }
      }
    });
  });

  restoreVisitedState();
  log('Category', 'Category module initialized successfully');
}

/**
 * Restores the 'visited' class based on localStorage state.
 */
function restoreVisitedState() {
  const subcategoryCards = document.querySelectorAll('.subcategory-card');
  let restored = 0;
  subcategoryCards.forEach(card => {
    const id = card.dataset.subcategoryId;
    if (id && localStorage.getItem(`visited-${id}`) === 'true') {
      card.classList.add('visited');
      restored++;
    }
  });
  if (restored) log('Category', `Restored ${restored} visited subcategories`);
}

/**
 * Clears all visited state from localStorage and the DOM.
 */
export function clearVisitedState() {
  document.querySelectorAll('.subcategory-card').forEach(card => {
    const id = card.dataset.subcategoryId;
    if (id) localStorage.removeItem(`visited-${id}`);
    card.classList.remove('visited');
  });
  log('Category', 'Cleared all visited state');
}