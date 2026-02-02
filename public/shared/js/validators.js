/**
 * Validation Utilities
 * @module validators
 */

import { REGEX_PATTERNS } from './constants.js';

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return REGEX_PATTERNS.EMAIL.test(email.trim());
}

/**
 * Validates phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @param {boolean} [withCountryCode=false] - Check for country code
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone, withCountryCode = false) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const cleaned = phone.replace(/\s+/g, '');
  
  if (withCountryCode) {
    return REGEX_PATTERNS.PHONE_WITH_CODE.test(cleaned);
  }
  
  return REGEX_PATTERNS.PHONE.test(cleaned);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, strength: 'weak', message: 'Password is required' };
  }
  
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  if (!checks.length) {
    return { 
      isValid: false, 
      strength: 'weak', 
      message: 'Password must be at least 8 characters' 
    };
  }
  
  if (passedChecks < 4) {
    return { 
      isValid: false, 
      strength: 'weak', 
      message: 'Password must contain uppercase, lowercase, number and special character' 
    };
  }
  
  const strength = passedChecks === 5 ? 'strong' : 'medium';
  
  return { 
    isValid: true, 
    strength, 
    message: 'Password is valid',
    checks 
  };
}

/**
 * Validates PIN code (Indian format)
 * @param {string} pinCode - PIN code to validate
 * @returns {boolean} True if valid
 */
export function isValidPinCode(pinCode) {
  if (!pinCode || typeof pinCode !== 'string') {
    return false;
  }
  return REGEX_PATTERNS.PIN_CODE.test(pinCode.trim());
}

/**
 * Validates URL with strict scheme checking
 * @param {string} url - URL to validate
 * @param {Array<string>} [allowedSchemes=['http', 'https']] - Allowed URL schemes
 * @returns {boolean} True if valid
 */
export function isValidUrl(url, allowedSchemes = ['http', 'https']) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const trimmed = url.trim();
  
  // Check against regex pattern
  if (!REGEX_PATTERNS.URL.test(trimmed)) {
    return false;
  }
  
  try {
    const urlObj = new URL(trimmed);
    
    // Validate scheme is in allowed list
    if (!allowedSchemes.includes(urlObj.protocol.replace(':', ''))) {
      return false;
    }
    
    // Additional security checks
    // Block data:, javascript:, vbscript:, file: schemes
    const dangerousSchemes = ['data', 'javascript', 'vbscript', 'file'];
    if (dangerousSchemes.includes(urlObj.protocol.replace(':', ''))) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates name (letters, spaces, hyphens only)
 * @param {string} name - Name to validate
 * @param {number} [minLength=2] - Minimum length
 * @param {number} [maxLength=50] - Maximum length
 * @returns {boolean} True if valid
 */
export function isValidName(name, minLength = 2, maxLength = 50) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    return false;
  }
  
  return /^[a-zA-Z\s\-']+$/.test(trimmed);
}

/**
 * Validates address
 * @param {Object} address - Address object
 * @returns {Object} Validation result
 */
export function validateAddress(address) {
  const errors = {};
  
  if (!address || typeof address !== 'object') {
    return { isValid: false, errors: { general: 'Invalid address object' } };
  }
  
  // Street validation
  if (!address.street || address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  }
  
  // City validation
  if (!address.city || !isValidName(address.city, 2, 50)) {
    errors.city = 'Please enter a valid city name';
  }
  
  // State validation
  if (!address.state || !isValidName(address.state, 2, 50)) {
    errors.state = 'Please enter a valid state name';
  }
  
  // PIN code validation
  if (!address.pinCode || !isValidPinCode(address.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code';
  }
  
  // Optional country validation
  if (address.country && !isValidName(address.country, 2, 50)) {
    errors.country = 'Please enter a valid country name';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates credit card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
export function isValidCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }
  
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates CVV
 * @param {string} cvv - CVV to validate
 * @returns {boolean} True if valid
 */
export function isValidCVV(cvv) {
  if (!cvv || typeof cvv !== 'string') {
    return false;
  }
  return /^\d{3,4}$/.test(cvv.trim());
}

/**
 * Validates expiry date (MM/YY format)
 * @param {string} expiry - Expiry date
 * @returns {Object} Validation result
 */
export function validateExpiryDate(expiry) {
  if (!expiry || typeof expiry !== 'string') {
    return { isValid: false, message: 'Expiry date is required' };
  }
  
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  
  if (!match) {
    return { isValid: false, message: 'Invalid format. Use MM/YY' };
  }
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) {
    return { isValid: false, message: 'Invalid month' };
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, message: 'Card has expired' };
  }
  
  return { isValid: true, message: 'Valid expiry date' };
}

