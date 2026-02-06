/**
 * Modal Component
 * Displays modal dialog with customizable content
 * @module components/modal
 */

/**
 * @typedef {Object} ModalConfig
 * @property {string} [title] - Modal title
 * @property {string|HTMLElement} [content] - Modal content
 * @property {Array<{label: string, action: Function, variant?: string}>} [buttons] - Action buttons
 * @property {boolean} [closeOnOverlay] - Close modal when clicking overlay
 * @property {boolean} [closeOnEsc] - Close modal on Escape key
 * @property {Function} [onClose] - Callback when modal closes
 * @property {string} [size] - Modal size: 'small', 'medium', 'large', 'full'
 * @property {boolean} [showClose] - Show close button
 */

/**
 * Renders modal component
 * @param {ModalConfig} config - Modal configuration
 * @returns {HTMLElement} Modal element
 */
export function render(config = {}) {
  const {
    title = '',
    content = '',
    buttons = [],
    closeOnOverlay = true,
    closeOnEsc = true,
    onClose = null,
    size = 'medium',
    showClose = true
  } = config;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container modal-${size}">
      <div class="modal-header">
        ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
        ${showClose ? `
          <button class="modal-close" aria-label="Close" data-action="close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : ''}
      </div>
      
      <div class="modal-body">
        ${typeof content === 'string' ? content : ''}
      </div>
      
      ${buttons.length > 0 ? `
        <div class="modal-footer">
          ${buttons.map((btn, idx) => `
            <button class="btn btn-${btn.variant || 'primary'}" data-action="button-${idx}">
              ${btn.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // Insert HTML content if it's an element
  if (content instanceof HTMLElement) {
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = '';
    modalBody.appendChild(content);
  }

  // Close handlers
  const closeModal = () => {
    modal.classList.add('modal-closing');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      if (onClose) onClose();
    }, 200);
  };

  // Close button
  if (showClose) {
    const closeBtn = modal.querySelector('[data-action="close"]');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  // Overlay click
  if (closeOnOverlay) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Escape key
  if (closeOnEsc) {
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Button handlers
  buttons.forEach((btn, idx) => {
    const button = modal.querySelector(`[data-action="button-${idx}"]`);
    if (button && btn.action) {
      button.addEventListener('click', () => {
        btn.action();
        if (btn.closeAfter !== false) closeModal();
      });
    }
  });

  return modal;
}

/**
 * Shows modal
 * @param {ModalConfig} config - Modal configuration
 * @returns {HTMLElement} Modal element
 */
export function show(config) {
  const modal = render(config);
  document.body.appendChild(modal);
  
  // Trigger animation
  requestAnimationFrame(() => {
    modal.classList.add('modal-visible');
  });
  
  return modal;
}

/**
 * Closes modal
 * @param {HTMLElement} modal - Modal element to close
 */
export function close(modal) {
  if (!modal) return;
  
  const closeBtn = modal.querySelector('[data-action="close"]');
  if (closeBtn) {
    closeBtn.click();
  } else {
    modal.classList.add('modal-closing');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 200);
  }
}

/**
 * Shows confirmation modal
 * @param {Object} options - Confirmation options
 * @param {string} options.title - Confirmation title
 * @param {string} options.message - Confirmation message
 * @param {Function} options.onConfirm - Confirm callback
 * @param {Function} [options.onCancel] - Cancel callback
 * @param {string} [options.confirmText] - Confirm button text
 * @param {string} [options.cancelText] - Cancel button text
 * @returns {HTMLElement} Modal element
 */
export function confirm({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  return show({
    title,
    content: `<p>${message}</p>`,
    buttons: [
      {
        label: cancelText,
        variant: 'secondary',
        action: onCancel || (() => {})
      },
      {
        label: confirmText,
        variant: 'primary',
        action: onConfirm
      }
    ]
  });
}

/**
 * Shows alert modal
 * @param {Object} options - Alert options
 * @param {string} options.title - Alert title
 * @param {string} options.message - Alert message
 * @param {Function} [options.onClose] - Close callback
 * @param {string} [options.buttonText] - Button text
 * @returns {HTMLElement} Modal element
 */
export function alert({ title, message, onClose, buttonText = 'OK' }) {
  return show({
    title,
    content: `<p>${message}</p>`,
    buttons: [
      {
        label: buttonText,
        variant: 'primary',
        action: onClose || (() => {})
      }
    ]
  });
}
