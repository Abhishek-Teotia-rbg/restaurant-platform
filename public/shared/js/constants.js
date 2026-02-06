/**
 * Application Constants
 * @module constants
 */

/**
 * Order status constants
 * @enum {string}
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Payment method constants
 * @enum {string}
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  WALLET: 'wallet',
  UPI: 'upi'
};

/**
 * Payment status constants
 * @enum {string}
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

/**
 * Delivery type constants
 * @enum {string}
 */
export const DELIVERY_TYPE = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  DINE_IN: 'dine_in'
};

/**
 * User role constants
 * @enum {string}
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  KITCHEN: 'kitchen',
  DELIVERY: 'delivery'
};

/**
 * Menu item status
 * @enum {string}
 */
export const ITEM_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  OUT_OF_STOCK: 'out_of_stock'
};

/**
 * Menu item categories
 * @enum {string}
 */
export const ITEM_CATEGORIES = {
  APPETIZER: 'appetizer',
  MAIN_COURSE: 'main_course',
  DESSERT: 'dessert',
  BEVERAGE: 'beverage',
  SIDE: 'side',
  SPECIAL: 'special'
};

/**
 * Dietary preferences
 * @enum {string}
 */
export const DIETARY_PREFERENCES = {
  VEG: 'veg',
  NON_VEG: 'non_veg',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  DAIRY_FREE: 'dairy_free'
};

/**
 * Notification types
 * @enum {string}
 */
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_READY: 'order_ready',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PROMOTION: 'promotion'
};

/**
 * Toast notification duration in milliseconds
 * @enum {number}
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000
};

/**
 * Toast notification types
 * @enum {string}
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Firestore collection names
 * @enum {string}
 */
export const COLLECTIONS = {
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  CARTS: 'carts',
  REVIEWS: 'reviews',
  PROMOTIONS: 'promotions',
  NOTIFICATIONS: 'notifications',
  ADDRESSES: 'addresses'
};

/**
 * Local storage keys
 * @enum {string}
 */
export const STORAGE_KEYS = {
  CART: 'restaurant_cart',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
  LAST_ORDER: 'last_order',
  DELIVERY_ADDRESS: 'delivery_address'
};

/**
 * Validation regex patterns
 * @enum {RegExp}
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PHONE_WITH_CODE: /^\+\d{1,3}\d{10}$/,
  PIN_CODE: /^\d{6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

/**
 * API endpoints
 * @enum {string}
 */
export const API_ENDPOINTS = {
  CREATE_ORDER: '/createOrder',
  UPDATE_ORDER: '/updateOrder',
  CANCEL_ORDER: '/cancelOrder',
  PROCESS_PAYMENT: '/processPayment',
  SEND_NOTIFICATION: '/sendNotification',
  VERIFY_PHONE: '/verifyPhone',
  APPLY_PROMOTION: '/applyPromotion',
  GET_DELIVERY_FEE: '/getDeliveryFee'
};

/**
 * Error messages
 * @enum {string}
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  PERMISSION_DENIED: 'Permission denied.',
  INVALID_EMAIL: 'Invalid email address.',
  INVALID_PHONE: 'Invalid phone number.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.',
  CART_EMPTY: 'Your cart is empty.',
  ORDER_NOT_FOUND: 'Order not found.',
  PAYMENT_FAILED: 'Payment failed. Please try again.'
};

/**
 * Success messages
 * @enum {string}
 */
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully.',
  PAYMENT_SUCCESS: 'Payment completed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ADDRESS_SAVED: 'Address saved successfully.',
  ITEM_ADDED_TO_CART: 'Item added to cart.',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SIGNUP_SUCCESS: 'Account created successfully!'
};

/**
 * Default values
 */
export const DEFAULTS = {
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  COUNTRY_CODE: '+91',
  LANGUAGE: 'en',
  PAGE_SIZE: 20,
  MAX_CART_ITEMS: 50,
  MIN_ORDER_AMOUNT: 100,
  DELIVERY_RADIUS_KM: 10,
  PREPARATION_TIME_MIN: 30,
  IMAGE_MAX_SIZE_MB: 5,
  RATING_MAX: 5
};

/**
 * Time constants in milliseconds
 * @enum {number}
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000
};

/**
 * HTTP status codes
 * @enum {number}
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Firebase error codes mapping
 * @enum {string}
 */
export const FIREBASE_ERROR_CODES = {
  'auth/user-not-found': 'User not found. Please check your credentials.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'Email already in use. Please login or use another email.',
  'auth/weak-password': 'Password is too weak. Please use a stronger password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'permission-denied': 'You do not have permission to perform this action.',
  'unavailable': 'Service temporarily unavailable. Please try again.',
  'not-found': 'Resource not found.',
  'already-exists': 'Resource already exists.'
};
