/**
 * Search Component
 * Displays search bar with autocomplete functionality
 * @module components/search
 */

/**
 * @typedef {Object} SearchConfig
 * @property {string} [placeholder] - Search input placeholder
 * @property {Function} [onSearch] - Search callback
 * @property {Function} [onInput] - Input callback for autocomplete
 * @property {number} [debounceDelay] - Debounce delay in ms
 * @property {boolean} [showButton] - Show search button
 * @property {boolean} [clearable] - Show clear button
 * @property {string} [size] - Size: 'small', 'medium', 'large'
 * @property {string} [initialValue] - Initial search value
 */

/**
 * Renders search component
 * @param {SearchConfig} config - Search configuration
 * @returns {HTMLElement} Search element
 */
export function render(config = {}) {
  const {
    placeholder = 'Search...',
    onSearch = null,
    onInput = null,
    debounceDelay = 300,
    showButton = true,
    clearable = true,
    size = 'medium',
    initialValue = ''
  } = config;

  const search = document.createElement('div');
  search.className = `search-container search-${size}`;
  search.innerHTML = `
    <div class="search-input-wrapper">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input type="text" 
             class="search-input" 
             placeholder="${placeholder}"
             value="${initialValue}"
             autocomplete="off">
      ${clearable ? `
        <button class="search-clear hidden" aria-label="Clear search" data-action="clear">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ` : ''}
    </div>
    ${showButton ? `
      <button class="search-button" data-action="search">
        Search
      </button>
    ` : ''}
    <div class="search-results hidden"></div>
  `;

  const input = search.querySelector('.search-input');
  const clearBtn = search.querySelector('[data-action="clear"]');
  const searchBtn = search.querySelector('[data-action="search"]');
  const resultsContainer = search.querySelector('.search-results');

  let debounceTimer = null;

  // Toggle clear button visibility
  const toggleClearButton = () => {
    if (clearable && clearBtn) {
      if (input.value.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  };

  // Handle search
  const performSearch = () => {
    const value = input.value.trim();
    if (onSearch && value) {
      onSearch(value);
    }
  };

  // Input event with debounce
  input.addEventListener('input', (e) => {
    toggleClearButton();

    if (onInput) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onInput(e.target.value);
      }, debounceDelay);
    }
  });

  // Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Search button
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      toggleClearButton();
      hideResults(search);
      if (onSearch) onSearch('');
    });
  }

  // Click outside to close results
  document.addEventListener('click', (e) => {
    if (!search.contains(e.target)) {
      hideResults(search);
    }
  });

  toggleClearButton();

  return search;
}

/**
 * Shows autocomplete results
 * @param {HTMLElement} search - Search element
 * @param {Array<{label: string, value: any, description?: string}>} results - Search results
 * @param {Function} onSelect - Result select callback
 */
export function showResults(search, results, onSelect) {
  const resultsContainer = search.querySelector('.search-results');
  if (!resultsContainer) return;

  if (!results || results.length === 0) {
    hideResults(search);
    return;
  }

  resultsContainer.innerHTML = results.map((result, idx) => `
    <div class="search-result-item" data-index="${idx}">
      <div class="result-label">${highlightMatch(result.label, search.querySelector('.search-input').value)}</div>
      ${result.description ? `<div class="result-description">${result.description}</div>` : ''}
    </div>
  `).join('');

  resultsContainer.classList.remove('hidden');

  // Add click handlers
  resultsContainer.querySelectorAll('.search-result-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      if (onSelect) {
        onSelect(results[idx]);
      }
      search.querySelector('.search-input').value = results[idx].label;
      hideResults(search);
    });
  });

  // Keyboard navigation
  const input = search.querySelector('.search-input');
  let selectedIndex = -1;

  const keyHandler = (e) => {
    const items = resultsContainer.querySelectorAll('.search-result-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection(items, selectedIndex);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else if (e.key === 'Escape') {
      hideResults(search);
    }
  };

  input.removeEventListener('keydown', keyHandler);
  input.addEventListener('keydown', keyHandler);
}

/**
 * Hides autocomplete results
 * @param {HTMLElement} search - Search element
 */
export function hideResults(search) {
  const resultsContainer = search.querySelector('.search-results');
  if (resultsContainer) {
    resultsContainer.classList.add('hidden');
  }
}

/**
 * Updates selected result in list
 * @param {NodeList} items - Result items
 * @param {number} selectedIndex - Selected index
 */
function updateSelection(items, selectedIndex) {
  items.forEach((item, idx) => {
    if (idx === selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

/**
 * Highlights matching text in result
 * @param {string} text - Result text
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted text
 */
function highlightMatch(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Gets search value
 * @param {HTMLElement} search - Search element
 * @returns {string} Current search value
 */
export function getValue(search) {
  const input = search.querySelector('.search-input');
  return input ? input.value : '';
}

/**
 * Sets search value
 * @param {HTMLElement} search - Search element
 * @param {string} value - New search value
 */
export function setValue(search, value) {
  const input = search.querySelector('.search-input');
  if (input) {
    input.value = value;
    const clearBtn = search.querySelector('[data-action="clear"]');
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !value);
    }
  }
}

/**
 * Clears search
 * @param {HTMLElement} search - Search element
 */
export function clear(search) {
  setValue(search, '');
  hideResults(search);
}
