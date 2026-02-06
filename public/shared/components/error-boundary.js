/**
 * Error Boundary Component
 * Catches and handles JavaScript errors in components
 * @module components/error-boundary
 */

/**
 * @typedef {Object} ErrorBoundaryConfig
 * @property {HTMLElement|Function} content - Content to wrap or render function
 * @property {Function} [onError] - Error callback
 * @property {Function} [fallback] - Custom fallback render function
 * @property {boolean} [showDetails] - Show error details in development
 * @property {string} [componentName] - Component name for logging
 */

/**
 * Wraps content in error boundary
 * @param {ErrorBoundaryConfig} config - Error boundary configuration
 * @returns {HTMLElement} Error boundary wrapper
 */
export function render(config = {}) {
  const {
    content = null,
    onError = null,
    fallback = null,
    showDetails = true,
    componentName = 'Component'
  } = config;

  const boundary = document.createElement('div');
  boundary.className = 'error-boundary';
  boundary.dataset.componentName = componentName;

  // Error state
  let hasError = false;
  let errorInfo = null;

  // Render content
  const renderContent = () => {
    try {
      if (typeof content === 'function') {
        const result = content();
        if (result instanceof HTMLElement) {
          boundary.appendChild(result);
        } else if (typeof result === 'string') {
          boundary.innerHTML = result;
        }
      } else if (content instanceof HTMLElement) {
        boundary.appendChild(content);
      } else if (typeof content === 'string') {
        boundary.innerHTML = content;
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle error
  const handleError = (error, info = {}) => {
    hasError = true;
    errorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack || '',
      timestamp: new Date().toISOString()
    };

    // Log error
    console.error(`Error in ${componentName}:`, error);
    
    if (onError) {
      onError(error, errorInfo);
    }

    // Render fallback
    renderFallback();
  };

  // Render fallback UI
  const renderFallback = () => {
    boundary.innerHTML = '';

    if (fallback) {
      const fallbackUI = fallback(errorInfo);
      if (fallbackUI instanceof HTMLElement) {
        boundary.appendChild(fallbackUI);
      } else if (typeof fallbackUI === 'string') {
        boundary.innerHTML = fallbackUI;
      }
    } else {
      boundary.appendChild(renderDefaultFallback());
    }
  };

  // Default fallback UI
  const renderDefaultFallback = () => {
    const fallbackEl = document.createElement('div');
    fallbackEl.className = 'error-boundary-fallback';
    fallbackEl.innerHTML = `
      <div class="error-content">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        
        <h3 class="error-title">Something went wrong</h3>
        <p class="error-message">We're sorry, but something unexpected happened.</p>
        
        ${showDetails && errorInfo ? `
          <details class="error-details">
            <summary>Error details</summary>
            <pre class="error-stack">${errorInfo.message}\n\n${errorInfo.stack}</pre>
          </details>
        ` : ''}
        
        <div class="error-actions">
          <button class="btn btn-primary" data-action="retry">Try Again</button>
          <button class="btn btn-secondary" data-action="report">Report Issue</button>
        </div>
      </div>
    `;

    // Retry handler
    const retryBtn = fallbackEl.querySelector('[data-action="retry"]');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        reset();
      });
    }

    // Report handler
    const reportBtn = fallbackEl.querySelector('[data-action="report"]');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        reportError(errorInfo);
      });
    }

    return fallbackEl;
  };

  // Reset error boundary
  const reset = () => {
    hasError = false;
    errorInfo = null;
    boundary.innerHTML = '';
    renderContent();
  };

  // Report error (can be customized to send to error tracking service)
  const reportError = (info) => {
    console.log('Reporting error:', info);
    
    // Example: Send to error tracking service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(info)
    // });

    alert('Error report sent. Thank you!');
  };

  // Setup global error handler for this boundary
  const errorHandler = (event) => {
    const target = event.target;
    
    // Check if error originated from this boundary's content
    if (boundary.contains(target) || event.error) {
      event.preventDefault();
      handleError(event.error || new Error('Unknown error'));
    }
  };

  // Listen for errors
  window.addEventListener('error', errorHandler, true);
  
  // Promise rejection handler
  const rejectionHandler = (event) => {
    if (boundary.contains(document.activeElement)) {
      event.preventDefault();
      handleError(event.reason || new Error('Promise rejection'));
    }
  };
  
  window.addEventListener('unhandledrejection', rejectionHandler);

  // Cleanup on removal
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === boundary) {
          window.removeEventListener('error', errorHandler, true);
          window.removeEventListener('unhandledrejection', rejectionHandler);
          observer.disconnect();
        }
      });
    });
  });

  if (boundary.parentNode) {
    observer.observe(boundary.parentNode, { childList: true });
  }

  // Initial render
  renderContent();

  // Expose methods
  boundary.errorBoundary = {
    reset,
    hasError: () => hasError,
    getError: () => errorInfo
  };

  return boundary;
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Function} [onError] - Error callback
 * @returns {Function} Wrapped function
 */
export function wrapAsync(fn, onError) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Async error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };
}

/**
 * Creates a safe event handler that catches errors
 * @param {Function} handler - Event handler function
 * @param {Function} [onError] - Error callback
 * @returns {Function} Safe event handler
 */
export function safeHandler(handler, onError) {
  return (event) => {
    try {
      return handler(event);
    } catch (error) {
      console.error('Event handler error:', error);
      if (onError) {
        onError(error, event);
      }
    }
  };
}

/**
 * Wraps multiple components in error boundaries
 * @param {Array<{component: HTMLElement|Function, name: string}>} components - Components to wrap
 * @param {Object} options - Shared options for boundaries
 * @returns {HTMLElement} Container with wrapped components
 */
export function wrapMultiple(components, options = {}) {
  const container = document.createElement('div');
  container.className = 'error-boundaries-container';

  components.forEach(({ component, name }) => {
    const boundary = render({
      ...options,
      content: component,
      componentName: name
    });
    container.appendChild(boundary);
  });

  return container;
}

/**
 * Global error boundary setup
 * @param {Object} config - Global configuration
 * @param {Function} [config.onError] - Global error handler
 * @param {boolean} [config.logErrors] - Log errors to console
 * @param {string} [config.errorEndpoint] - API endpoint for error reporting
 */
export function setupGlobal(config = {}) {
  const { onError = null, logErrors = true, errorEndpoint = null } = config;

  window.addEventListener('error', (event) => {
    if (logErrors) {
      console.error('Global error:', event.error);
    }

    if (onError) {
      onError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }

    if (errorEndpoint) {
      fetch(errorEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Failed to report error:', err));
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (logErrors) {
      console.error('Unhandled promise rejection:', event.reason);
    }

    if (onError) {
      onError(event.reason, {
        type: 'unhandledrejection',
        promise: event.promise
      });
    }
  });
}