/**
 * Validates order amount
 * @param {number} amount - Order amount
 * @param {number} [minAmount=0] - Minimum allowed amount
 * @param {number} [maxAmount=100000] - Maximum allowed amount
 * @returns {Object} Validation result
 */
export function validateOrderAmount(amount, minAmount = 0, maxAmount = 100000) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, message: 'Invalid amount' };
  }
  
  if (amount < minAmount) {
    return { isValid: false, message: `Minimum order amount is ₹${minAmount}` };
  }
  
  if (amount > maxAmount) {
    return { isValid: false, message: `Maximum order amount is ₹${maxAmount}` };
  }
  
  return { isValid: true, message: 'Valid amount' };
}

/**
 * Validates quantity
 * @param {number} quantity - Quantity to validate
 * @param {number} [min=1] - Minimum quantity
 * @param {number} [max=99] - Maximum quantity
 * @returns {Object} Validation result
 */
export function validateQuantity(quantity, min = 1, max = 99) {
  if (typeof quantity !== 'number' || isNaN(quantity) || !Number.isInteger(quantity)) {
    return { isValid: false, message: 'Quantity must be a valid number' };
  }
  
  if (quantity < min) {
    return { isValid: false, message: `Minimum quantity is ${min}` };
  }
  
  if (quantity > max) {
    return { isValid: false, message: `Maximum quantity is ${max}` };
  }
  
  return { isValid: true, message: 'Valid quantity' };
}

/**
 * Validates date is not in the past
 * @param {Date|string} date - Date to validate
 * @returns {Object} Validation result
 */
export function validateFutureDate(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, message: 'Invalid date format' };
    }
    
    const now = new Date();
    
    if (dateObj < now) {
      return { isValid: false, message: 'Date cannot be in the past' };
    }
    
    return { isValid: true, message: 'Valid date' };
  } catch (error) {
    return { isValid: false, message: 'Invalid date' };
  }
}

/**
 * Validates time slot (HH:MM format)
 * @param {string} time - Time to validate
 * @returns {Object} Validation result
 */
export function validateTimeSlot(time) {
  if (!time || typeof time !== 'string') {
    return { isValid: false, message: 'Time is required' };
  }
  
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  
  if (!match) {
    return { isValid: false, message: 'Invalid time format. Use HH:MM' };
  }
  
  return { isValid: true, message: 'Valid time' };
}

/**
 * Validates rating (1-5)
 * @param {number} rating - Rating to validate
 * @returns {boolean} True if valid
 */
export function isValidRating(rating) {
  return typeof rating === 'number' && rating >= 1 && rating <= 5;
}

/**
 * Validates form data against schema
 * @param {Object} data - Form data
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result with errors
 */
export function validateForm(data, schema) {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = rules.message || `${field} is required`;
      continue;
    }
    
    // Skip other validations if not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors[field] = `${field} must be a ${rules.type}`;
      continue;
    }
    
    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      continue;
    }
    
    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be at most ${rules.maxLength} characters`;
      continue;
    }
    
    // Min value
    if (rules.min !== undefined && value < rules.min) {
      errors[field] = `${field} must be at least ${rules.min}`;
      continue;
    }
    
    // Max value
    if (rules.max !== undefined && value > rules.max) {
      errors[field] = `${field} must be at most ${rules.max}`;
      continue;
    }
    
    // Pattern match
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} format is invalid`;
      continue;
    }
    
    // Custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      const result = rules.validator(value, data);
      if (result !== true) {
        errors[field] = result || `${field} is invalid`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitizes string input (removes dangerous characters and patterns)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/[<>]/g, '')
    // Remove dangerous URL schemes (javascript:, data:, vbscript:)
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove event handlers - use multiple passes to catch nested patterns
    .replace(/on\w+\s*=/gi, '')
    .replace(/on\w+\s*=/gi, '') // Second pass to catch patterns like "oonn"
    .replace(/on\w+\s*=/gi, ''); // Third pass for safety
}

/**
 * Sanitizes HTML (removes script tags and dangerous attributes)
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidPinCode,
  isValidUrl,
  isValidName,
  validateAddress,
  isValidCardNumber,
  isValidCVV,
  validateExpiryDate,
  validateOrderAmount,
  validateQuantity,
  validateFutureDate,
  validateTimeSlot,
  isValidRating,
  validateForm,
  sanitizeInput,
  sanitizeHtml
};
