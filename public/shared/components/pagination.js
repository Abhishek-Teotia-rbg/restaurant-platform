/**
 * Pagination Component
 * Displays pagination controls for navigating through pages
 * @module components/pagination
 */

/**
 * @typedef {Object} PaginationConfig
 * @property {number} currentPage - Current page number (1-indexed)
 * @property {number} totalPages - Total number of pages
 * @property {Function} onPageChange - Callback when page changes
 * @property {number} [maxVisible] - Maximum visible page buttons
 * @property {boolean} [showFirstLast] - Show first/last buttons
 * @property {boolean} [showPrevNext] - Show previous/next buttons
 * @property {string} [prevText] - Previous button text
 * @property {string} [nextText] - Next button text
 */

/**
 * Renders pagination component
 * @param {PaginationConfig} config - Pagination configuration
 * @returns {HTMLElement} Pagination element
 */
export function render(config = {}) {
  const {
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => {},
    maxVisible = 7,
    showFirstLast = true,
    showPrevNext = true,
    prevText = 'Previous',
    nextText = 'Next'
  } = config;

  if (totalPages <= 1) {
    return document.createElement('div');
  }

  const pagination = document.createElement('nav');
  pagination.className = 'pagination';
  pagination.setAttribute('aria-label', 'Pagination');

  const pages = generatePageNumbers(currentPage, totalPages, maxVisible);
  
  let buttonsHTML = '';

  // First page button
  if (showFirstLast && currentPage > 1) {
    buttonsHTML += `
      <button class="pagination-btn" data-page="1" aria-label="First page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>
    `;
  }

  // Previous button
  if (showPrevNext) {
    buttonsHTML += `
      <button class="pagination-btn" 
              data-page="${currentPage - 1}" 
              ${currentPage === 1 ? 'disabled' : ''}
              aria-label="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span class="pagination-text">${prevText}</span>
      </button>
    `;
  }

  // Page numbers
  pages.forEach(page => {
    if (page === '...') {
      buttonsHTML += `<span class="pagination-ellipsis">...</span>`;
    } else {
      buttonsHTML += `
        <button class="pagination-btn ${page === currentPage ? 'active' : ''}" 
                data-page="${page}"
                ${page === currentPage ? 'aria-current="page"' : ''}
                aria-label="Page ${page}">
          ${page}
        </button>
      `;
    }
  });

  // Next button
  if (showPrevNext) {
    buttonsHTML += `
      <button class="pagination-btn" 
              data-page="${currentPage + 1}" 
              ${currentPage === totalPages ? 'disabled' : ''}
              aria-label="Next page">
        <span class="pagination-text">${nextText}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;
  }

  // Last page button
  if (showFirstLast && currentPage < totalPages) {
    buttonsHTML += `
      <button class="pagination-btn" data-page="${totalPages}" aria-label="Last page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      </button>
    `;
  }

  pagination.innerHTML = `
    <div class="pagination-container">
      ${buttonsHTML}
    </div>
    <div class="pagination-info">
      Page ${currentPage} of ${totalPages}
    </div>
  `;

  // Add event listeners
  pagination.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', (e) => {
      const page = parseInt(e.currentTarget.dataset.page);
      if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    });
  });

  return pagination;
}

/**
 * Generates array of page numbers with ellipsis
 * @param {number} current - Current page
 * @param {number} total - Total pages
 * @param {number} maxVisible - Maximum visible pages
 * @returns {Array<number|string>} Array of page numbers and ellipsis
 */
function generatePageNumbers(current, total, maxVisible) {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - halfVisible);
  let end = Math.min(total, current + halfVisible);

  // Adjust if at the beginning or end
  if (current <= halfVisible) {
    end = maxVisible - 1;
  } else if (current >= total - halfVisible) {
    start = total - maxVisible + 2;
  }

  // Always show first page
  pages.push(1);

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push('...');
  }

  // Add middle pages
  for (let i = Math.max(2, start); i <= Math.min(total - 1, end); i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (end < total - 1) {
    pages.push('...');
  }

  // Always show last page if more than 1 page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

/**
 * Updates pagination component
 * @param {HTMLElement} pagination - Pagination element
 * @param {number} currentPage - New current page
 * @param {number} totalPages - Total pages
 */
export function update(pagination, currentPage, totalPages) {
  const config = {
    currentPage,
    totalPages,
    onPageChange: (page) => {
      const event = new CustomEvent('pagechange', { detail: { page } });
      pagination.dispatchEvent(event);
    }
  };

  const newPagination = render(config);
  pagination.replaceWith(newPagination);
  return newPagination;
}
