/**
 * Toast Component
 * Displays temporary notification messages
 * @module components/toast
 */

/**
 * @typedef {Object} ToastConfig
 * @property {string} message - Toast message
 * @property {'success'|'error'|'warning'|'info'} [type] - Toast type
 * @property {number} [duration] - Display duration in ms (0 for persistent)
 * @property {string} [position] - Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
 * @property {boolean} [closeable] - Show close button
 * @property {Function} [onClose] - Callback when toast closes
 * @property {string} [action] - Action button text
 * @property {Function} [onAction] - Action button callback
 */

let toastContainer = null;

/**
 * Gets or creates toast container
 * @param {string} position - Toast position
 * @returns {HTMLElement} Toast container
 */
function getToastContainer(position = 'top-right') {
  if (!toastContainer || toastContainer.dataset.position !== position) {
    // Remove old container if position changed
    if (toastContainer) {
      toastContainer.remove();
    }
    
    toastContainer = document.createElement('div');
    toastContainer.className = `toast-container toast-${position}`;
    toastContainer.dataset.position = position;
    document.body.appendChild(toastContainer);
  }
  
  return toastContainer;
}

/**
 * Renders toast component
 * @param {ToastConfig} config - Toast configuration
 * @returns {HTMLElement} Toast element
 */
export function render(config = {}) {
  const {
    message = '',
    type = 'info',
    duration = 3000,
    position = 'top-right',
    closeable = true,
    onClose = null,
    action = null,
    onAction = null
  } = config;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${getIcon(type)}
    </div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    ${action ? `
      <button class="toast-action" data-action="action">${action}</button>
    ` : ''}
    ${closeable ? `
      <button class="toast-close" aria-label="Close" data-action="close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    ` : ''}
  `;

  // Remove toast function
  const removeToast = () => {
    toast.classList.add('toast-removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      if (onClose) onClose();
    }, 300);
  };

  // Close button handler
  if (closeable) {
    const closeBtn = toast.querySelector('[data-action="close"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', removeToast);
    }
  }

  // Action button handler
  if (action && onAction) {
    const actionBtn = toast.querySelector('[data-action="action"]');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        onAction();
        removeToast();
      });
    }
  }

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }

  // Add to container
  const container = getToastContainer(position);
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  return toast;
}

/**
 * Gets icon for toast type
 * @param {string} type - Toast type
 * @returns {string} SVG icon
 */
function getIcon(type) {
  const icons = {
    success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  return icons[type] || icons.info;
}

/**
 * Shows success toast
 * @param {string} message - Toast message
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Toast element
 */
export function success(message, options = {}) {
  return render({ ...options, message, type: 'success' });
}

/**
 * Shows error toast
 * @param {string} message - Toast message
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Toast element
 */
export function error(message, options = {}) {
  return render({ ...options, message, type: 'error' });
}

/**
 * Shows warning toast
 * @param {string} message - Toast message
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Toast element
 */
export function warning(message, options = {}) {
  return render({ ...options, message, type: 'warning' });
}

/**
 * Shows info toast
 * @param {string} message - Toast message
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Toast element
 */
export function info(message, options = {}) {
  return render({ ...options, message, type: 'info' });
}

/**
 * Removes all toasts
 */
export function clearAll() {
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }
}
