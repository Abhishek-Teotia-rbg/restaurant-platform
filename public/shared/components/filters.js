/**
 * Filters Component
 * Displays filter sidebar with various filter types
 * @module components/filters
 */

/**
 * @typedef {Object} FilterOption
 * @property {string} label - Option label
 * @property {string|number} value - Option value
 * @property {number} [count] - Item count for this option
 */

/**
 * @typedef {Object} FilterGroup
 * @property {string} id - Filter group ID
 * @property {string} label - Filter group label
 * @property {'checkbox'|'radio'|'range'|'select'} type - Filter type
 * @property {Array<FilterOption>} [options] - Filter options (for checkbox/radio/select)
 * @property {Object} [range] - Range values (for range type)
 * @property {number} [range.min] - Minimum value
 * @property {number} [range.max] - Maximum value
 * @property {number} [range.step] - Step value
 * @property {boolean} [collapsible] - Whether group is collapsible
 * @property {boolean} [collapsed] - Initial collapsed state
 */

/**
 * @typedef {Object} FiltersConfig
 * @property {Array<FilterGroup>} groups - Filter groups
 * @property {Function} [onChange] - Change callback with selected filters
 * @property {boolean} [showApply] - Show apply button
 * @property {boolean} [showClear] - Show clear all button
 * @property {Object} [initialValues] - Initial filter values
 */

/**
 * Renders filters component
 * @param {FiltersConfig} config - Filters configuration
 * @returns {HTMLElement} Filters element
 */
export function render(config = {}) {
  const {
    groups = [],
    onChange = null,
    showApply = false,
    showClear = true,
    initialValues = {}
  } = config;

  const filters = document.createElement('div');
  filters.className = 'filters-container';

  const selectedFilters = { ...initialValues };

  filters.innerHTML = `
    <div class="filters-header">
      <h3 class="filters-title">Filters</h3>
      ${showClear ? `
        <button class="filters-clear" data-action="clear">Clear all</button>
      ` : ''}
    </div>
    
    <div class="filters-groups">
      ${groups.map(group => renderFilterGroup(group, selectedFilters)).join('')}
    </div>
    
    ${showApply ? `
      <div class="filters-footer">
        <button class="btn btn-primary btn-block" data-action="apply">Apply Filters</button>
      </div>
    ` : ''}
  `;

  // Handle filter changes
  const handleChange = () => {
    if (onChange && !showApply) {
      onChange(selectedFilters);
    }
  };

  // Checkbox/Radio handlers
  filters.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const groupId = e.target.name;
      const value = e.target.value;

      if (e.target.type === 'checkbox') {
        if (!selectedFilters[groupId]) {
          selectedFilters[groupId] = [];
        }
        
        if (e.target.checked) {
          if (!selectedFilters[groupId].includes(value)) {
            selectedFilters[groupId].push(value);
          }
        } else {
          selectedFilters[groupId] = selectedFilters[groupId].filter(v => v !== value);
        }
      } else {
        selectedFilters[groupId] = value;
      }

      updateSelectedCount(filters);
      handleChange();
    });
  });

  // Range handlers
  filters.querySelectorAll('input[type="range"]').forEach(input => {
    const groupId = input.dataset.groupId;
    const rangeType = input.dataset.rangeType;
    
    input.addEventListener('input', (e) => {
      if (!selectedFilters[groupId]) {
        selectedFilters[groupId] = {};
      }
      selectedFilters[groupId][rangeType] = parseFloat(e.target.value);
      
      // Update display
      const display = input.parentElement.querySelector('.range-value');
      if (display) {
        display.textContent = e.target.value;
      }

      handleChange();
    });
  });

  // Select handlers
  filters.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', (e) => {
      const groupId = e.target.name;
      selectedFilters[groupId] = e.target.value;
      handleChange();
    });
  });

  // Collapsible groups
  filters.querySelectorAll('[data-action="toggle"]').forEach(button => {
    button.addEventListener('click', (e) => {
      const group = e.target.closest('.filter-group');
      group.classList.toggle('collapsed');
    });
  });

  // Clear all
  const clearBtn = filters.querySelector('[data-action="clear"]');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Object.keys(selectedFilters).forEach(key => delete selectedFilters[key]);
      
      // Reset all inputs
      filters.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        input.checked = false;
      });
      
      filters.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
      });

      updateSelectedCount(filters);
      handleChange();
    });
  }

  // Apply button
  const applyBtn = filters.querySelector('[data-action="apply"]');
  if (applyBtn && onChange) {
    applyBtn.addEventListener('click', () => {
      onChange(selectedFilters);
    });
  }

  updateSelectedCount(filters);

  return filters;
}

