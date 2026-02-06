/**
 * Empty State Component
 * Displays empty state with icon, message, and action
 * @module components/empty-state
 */

/**
 * @typedef {Object} EmptyStateConfig
 * @property {string} [icon] - Icon name or custom SVG
 * @property {string} [title] - Empty state title
 * @property {string} [message] - Empty state message
 * @property {Object} [action] - Action button configuration
 * @property {string} [action.label] - Button label
 * @property {Function} [action.onClick] - Button click handler
 * @property {string} [action.href] - Button link URL
 * @property {string} [illustration] - Custom illustration URL
 * @property {string} [size] - Size: 'small', 'medium', 'large'
 */

/**
 * Renders empty state component
 * @param {EmptyStateConfig} config - Empty state configuration
 * @returns {HTMLElement} Empty state element
 */
export function render(config = {}) {
  const {
    icon = 'box',
    title = 'No items found',
    message = 'There are no items to display at the moment.',
    action = null,
    illustration = null,
    size = 'medium'
  } = config;

  const emptyState = document.createElement('div');
  emptyState.className = `empty-state empty-state-${size}`;

  emptyState.innerHTML = `
    <div class="empty-state-content">
      ${illustration ? `
        <img src="${illustration}" alt="" class="empty-state-illustration">
      ` : `
        <div class="empty-state-icon">
          ${getIcon(icon)}
        </div>
      `}
      
      <h3 class="empty-state-title">${title}</h3>
      
      ${message ? `
        <p class="empty-state-message">${message}</p>
      ` : ''}
      
      ${action ? `
        <div class="empty-state-action">
          ${action.href ? `
            <a href="${action.href}" class="btn btn-primary">${action.label}</a>
          ` : `
            <button class="btn btn-primary" data-action="primary">${action.label}</button>
          `}
        </div>
      ` : ''}
    </div>
  `;

  // Action handler
  if (action && action.onClick && !action.href) {
    const button = emptyState.querySelector('[data-action="primary"]');
    if (button) {
      button.addEventListener('click', action.onClick);
    }
  }

  return emptyState;
}

/**
 * Gets icon SVG by name
 * @param {string} name - Icon name or custom SVG
 * @returns {string} SVG string
 */
function getIcon(name) {
  // If custom SVG provided
  if (name.includes('<svg')) {
    return name;
  }

  const icons = {
    box: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
    
    search: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    
    inbox: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
    
    file: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>',
    
    shopping: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    
    heart: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    
    users: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    
    calendar: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    
    alert: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    
    check: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
  };

  return icons[name] || icons.box;
}

/**
 * Creates empty search result state
 * @param {string} query - Search query
 * @param {Function} [onClear] - Clear search callback
 * @returns {HTMLElement} Empty state element
 */
export function searchEmpty(query, onClear) {
  return render({
    icon: 'search',
    title: 'No results found',
    message: `We couldn't find any results for "${query}". Try adjusting your search.`,
    action: onClear ? {
      label: 'Clear Search',
      onClick: onClear
    } : null
  });
}

/**
 * Creates empty cart state
 * @param {Function} [onShop] - Start shopping callback
 * @returns {HTMLElement} Empty state element
 */
export function cartEmpty(onShop) {
  return render({
    icon: 'shopping',
    title: 'Your cart is empty',
    message: 'Add items to your cart to get started.',
    action: onShop ? {
      label: 'Start Shopping',
      onClick: onShop
    } : { label: 'Start Shopping', href: '/menu' }
  });
}

/**
 * Creates empty favorites state
 * @returns {HTMLElement} Empty state element
 */
export function favoritesEmpty() {
  return render({
    icon: 'heart',
    title: 'No favorites yet',
    message: 'Save your favorite items to find them easily later.',
    action: {
      label: 'Browse Menu',
      href: '/menu'
    }
  });
}

/**
 * Creates empty orders state
 * @returns {HTMLElement} Empty state element
 */
export function ordersEmpty() {
  return render({
    icon: 'inbox',
    title: 'No orders yet',
    message: 'You haven\'t placed any orders yet. Start ordering to see your history here.',
    action: {
      label: 'View Menu',
      href: '/menu'
    }
  });
}

/**
 * Creates error state
 * @param {string} [message] - Error message
 * @param {Function} [onRetry] - Retry callback
 * @returns {HTMLElement} Empty state element
 */
export function errorState(message = 'Something went wrong', onRetry) {
  return render({
    icon: 'alert',
    title: 'Oops!',
    message,
    action: onRetry ? {
      label: 'Try Again',
      onClick: onRetry
    } : null
  });
}

/**
 * Creates success state
 * @param {string} title - Success title
 * @param {string} [message] - Success message
 * @param {Object} [action] - Action configuration
 * @returns {HTMLElement} Empty state element
 */
export function successState(title, message, action) {
  return render({
    icon: 'check',
    title,
    message,
    action
  });
}
