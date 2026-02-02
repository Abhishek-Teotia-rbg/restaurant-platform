/**
 * API Wrapper for Cloud Functions
 * @module api
 */

import { getFunctionsInstance } from './firebase-init.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import { getIdToken } from './auth.js';
import { HTTP_STATUS, ERROR_MESSAGES } from './constants.js';

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request succeeded
 * @property {*} [data] - Response data if successful
 * @property {string} [error] - Error message if failed
 * @property {number} [statusCode] - HTTP status code
 */

/**
 * Calls a Cloud Function
 * @param {string} functionName - Function name
 * @param {Object} [data] - Request data
 * @returns {Promise<ApiResponse>} Response
 */
export async function callFunction(functionName, data = {}) {
  try {
    const functions = getFunctionsInstance();
    const callable = httpsCallable(functions, functionName);
    
    const result = await callable(data);
    
    return {
      success: true,
      data: result.data,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error(`Cloud Function ${functionName} error:`, error);
    
    return {
      success: false,
      error: error.message || ERROR_MESSAGES.SERVER_ERROR,
      statusCode: error.code === 'unauthenticated' ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.SERVER_ERROR
    };
  }
}

/**
 * Makes an HTTP request to Cloud Functions endpoint
 * @param {string} endpoint - Endpoint URL
 * @param {Object} [options] - Request options
 * @returns {Promise<ApiResponse>} Response
 */
export async function httpRequest(endpoint, options = {}) {
  try {
    const {
      method = 'GET',
      data = null,
      headers = {},
      timeout = 30000
    } = options;
    
    // Get auth token
    const token = await getIdToken();
    
    // Setup request
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    // Add auth token if available
    if (token) {
      requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add body for POST/PUT/PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }
    
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestOptions.signal = controller.signal;
    
    // Make request
    const response = await fetch(endpoint, requestOptions);
    clearTimeout(timeoutId);
    
    // Parse response
    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData.error || ERROR_MESSAGES.SERVER_ERROR,
        statusCode: response.status
      };
    }
    
    return {
      success: true,
      data: responseData,
      statusCode: response.status
    };
  } catch (error) {
    console.error('HTTP request error:', error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE
      };
    }
    
    return {
      success: false,
      error: ERROR_MESSAGES.NETWORK_ERROR,
      statusCode: HTTP_STATUS.SERVER_ERROR
    };
  }
}

/**
 * Creates an order
 * @param {Object} orderData - Order data
 * @returns {Promise<ApiResponse>} Response
 */
export async function createOrder(orderData) {
  return await callFunction('createOrder', orderData);
}

/**
 * Updates an order
 * @param {string} orderId - Order ID
 * @param {Object} updates - Order updates
 * @returns {Promise<ApiResponse>} Response
 */
export async function updateOrder(orderId, updates) {
  return await callFunction('updateOrder', { orderId, ...updates });
}

/**
 * Cancels an order
 * @param {string} orderId - Order ID
 * @param {string} [reason] - Cancellation reason
 * @returns {Promise<ApiResponse>} Response
 */
export async function cancelOrder(orderId, reason = '') {
  return await callFunction('cancelOrder', { orderId, reason });
}

/**
 * Processes a payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<ApiResponse>} Response
 */
export async function processPayment(paymentData) {
  return await callFunction('processPayment', paymentData);
}

/**
 * Sends a notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<ApiResponse>} Response
 */
export async function sendNotification(notificationData) {
  return await callFunction('sendNotification', notificationData);
}

/**
 * Verifies a phone number
 * @param {string} phoneNumber - Phone number to verify
 * @returns {Promise<ApiResponse>} Response
 */
export async function verifyPhone(phoneNumber) {
  return await callFunction('verifyPhone', { phoneNumber });
}

/**
 * Applies a promotion code
 * @param {string} promoCode - Promotion code
 * @param {number} orderAmount - Order amount
 * @returns {Promise<ApiResponse>} Response
 */
export async function applyPromotion(promoCode, orderAmount) {
  return await callFunction('applyPromotion', { promoCode, orderAmount });
}

/**
 * Calculates delivery fee
 * @param {Object} addressData - Delivery address data
 * @returns {Promise<ApiResponse>} Response
 */
export async function getDeliveryFee(addressData) {
  return await callFunction('getDeliveryFee', addressData);
}

/**
 * Gets menu items
 * @param {Object} [filters] - Filter options
 * @returns {Promise<ApiResponse>} Response
 */
export async function getMenuItems(filters = {}) {
  return await callFunction('getMenuItems', filters);
}

/**
 * Searches menu items
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @returns {Promise<ApiResponse>} Response
 */
export async function searchMenuItems(query, options = {}) {
  return await callFunction('searchMenuItems', { query, ...options });
}