/**
 * Renders a filter group
 * @param {FilterGroup} group - Filter group
 * @param {Object} selectedFilters - Selected filter values
 * @returns {string} HTML string
 */
function renderFilterGroup(group, selectedFilters) {
  const { id, label, type, options = [], range, collapsible = true, collapsed = false } = group;

  return `
    <div class="filter-group ${collapsed ? 'collapsed' : ''}" data-group-id="${id}">
      <div class="filter-group-header">
        <h4 class="filter-group-title">${label}</h4>
        ${collapsible ? `
          <button class="filter-toggle" data-action="toggle" aria-label="Toggle ${label}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
      
      <div class="filter-group-content">
        ${renderFilterContent(id, type, options, range, selectedFilters)}
      </div>
    </div>
  `;
}

/**
 * Renders filter content based on type
 * @param {string} id - Filter ID
 * @param {string} type - Filter type
 * @param {Array<FilterOption>} options - Filter options
 * @param {Object} range - Range configuration
 * @param {Object} selectedFilters - Selected values
 * @returns {string} HTML string
 */
function renderFilterContent(id, type, options, range, selectedFilters) {
  switch (type) {
    case 'checkbox':
      return options.map(opt => {
        const checked = selectedFilters[id] && selectedFilters[id].includes(opt.value.toString());
        return `
          <label class="filter-option">
            <input type="checkbox" 
                   name="${id}" 
                   value="${opt.value}"
                   ${checked ? 'checked' : ''}>
            <span class="filter-label">
              ${opt.label}
              ${opt.count !== undefined ? `<span class="filter-count">(${opt.count})</span>` : ''}
            </span>
          </label>
        `;
      }).join('');

    case 'radio':
      return options.map(opt => {
        const checked = selectedFilters[id] === opt.value.toString();
        return `
          <label class="filter-option">
            <input type="radio" 
                   name="${id}" 
                   value="${opt.value}"
                   ${checked ? 'checked' : ''}>
            <span class="filter-label">
              ${opt.label}
              ${opt.count !== undefined ? `<span class="filter-count">(${opt.count})</span>` : ''}
            </span>
          </label>
        `;
      }).join('');

    case 'range':
      const minVal = selectedFilters[id]?.min || range.min;
      const maxVal = selectedFilters[id]?.max || range.max;
      return `
        <div class="filter-range">
          <div class="range-input">
            <label>Min: <span class="range-value">${minVal}</span></label>
            <input type="range" 
                   min="${range.min}" 
                   max="${range.max}" 
                   step="${range.step || 1}" 
                   value="${minVal}"
                   data-group-id="${id}"
                   data-range-type="min">
          </div>
          <div class="range-input">
            <label>Max: <span class="range-value">${maxVal}</span></label>
            <input type="range" 
                   min="${range.min}" 
                   max="${range.max}" 
                   step="${range.step || 1}" 
                   value="${maxVal}"
                   data-group-id="${id}"
                   data-range-type="max">
          </div>
        </div>
      `;

    case 'select':
      return `
        <select name="${id}" class="filter-select">
          <option value="">All</option>
          ${options.map(opt => `
            <option value="${opt.value}" ${selectedFilters[id] === opt.value.toString() ? 'selected' : ''}>
              ${opt.label}
            </option>
          `).join('')}
        </select>
      `;

    default:
      return '';
  }
}

/**
 * Updates selected filter count
 * @param {HTMLElement} filters - Filters element
 */
function updateSelectedCount(filters) {
  let count = 0;
  
  filters.querySelectorAll('input[type="checkbox"]:checked').forEach(() => count++);
  filters.querySelectorAll('input[type="radio"]:checked').forEach(() => count++);
  filters.querySelectorAll('select').forEach(select => {
    if (select.value) count++;
  });

  const clearBtn = filters.querySelector('[data-action="clear"]');
  if (clearBtn) {
    clearBtn.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Gets selected filter values
 * @param {HTMLElement} filters - Filters element
 * @returns {Object} Selected filter values
 */
export function getValues(filters) {
  const values = {};

  filters.querySelectorAll('input[type="checkbox"]:checked').forEach(input => {
    if (!values[input.name]) values[input.name] = [];
    values[input.name].push(input.value);
  });

  filters.querySelectorAll('input[type="radio"]:checked').forEach(input => {
    values[input.name] = input.value;
  });

  filters.querySelectorAll('select').forEach(select => {
    if (select.value) values[select.name] = select.value;
  });

  return values;
}

/**
 * Resets all filters
 * @param {HTMLElement} filters - Filters element
 */
export function reset(filters) {
  const clearBtn = filters.querySelector('[data-action="clear"]');
  if (clearBtn) clearBtn.click();
}
