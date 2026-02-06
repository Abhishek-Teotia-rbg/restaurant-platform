/**
 * Rating Component
 * Displays and captures star ratings
 * @module components/rating
 */

/**
 * @typedef {Object} RatingConfig
 * @property {number} [value] - Current rating value (0-5)
 * @property {number} [max] - Maximum rating (default: 5)
 * @property {boolean} [readonly] - Read-only mode
 * @property {Function} [onChange] - Change callback
 * @property {string} [size] - Size: 'small', 'medium', 'large'
 * @property {boolean} [showValue] - Show numeric value
 * @property {number} [precision] - Rating precision (0.5 for half stars, 1 for whole)
 * @property {number} [count] - Number of ratings (for display)
 */

/**
 * Renders rating component
 * @param {RatingConfig} config - Rating configuration
 * @returns {HTMLElement} Rating element
 */
export function render(config = {}) {
  const {
    value = 0,
    max = 5,
    readonly = false,
    onChange = null,
    size = 'medium',
    showValue = false,
    precision = 1,
    count = null
  } = config;

  const rating = document.createElement('div');
  rating.className = `rating-container rating-${size} ${readonly ? 'rating-readonly' : 'rating-interactive'}`;
  rating.setAttribute('role', readonly ? 'img' : 'slider');
  rating.setAttribute('aria-label', `Rating: ${value} out of ${max} stars`);
  
  if (!readonly) {
    rating.setAttribute('aria-valuemin', '0');
    rating.setAttribute('aria-valuemax', max.toString());
    rating.setAttribute('aria-valuenow', value.toString());
  }

  const starsHTML = Array(max).fill(0).map((_, index) => {
    const starValue = index + 1;
    const fillPercentage = calculateFillPercentage(value, starValue, precision);
    
    return `
      <span class="rating-star" data-value="${starValue}">
        <svg class="star-empty" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <svg class="star-filled" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="clip-path: inset(0 ${100 - fillPercentage}% 0 0)">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </span>
    `;
  }).join('');

  rating.innerHTML = `
    <div class="rating-stars" data-current-value="${value}">
      ${starsHTML}
    </div>
    ${showValue || count ? `
      <div class="rating-info">
        ${showValue ? `<span class="rating-value">${value.toFixed(1)}</span>` : ''}
        ${count !== null ? `<span class="rating-count">(${count})</span>` : ''}
      </div>
    ` : ''}
  `;

  if (!readonly) {
    const stars = rating.querySelectorAll('.rating-star');
    const starsContainer = rating.querySelector('.rating-stars');
    let currentValue = value;

    // Hover effect
    stars.forEach(star => {
      star.addEventListener('mouseenter', (e) => {
        const hoverValue = parseFloat(e.currentTarget.dataset.value);
        updateStarsDisplay(stars, hoverValue, precision);
      });
    });

    starsContainer.addEventListener('mouseleave', () => {
      updateStarsDisplay(stars, currentValue, precision);
    });

    // Click to rate
    stars.forEach(star => {
      star.addEventListener('click', (e) => {
        const newValue = parseFloat(e.currentTarget.dataset.value);
        
        // Handle half-star clicks
        let finalValue = newValue;
        if (precision === 0.5) {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const starWidth = rect.width;
          
          if (clickX < starWidth / 2) {
            finalValue = newValue - 0.5;
          }
        }

        currentValue = finalValue;
        starsContainer.dataset.currentValue = finalValue;
        updateStarsDisplay(stars, finalValue, precision);

        if (onChange) {
          onChange(finalValue);
        }

        // Update aria attributes
        rating.setAttribute('aria-valuenow', finalValue.toString());
        rating.setAttribute('aria-label', `Rating: ${finalValue} out of ${max} stars`);

        // Update displayed value
        const valueSpan = rating.querySelector('.rating-value');
        if (valueSpan) {
          valueSpan.textContent = finalValue.toFixed(1);
        }
      });
    });

    // Keyboard navigation
    rating.setAttribute('tabindex', '0');
    rating.addEventListener('keydown', (e) => {
      let newValue = currentValue;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        newValue = Math.min(currentValue + precision, max);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        newValue = Math.max(currentValue - precision, 0);
      } else if (e.key === 'Home') {
        e.preventDefault();
        newValue = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newValue = max;
      } else {
        return;
      }

      currentValue = newValue;
      starsContainer.dataset.currentValue = newValue;
      updateStarsDisplay(stars, newValue, precision);

      if (onChange) {
        onChange(newValue);
      }

      rating.setAttribute('aria-valuenow', newValue.toString());
      
      const valueSpan = rating.querySelector('.rating-value');
      if (valueSpan) {
        valueSpan.textContent = newValue.toFixed(1);
      }
    });
  }

  return rating;
}

/**
 * Calculates fill percentage for a star
 * @param {number} value - Current rating value
 * @param {number} starValue - Star position value
 * @param {number} precision - Rating precision
 * @returns {number} Fill percentage (0-100)
 */
function calculateFillPercentage(value, starValue, precision) {
  if (value >= starValue) {
    return 100;
  } else if (value >= starValue - precision) {
    const fraction = (value - (starValue - 1)) / precision;
    return fraction * 100;
  }
  return 0;
}

/**
 * Updates star display
 * @param {NodeList} stars - Star elements
 * @param {number} value - Rating value
 * @param {number} precision - Rating precision
 */
function updateStarsDisplay(stars, value, precision) {
  stars.forEach((star, index) => {
    const starValue = index + 1;
    const fillPercentage = calculateFillPercentage(value, starValue, precision);
    const filledStar = star.querySelector('.star-filled');
    
    if (filledStar) {
      filledStar.style.clipPath = `inset(0 ${100 - fillPercentage}% 0 0)`;
    }
  });
}

/**
 * Gets rating value
 * @param {HTMLElement} rating - Rating element
 * @returns {number} Current rating value
 */
export function getValue(rating) {
  const starsContainer = rating.querySelector('.rating-stars');
  return parseFloat(starsContainer.dataset.currentValue) || 0;
}

/**
 * Sets rating value
 * @param {HTMLElement} rating - Rating element
 * @param {number} value - New rating value
 */
export function setValue(rating, value) {
  const starsContainer = rating.querySelector('.rating-stars');
  const stars = rating.querySelectorAll('.rating-star');
  const precision = rating.classList.contains('rating-readonly') ? 0.1 : 1;
  
  starsContainer.dataset.currentValue = value;
  updateStarsDisplay(stars, value, precision);
  
  const valueSpan = rating.querySelector('.rating-value');
  if (valueSpan) {
    valueSpan.textContent = value.toFixed(1);
  }

  rating.setAttribute('aria-valuenow', value.toString());
  rating.setAttribute('aria-label', `Rating: ${value} out of 5 stars`);
}

/**
 * Creates compact rating display
 * @param {number} value - Rating value
 * @param {number} [count] - Number of ratings
 * @returns {HTMLElement} Compact rating element
 */
export function compact(value, count) {
  return render({
    value,
    count,
    readonly: true,
    size: 'small',
    showValue: true
  });
}