/**
 * Gets order details
 * @param {string} orderId - Order ID
 * @returns {Promise<ApiResponse>} Response
 */
export async function getOrderDetails(orderId) {
  return await callFunction('getOrderDetails', { orderId });
}

/**
 * Gets user orders
 * @param {Object} [options] - Query options
 * @returns {Promise<ApiResponse>} Response
 */
export async function getUserOrders(options = {}) {
  return await callFunction('getUserOrders', options);
}

/**
 * Submits a review
 * @param {Object} reviewData - Review data
 * @returns {Promise<ApiResponse>} Response
 */
export async function submitReview(reviewData) {
  return await callFunction('submitReview', reviewData);
}

/**
 * Gets restaurant info
 * @param {string} [restaurantId] - Restaurant ID
 * @returns {Promise<ApiResponse>} Response
 */
export async function getRestaurantInfo(restaurantId = null) {
  return await callFunction('getRestaurantInfo', { restaurantId });
}

/**
 * Updates user profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<ApiResponse>} Response
 */
export async function updateUserProfile(profileData) {
  return await callFunction('updateUserProfile', profileData);
}

/**
 * Saves delivery address
 * @param {Object} addressData - Address data
 * @returns {Promise<ApiResponse>} Response
 */
export async function saveAddress(addressData) {
  return await callFunction('saveAddress', addressData);
}

/**
 * Gets user addresses
 * @returns {Promise<ApiResponse>} Response
 */
export async function getUserAddresses() {
  return await callFunction('getUserAddresses');
}

/**
 * Deletes an address
 * @param {string} addressId - Address ID
 * @returns {Promise<ApiResponse>} Response
 */
export async function deleteAddress(addressId) {
  return await callFunction('deleteAddress', { addressId });
}

/**
 * Checks restaurant availability
 * @returns {Promise<ApiResponse>} Response
 */
export async function checkAvailability() {
  return await callFunction('checkAvailability');
}

/**
 * Gets available time slots
 * @param {string} date - Date string
 * @returns {Promise<ApiResponse>} Response
 */
export async function getTimeSlots(date) {
  return await callFunction('getTimeSlots', { date });
}

/**
 * Sends feedback
 * @param {Object} feedbackData - Feedback data
 * @returns {Promise<ApiResponse>} Response
 */
export async function sendFeedback(feedbackData) {
  return await callFunction('sendFeedback', feedbackData);
}

/**
 * Gets promotions
 * @param {Object} [filters] - Filter options
 * @returns {Promise<ApiResponse>} Response
 */
export async function getPromotions(filters = {}) {
  return await callFunction('getPromotions', filters);
}

/**
 * Subscribes to newsletter
 * @param {string} email - Email address
 * @returns {Promise<ApiResponse>} Response
 */
export async function subscribeNewsletter(email) {
  return await callFunction('subscribeNewsletter', { email });
}

/**
 * Tracks order location (for delivery)
 * @param {string} orderId - Order ID
 * @returns {Promise<ApiResponse>} Response
 */
export async function trackOrder(orderId) {
  return await callFunction('trackOrder', { orderId });
}

/**
 * Reports an issue
 * @param {Object} issueData - Issue data
 * @returns {Promise<ApiResponse>} Response
 */
export async function reportIssue(issueData) {
  return await callFunction('reportIssue', issueData);
}

/**
 * Generic retry wrapper for API calls
 * @param {Function} apiCall - API call function
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @param {number} [delay=1000] - Delay between retries
 * @returns {Promise<ApiResponse>} Response
 */
export async function retryApiCall(apiCall, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiCall();
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error.message;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  return {
    success: false,
    error: lastError || ERROR_MESSAGES.SERVER_ERROR
  };
}

/**
 * Batch API calls
 * @param {Array<Function>} apiCalls - Array of API call functions
 * @returns {Promise<Array<ApiResponse>>} Array of responses
 */
export async function batchApiCalls(apiCalls) {
  try {
    return await Promise.all(apiCalls.map(call => call()));
  } catch (error) {
    console.error('Batch API calls error:', error);
    throw error;
  }
}

export default {
  callFunction,
  httpRequest,
  createOrder,
  updateOrder,
  cancelOrder,
  processPayment,
  sendNotification,
  verifyPhone,
  applyPromotion,
  getDeliveryFee,
  getMenuItems,
  searchMenuItems,
  getOrderDetails,
  getUserOrders,
  submitReview,
  getRestaurantInfo,
  updateUserProfile,
  saveAddress,
  getUserAddresses,
  deleteAddress,
  checkAvailability,
  getTimeSlots,
  sendFeedback,
  getPromotions,
  subscribeNewsletter,
  trackOrder,
  reportIssue,
  retryApiCall,
  batchApiCalls
};
