/**
 * Formatting Utilities
 * @module formatters
 */

import { DEFAULTS } from './constants.js';

/**
 * Formats currency amount
 * @param {number} amount - Amount to format
 * @param {string} [currency=DEFAULTS.CURRENCY] - Currency code
 * @param {string} [locale='en-IN'] - Locale for formatting
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = DEFAULTS.CURRENCY, locale = 'en-IN') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${DEFAULTS.CURRENCY_SYMBOL}0.00`;
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback if Intl is not supported
    return `${DEFAULTS.CURRENCY_SYMBOL}${amount.toFixed(2)}`;
  }
}

/**
 * Formats currency with custom symbol
 * @param {number} amount - Amount to format
 * @param {string} [symbol=DEFAULTS.CURRENCY_SYMBOL] - Currency symbol
 * @returns {string} Formatted currency string
 */
export function formatPrice(amount, symbol = DEFAULTS.CURRENCY_SYMBOL) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${symbol}0.00`;
  }
  
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
}

/**
 * Formats number with thousand separators
 * @param {number} number - Number to format
 * @param {number} [decimals=0] - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(number, decimals = 0) {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  const fixed = number.toFixed(decimals);
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats phone number
 * @param {string} phone - Phone number to format
 * @param {boolean} [withCountryCode=true] - Include country code
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone, withCountryCode = true) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with country code
  const hasCountryCode = cleaned.length > 10;
  const countryCode = hasCountryCode ? cleaned.slice(0, -10) : DEFAULTS.COUNTRY_CODE.replace('+', '');
  const phoneNumber = hasCountryCode ? cleaned.slice(-10) : cleaned;
  
  if (phoneNumber.length !== 10) {
    return phone; // Return original if invalid
  }
  
  // Format as XXX-XXX-XXXX
  const formatted = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  
  return withCountryCode ? `+${countryCode} ${formatted}` : formatted;
}

/**
 * Formats date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} [options] - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return dateObj.toLocaleDateString('en-IN', defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats date to short format (DD/MM/YYYY)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Formats time to readable string
 * @param {Date|string|number} date - Date/time to format
 * @param {boolean} [use24Hour=false] - Use 24-hour format
 * @returns {string} Formatted time string
 */
export function formatTime(date, use24Hour = false) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour
    };
    
    return dateObj.toLocaleTimeString('en-IN', options);
  } catch (error) {
    return 'Invalid Time';
  }
}

/**
 * Formats date and time together
 * @param {Date|string|number} date - Date/time to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date/Time';
    }
    
    return `${formatDate(dateObj)} at ${formatTime(dateObj)}`;
  } catch (error) {
    return 'Invalid Date/Time';
  }
}

/**
 * Formats relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Formats duration in milliseconds to readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(milliseconds) {
  if (typeof milliseconds !== 'number' || isNaN(milliseconds) || milliseconds < 0) {
    return '0s';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Formats address to single line string
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export function formatAddress(address) {
  if (!address || typeof address !== 'object') {
    return '';
  }
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.landmark) parts.push(address.landmark);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pinCode) parts.push(address.pinCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
}

/**
 * Formats address to multi-line HTML
 * @param {Object} address - Address object
 * @returns {string} Formatted address HTML
 */
export function formatAddressMultiline(address) {
  if (!address || typeof address !== 'object') {
    return '';
  }
  
  const lines = [];
  
  if (address.street) lines.push(address.street);
  if (address.landmark) lines.push(address.landmark);
  
  const cityLine = [];
  if (address.city) cityLine.push(address.city);
  if (address.state) cityLine.push(address.state);
  if (address.pinCode) cityLine.push(address.pinCode);
  if (cityLine.length > 0) lines.push(cityLine.join(', '));
  
  if (address.country) lines.push(address.country);
  
  return lines.join('<br>');
}

/**
 * Formats order status to display text
 * @param {string} status - Order status code
 * @returns {string} Display text
 */
export function formatOrderStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  
  return statusMap[status] || status;
}

/**
 * Formats payment method to display text
 * @param {string} method - Payment method code
 * @returns {string} Display text
 */
export function formatPaymentMethod(method) {
  const methodMap = {
    'cash': 'Cash on Delivery',
    'card': 'Credit/Debit Card',
    'online': 'Online Payment',
    'wallet': 'Digital Wallet',
    'upi': 'UPI'
  };
  
  return methodMap[method] || method;
}

/**
 * Formats file size to readable string
 * @param {number} bytes - Size in bytes
 * @param {number} [decimals=2] - Number of decimals
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats percentage
 * @param {number} value - Value to format
 * @param {number} [decimals=0] - Number of decimals
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats card number with masking
 * @param {string} cardNumber - Card number
 * @param {boolean} [maskMiddle=true] - Mask middle digits
 * @returns {string} Formatted card number
 */
export function formatCardNumber(cardNumber, maskMiddle = true) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return '';
  }
  
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return cardNumber;
  }
  
  if (maskMiddle) {
    // Show first 4 and last 4 digits
    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    return `${first4} ${middle} ${last4}`;
  }
  
  // Format with spaces every 4 digits
  return cleaned.match(/.{1,4}/g).join(' ');
}

/**
 * Formats rating with stars
 * @param {number} rating - Rating value (0-5)
 * @param {number} [maxRating=5] - Maximum rating
 * @returns {string} Star string
 */
export function formatRatingStars(rating, maxRating = 5) {
  if (typeof rating !== 'number' || isNaN(rating)) {
    rating = 0;
  }
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '½' : '') + 
         '☆'.repeat(emptyStars);
}

/**
 * Formats rating as text
 * @param {number} rating - Rating value
 * @param {boolean} [includeNumber=true] - Include numeric rating
 * @returns {string} Formatted rating
 */
export function formatRating(rating, includeNumber = true) {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return 'No rating';
  }
  
  const stars = formatRatingStars(rating);
  return includeNumber ? `${stars} (${rating.toFixed(1)})` : stars;
}

/**
 * Formats order ID for display
 * @param {string} orderId - Order ID
 * @returns {string} Formatted order ID
 */
export function formatOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return '';
  }
  
  // Format as #XXXXX (last 5 characters in uppercase)
  const shortId = orderId.substring(orderId.length - 5).toUpperCase();
  return `#${shortId}`;
}

/**
 * Truncates text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=50] - Maximum length
 * @param {string} [suffix='...'] - Suffix to add
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats array to comma-separated string with "and" before last item
 * @param {Array} items - Array of items
 * @param {string} [conjunction='and'] - Conjunction word
 * @returns {string} Formatted list
 */
export function formatList(items, conjunction = 'and') {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }
  
  if (items.length === 1) {
    return String(items[0]);
  }
  
  if (items.length === 2) {
    return `${items[0]} ${conjunction} ${items[1]}`;
  }
  
  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Formats boolean to Yes/No
 * @param {boolean} value - Boolean value
 * @returns {string} "Yes" or "No"
 */
export function formatBoolean(value) {
  return value ? 'Yes' : 'No';
}

/**
 * Formats coordinates to readable string
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} [precision=6] - Decimal precision
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(latitude, longitude, precision = 6) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return '';
  }
  
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}

export default {
  formatCurrency,
  formatPrice,
  formatNumber,
  formatPhone,
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatAddress,
  formatAddressMultiline,
  formatOrderStatus,
  formatPaymentMethod,
  formatFileSize,
  formatPercentage,
  formatCardNumber,
  formatRatingStars,
  formatRating,
  formatOrderId,
  truncateText,
  formatList,
  formatBoolean,
  formatCoordinates
};
