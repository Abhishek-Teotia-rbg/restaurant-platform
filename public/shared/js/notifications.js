/**
 * Notifications Module
 * @module notifications
 */

import { getMessagingInstance } from './firebase-init.js';
import { getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { TOAST_DURATION, TOAST_TYPES } from './constants.js';

/**
 * @typedef {Object} ToastOptions
 * @property {string} [type='info'] - Toast type (success, error, warning, info)
 * @property {number} [duration=4000] - Duration in milliseconds
 * @property {boolean} [dismissible=true] - Can be dismissed by user
 * @property {Function} [onClose] - Callback when toast closes
 */

let notificationPermission = 'default';
let fcmToken = null;
let messageListeners = [];
let toastContainer = null;

/**
 * Initializes notifications
 * @returns {Promise<Object>} Initialization result
 */
export async function initNotifications() {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return {
        success: false,
        error: 'Notifications not supported'
      };
    }
    
    notificationPermission = Notification.permission;
    
    // Setup toast container
    setupToastContainer();
    
    // Setup FCM if messaging is available
    const messaging = getMessagingInstance();
    if (messaging) {
      await setupFCM(messaging);
    }
    
    return {
      success: true,
      permission: notificationPermission,
      token: fcmToken
    };
  } catch (error) {
    console.error('Init notifications error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Requests notification permission
 * @returns {Promise<string>} Permission status
 */
export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    
    if (permission === 'granted') {
      const messaging = getMessagingInstance();
      if (messaging) {
        await setupFCM(messaging);
      }
    }
    
    return permission;
  } catch (error) {
    console.error('Request permission error:', error);
    return 'denied';
  }
}

/**
 * Gets current notification permission
 * @returns {string} Permission status
 */
export function getNotificationPermission() {
  return notificationPermission;
}

/**
 * Gets FCM token
 * @returns {string|null} FCM token
 */
export function getFCMToken() {
  return fcmToken;
}

/**
 * Shows a browser notification
 * @param {string} title - Notification title
 * @param {Object} [options] - Notification options
 * @returns {Notification|null} Notification instance
 */
export function showNotification(title, options = {}) {
  try {
    if (notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }
    
    const notification = new Notification(title, {
      icon: '/images/icon.png',
      badge: '/images/badge.png',
      ...options
    });
    
    // Auto close after duration
    if (options.duration) {
      setTimeout(() => notification.close(), options.duration);
    }
    
    return notification;
  } catch (error) {
    console.error('Show notification error:', error);
    return null;
  }
}

/**
 * Shows a toast notification
 * @param {string} message - Toast message
 * @param {ToastOptions} [options] - Toast options
 * @returns {HTMLElement} Toast element
 */
export function showToast(message, options = {}) {
  const {
    type = TOAST_TYPES.INFO,
    duration = TOAST_DURATION.MEDIUM,
    dismissible = true,
    onClose = null
  } = options;
  
  if (!toastContainer) {
    setupToastContainer();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  
  // Create content
  const content = document.createElement('div');
  content.className = 'toast-content';
  content.textContent = message;
  toast.appendChild(content);
  
  // Add close button if dismissible
  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => closeToast(toast, onClose);
    toast.appendChild(closeBtn);
  }
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto close
  if (duration > 0) {
    setTimeout(() => closeToast(toast, onClose), duration);
  }
  
  return toast;
}

/**
 * Shows a success toast
 * @param {string} message - Message
 * @param {number} [duration] - Duration
 * @returns {HTMLElement} Toast element
 */
export function showSuccess(message, duration = TOAST_DURATION.MEDIUM) {
  return showToast(message, { type: TOAST_TYPES.SUCCESS, duration });
}

/**
 * Shows an error toast
 * @param {string} message - Message
 * @param {number} [duration] - Duration
 * @returns {HTMLElement} Toast element
 */
export function showError(message, duration = TOAST_DURATION.LONG) {
  return showToast(message, { type: TOAST_TYPES.ERROR, duration });
}

/**
 * Shows a warning toast
 * @param {string} message - Message
 * @param {number} [duration] - Duration
 * @returns {HTMLElement} Toast element
 */
export function showWarning(message, duration = TOAST_DURATION.MEDIUM) {
  return showToast(message, { type: TOAST_TYPES.WARNING, duration });
}

/**
 * Shows an info toast
 * @param {string} message - Message
 * @param {number} [duration] - Duration
 * @returns {HTMLElement} Toast element
 */
