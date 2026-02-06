/**
 * General Utility Functions
 * @module utils
 */

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generates a unique ID
 * @param {number} [length=20] - Length of the ID
 * @returns {string} Unique ID
 */
export function generateId(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a short ID (8 characters)
 * @returns {string} Short unique ID
 */
export function generateShortId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Deep clones an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Deep merges two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Checks if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} True if object
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Checks if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Safely parses JSON string
 * @param {string} jsonString - JSON string to parse
 * @param {*} [defaultValue=null] - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Safely stringifies object to JSON
 * @param {*} obj - Object to stringify
 * @param {string} [defaultValue='{}'] - Default value if stringification fails
 * @returns {string} JSON string or default value
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('JSON stringify error:', error);
    return defaultValue;
  }
}

/**
 * Capitalizes first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncates string to specified length
 * @param {string} str - String to truncate
 * @param {number} [length=50] - Maximum length
 * @param {string} [suffix='...'] - Suffix to add
 * @returns {string} Truncated string
 */
export function truncate(str, length = 50, suffix = '...') {
  if (!str || str.length <= length) {
    return str;
  }
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Converts string to slug format
 * @param {string} str - String to slugify
 * @returns {string} Slug string
 */
export function slugify(str) {
  if (!str) {
    return '';
  }
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Removes HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtml(html) {
  if (!html) {
    return '';
  }
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  if (!text) {
    return '';
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries a function call with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} [maxRetries=3] - Maximum number of retries
 * @param {number} [baseDelay=1000] - Base delay in milliseconds
 * @returns {Promise<*>} Function result
 * @throws {Error} If all retries fail
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
}

/**
 * Groups array items by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key or function to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  if (!Array.isArray(array)) {
    return {};
  }
  
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
}

/**
 * Removes duplicates from array
 * @param {Array} array - Array to deduplicate
 * @param {string|Function} [key] - Key or function for comparison
 * @returns {Array} Array without duplicates
 */
export function unique(array, key) {
  if (!Array.isArray(array)) {
    return [];
  }
  
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
}

/**
 * Chunks array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunk(array, size) {
  if (!Array.isArray(array) || size < 1) {
    return [];
  }
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flattens nested array
 * @param {Array} array - Array to flatten
 * @param {number} [depth=1] - Depth to flatten
 * @returns {Array} Flattened array
 */
export function flatten(array, depth = 1) {
  if (!Array.isArray(array)) {
    return [];
  }
  
  if (depth < 1) {
    return array.slice();
  }
  
  return array.reduce((flat, item) => {
    return flat.concat(
      Array.isArray(item) && depth > 1
        ? flatten(item, depth - 1)
        : item
    );
  }, []);
}

/**
 * Sorts array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} [order='asc'] - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, order = 'asc') {
  if (!Array.isArray(array)) {
    return [];
  }
  
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) {
      return order === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Gets value from nested object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Path in dot notation (e.g., 'user.address.city')
 * @param {*} [defaultValue] - Default value if path not found
 * @returns {*} Value at path or default value
 */
export function getNestedValue(obj, path, defaultValue) {
  if (!obj || !path) {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
}

/**
 * Sets value in nested object using dot notation
 * @param {Object} obj - Object to set value in
 * @param {string} path - Path in dot notation
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export function setNestedValue(obj, path, value) {
  if (!obj || !path) {
    return obj;
  }
  
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Gets query parameters from URL
 * @param {string} [url=window.location.href] - URL to parse
 * @returns {Object} Query parameters object
 */
export function getQueryParams(url = window.location.href) {
  const params = {};
  const urlObj = new URL(url);
  
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Updates query parameters in URL
 * @param {Object} params - Parameters to update
 * @param {boolean} [replace=false] - Replace current state instead of pushing
 */
export function updateQueryParams(params, replace = false) {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  if (replace) {
    window.history.replaceState({}, '', url.toString());
  } else {
    window.history.pushState({}, '', url.toString());
  }
}

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimals
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Checks if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Checks if browser is online
 * @returns {boolean} True if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Generates random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates random item from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random item
 */
export function randomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[Math.floor(Math.random() * array.length)];
}

export default {
  debounce,
  throttle,
  generateId,
  generateShortId,
  deepClone,
  deepMerge,
  isObject,
  isEmpty,
  safeJsonParse,
  safeJsonStringify,
  capitalize,
  toTitleCase,
  truncate,
  slugify,
  stripHtml,
  escapeHtml,
  delay,
  retry,
  groupBy,
  unique,
  chunk,
  flatten,
  sortBy,
  getNestedValue,
  setNestedValue,
  copyToClipboard,
  getQueryParams,
  updateQueryParams,
  formatFileSize,
  isMobile,
  isOnline,
  randomInt,
  randomItem
};
