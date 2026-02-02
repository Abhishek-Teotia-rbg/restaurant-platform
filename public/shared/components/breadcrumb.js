/**
 * Breadcrumb Component
 * Displays breadcrumb navigation trail
 * @module components/breadcrumb
 */

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - Item label
 * @property {string} [href] - Item link URL (optional for last item)
 * @property {string} [icon] - Optional icon name
 */

/**
 * @typedef {Object} BreadcrumbConfig
 * @property {Array<BreadcrumbItem>} items - Breadcrumb items
 * @property {string} [separator] - Separator character or icon
 * @property {boolean} [showHome] - Show home icon for first item
 */

/**
 * Renders breadcrumb component
 * @param {BreadcrumbConfig} config - Breadcrumb configuration
 * @returns {HTMLElement} Breadcrumb element
 */
export function render(config = {}) {
  const {
    items = [],
    separator = '/',
    showHome = true
  } = config;

  if (items.length === 0) {
    return document.createElement('div');
  }

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');

  const itemsHTML = items.map((item, index) => {
    const isLast = index === items.length - 1;
    const isFirst = index === 0;

    return `
      <li class="breadcrumb-item ${isLast ? 'active' : ''}">
        ${item.href && !isLast ? `
          <a href="${item.href}" class="breadcrumb-link">
            ${isFirst && showHome ? getHomeIcon() : ''}
            ${item.icon ? getIcon(item.icon) : ''}
            <span>${item.label}</span>
          </a>
        ` : `
          <span class="breadcrumb-text">
            ${isFirst && showHome ? getHomeIcon() : ''}
            ${item.icon ? getIcon(item.icon) : ''}
            ${item.label}
          </span>
        `}
        ${!isLast ? `
          <span class="breadcrumb-separator" aria-hidden="true">${separator}</span>
        ` : ''}
      </li>
    `;
  }).join('');

  breadcrumb.innerHTML = `
    <ol class="breadcrumb-list">
      ${itemsHTML}
    </ol>
  `;

  return breadcrumb;
}

/**
 * Gets home icon SVG
 * @returns {string} SVG string
 */
function getHomeIcon() {
  return `
    <svg class="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `;
}

/**
 * Gets icon SVG by name
 * @param {string} name - Icon name
 * @returns {string} SVG string
 */
function getIcon(name) {
  const icons = {
    folder: '<svg class="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    file: '<svg class="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',
    settings: '<svg class="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m8.66-15.66-4.24 4.24m-4.84 4.84-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66-4.24-4.24m-4.84-4.84-4.24-4.24"></path></svg>',
    user: '<svg class="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
  };
  
  return icons[name] || '';
}

/**
 * Creates breadcrumb from URL path
 * @param {string} path - URL path
 * @param {Object} [options] - Additional options
 * @returns {HTMLElement} Breadcrumb element
 */
export function fromPath(path, options = {}) {
  const segments = path.split('/').filter(Boolean);
  
  const items = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { label, href };
  });

  // Add home
  items.unshift({ label: 'Home', href: '/' });

  return render({ ...options, items });
}

/**
 * Updates breadcrumb items
 * @param {HTMLElement} breadcrumb - Breadcrumb element
 * @param {Array<BreadcrumbItem>} items - New items
 */
export function update(breadcrumb, items) {
  const newBreadcrumb = render({ items });
  breadcrumb.replaceWith(newBreadcrumb);
  return newBreadcrumb;
}