export function showInfo(message, duration = TOAST_DURATION.MEDIUM) {
  return showToast(message, { type: TOAST_TYPES.INFO, duration });
}

/**
 * Closes a toast
 * @param {HTMLElement} toast - Toast element
 * @param {Function} [callback] - Close callback
 */
function closeToast(toast, callback) {
  toast.classList.remove('show');
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
    
    if (callback) {
      callback();
    }
  }, 300);
}

/**
 * Clears all toasts
 */
export function clearAllToasts() {
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }
}

/**
 * Subscribes to FCM messages
 * @param {Function} callback - Message callback
 * @returns {Function} Unsubscribe function
 */
export function onMessageReceived(callback) {
  messageListeners.push(callback);
  
  return () => {
    messageListeners = messageListeners.filter(cb => cb !== callback);
  };
}

/**
 * Shows a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Object} [options] - Dialog options
 * @returns {Promise<boolean>} User choice
 */
export function showConfirm(message, options = {}) {
  const {
    title = 'Confirm',
    confirmText = 'OK',
    cancelText = 'Cancel'
  } = options;
  
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'notification-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    
    // Title
    const titleEl = document.createElement('h3');
    titleEl.id = 'dialog-title';
    titleEl.textContent = title;
    dialog.appendChild(titleEl);
    
    // Message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    dialog.appendChild(messageEl);
    
    // Buttons
    const buttons = document.createElement('div');
    buttons.className = 'notification-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-primary';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };
    
    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    dialog.appendChild(buttons);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Focus confirm button
    confirmBtn.focus();
  });
}

/**
 * Shows an alert dialog
 * @param {string} message - Alert message
 * @param {string} [title='Alert'] - Dialog title
 * @returns {Promise<void>}
 */
export function showAlert(message, title = 'Alert') {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'notification-dialog';
    dialog.setAttribute('role', 'alertdialog');
    
    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    dialog.appendChild(titleEl);
    
    // Message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    dialog.appendChild(messageEl);
    
    // Button
    const buttons = document.createElement('div');
    buttons.className = 'notification-buttons';
    
    const okBtn = document.createElement('button');
    okBtn.className = 'btn-primary';
    okBtn.textContent = 'OK';
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };
    
    buttons.appendChild(okBtn);
    dialog.appendChild(buttons);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Focus OK button
    okBtn.focus();
  });
}

// Private helper functions

/**
 * Sets up FCM
 */
async function setupFCM(messaging) {
  try {
    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key
    });
    
    if (currentToken) {
      fcmToken = currentToken;
      console.log('FCM token:', currentToken);
      
      // Setup message listener
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        
        // Notify listeners
        messageListeners.forEach(callback => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Message listener error:', error);
          }
        });
        
        // Show notification
        if (payload.notification) {
          showToast(payload.notification.body || 'New notification', {
            type: TOAST_TYPES.INFO,
            duration: TOAST_DURATION.LONG
          });
        }
      });
    } else {
      console.warn('No FCM token available');
    }
  } catch (error) {
    console.error('FCM setup error:', error);
  }
}

/**
 * Sets up toast container
 */
function setupToastContainer() {
  if (toastContainer) return;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(toastContainer);
  
  // Add styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      }
      .toast {
        background: #333;
        color: white;
        padding: 16px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      }
      .toast.show {
        opacity: 1;
        transform: translateX(0);
      }
      .toast-success { background: #10b981; }
      .toast-error { background: #ef4444; }
      .toast-warning { background: #f59e0b; }
      .toast-info { background: #3b82f6; }
      .toast-content { flex: 1; }
      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        margin-left: 12px;
        line-height: 1;
        opacity: 0.7;
      }
      .toast-close:hover { opacity: 1; }
      .notification-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .notification-dialog {
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      }
      .notification-dialog h3 {
        margin: 0 0 16px 0;
        font-size: 20px;
      }
      .notification-dialog p {
        margin: 0 0 24px 0;
        line-height: 1.5;
      }
      .notification-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      .notification-buttons button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }
      .btn-primary {
        background: #3b82f6;
        color: white;
      }
      .btn-primary:hover {
        background: #2563eb;
      }
      .btn-secondary {
        background: #e5e7eb;
        color: #374151;
      }
      .btn-secondary:hover {
        background: #d1d5db;
      }
      @media (max-width: 640px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default {
  initNotifications,
  requestNotificationPermission,
  getNotificationPermission,
  getFCMToken,
  showNotification,
  showToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  clearAllToasts,
  onMessageReceived,
  showConfirm,
  showAlert
};
