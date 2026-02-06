/**
 * Loading Component
 * Displays loading spinner or skeleton screens
 * @module components/loading
 */

/**
 * @typedef {Object} LoadingConfig
 * @property {'spinner'|'skeleton'|'dots'|'bar'} [type] - Loading indicator type
 * @property {string} [size] - Size: 'small', 'medium', 'large'
 * @property {string} [text] - Loading text to display
 * @property {boolean} [overlay] - Show as overlay
 * @property {number} [skeletonLines] - Number of skeleton lines (for skeleton type)
 */

/**
 * Renders loading component
 * @param {LoadingConfig} config - Loading configuration
 * @returns {HTMLElement} Loading element
 */
export function render(config = {}) {
  const {
    type = 'spinner',
    size = 'medium',
    text = '',
    overlay = false,
    skeletonLines = 3
  } = config;

  const container = document.createElement('div');
  container.className = `loading-container ${overlay ? 'loading-overlay' : ''} loading-${size}`;

  switch (type) {
    case 'spinner':
      container.innerHTML = renderSpinner(text);
      break;
    case 'skeleton':
      container.innerHTML = renderSkeleton(skeletonLines);
      break;
    case 'dots':
      container.innerHTML = renderDots(text);
      break;
    case 'bar':
      container.innerHTML = renderBar(text);
      break;
    default:
      container.innerHTML = renderSpinner(text);
  }

  return container;
}

/**
 * Renders spinner loading indicator
 * @param {string} text - Loading text
 * @returns {string} HTML string
 */
function renderSpinner(text) {
  return `
    <div class="loading-spinner">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      ${text ? `<p class="loading-text">${text}</p>` : ''}
    </div>
  `;
}

/**
 * Renders skeleton loading placeholder
 * @param {number} lines - Number of skeleton lines
 * @returns {string} HTML string
 */
function renderSkeleton(lines) {
  const skeletonLines = Array(lines).fill(0).map((_, i) => {
    const width = i === lines - 1 ? '60%' : '100%';
    return `<div class="skeleton-line" style="width: ${width}"></div>`;
  }).join('');

  return `
    <div class="loading-skeleton">
      ${skeletonLines}
    </div>
  `;
}

/**
 * Renders dots loading indicator
 * @param {string} text - Loading text
 * @returns {string} HTML string
 */
function renderDots(text) {
  return `
    <div class="loading-dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      ${text ? `<p class="loading-text">${text}</p>` : ''}
    </div>
  `;
}

/**
 * Renders progress bar loading indicator
 * @param {string} text - Loading text
 * @returns {string} HTML string
 */
function renderBar(text) {
  return `
    <div class="loading-bar">
      ${text ? `<p class="loading-text">${text}</p>` : ''}
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
  `;
}

/**
 * Shows loading overlay on element
 * @param {HTMLElement} element - Target element
 * @param {LoadingConfig} config - Loading configuration
 * @returns {HTMLElement} Loading overlay element
 */
export function showLoading(element, config = {}) {
  const loading = render({ ...config, overlay: true });
  element.style.position = 'relative';
  element.appendChild(loading);
  return loading;
}

/**
 * Hides loading overlay
 * @param {HTMLElement} loadingElement - Loading element to remove
 */
export function hideLoading(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

/**
 * Creates skeleton card for loading states
 * @param {number} count - Number of cards
 * @returns {HTMLElement} Container with skeleton cards
 */
export function skeletonCard(count = 1) {
  const container = document.createElement('div');
  container.className = 'skeleton-cards';
  
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 60%"></div>
          <div class="skeleton-line" style="width: 90%"></div>
        </div>
      </div>
    `;
  }
  
  return container;
}
