/**
 * Shopping Cart Management
 * @module cart
 */

import { STORAGE_KEYS, COLLECTIONS } from './constants.js';
import { getDocument, setDocument, listenToDocument } from './firestore.js';
import { getCurrentUser, isAuthenticated } from './auth.js';
import { safeJsonParse, safeJsonStringify } from './utils.js';

/**
 * @typedef {Object} CartItem
 * @property {string} id - Item ID
 * @property {string} name - Item name
 * @property {number} price - Item price
 * @property {number} quantity - Quantity
 * @property {string} [image] - Item image URL
 * @property {Object} [customizations] - Item customizations
 */

let cart = {
  items: [],
  total: 0,
  itemCount: 0
};

let cartListeners = [];
let firestoreUnsubscribe = null;

/**
 * Initializes cart from localStorage or Firestore
 * @returns {Promise<Object>} Initialized cart
 */
export async function initCart() {
  try {
    if (isAuthenticated()) {
      // Load from Firestore for authenticated users
      const user = getCurrentUser();
      await syncFromFirestore(user.uid);
      
      // Setup real-time listener
      setupFirestoreListener(user.uid);
    } else {
      // Load from localStorage for guests
      loadFromLocalStorage();
    }
    
    return cart;
  } catch (error) {
    console.error('Init cart error:', error);
    loadFromLocalStorage();
    return cart;
  }
}

/**
 * Gets current cart
 * @returns {Object} Current cart
 */
export function getCart() {
  return { ...cart };
}

/**
 * Adds item to cart
 * @param {CartItem} item - Item to add
 * @returns {Promise<Object>} Updated cart
 */
export async function addToCart(item) {
  try {
    const existingIndex = cart.items.findIndex(i => 
      i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
    );
    
    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.items.push({
        ...item,
        quantity: item.quantity || 1
      });
    }
    
    recalculateCart();
    await saveCart();
    notifyListeners();
    
    return cart;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
}

/**
 * Updates item quantity in cart
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 * @param {Object} [customizations] - Item customizations
 * @returns {Promise<Object>} Updated cart
 */
export async function updateCartItem(itemId, quantity, customizations = null) {
  try {
    const index = cart.items.findIndex(i => 
      i.id === itemId && 
      (customizations === null || JSON.stringify(i.customizations) === JSON.stringify(customizations))
    );
    
    if (index !== -1) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
      
      recalculateCart();
      await saveCart();
      notifyListeners();
    }
    
    return cart;
  } catch (error) {
    console.error('Update cart item error:', error);
    throw error;
  }
}

/**
 * Removes item from cart
 * @param {string} itemId - Item ID
 * @param {Object} [customizations] - Item customizations
 * @returns {Promise<Object>} Updated cart
 */
export async function removeFromCart(itemId, customizations = null) {
  try {
    const index = cart.items.findIndex(i => 
      i.id === itemId && 
      (customizations === null || JSON.stringify(i.customizations) === JSON.stringify(customizations))
    );
    
    if (index !== -1) {
      cart.items.splice(index, 1);
      recalculateCart();
      await saveCart();
      notifyListeners();
    }
    
    return cart;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
}

/**
 * Clears all items from cart
 * @returns {Promise<Object>} Empty cart
 */
export async function clearCart() {
  try {
    cart = {
      items: [],
      total: 0,
      itemCount: 0
    };
    
    await saveCart();
    notifyListeners();
    
    return cart;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
}

/**
 * Gets item count in cart
 * @returns {number} Total item count
 */
export function getCartItemCount() {
  return cart.itemCount;
}

/**
 * Gets cart total
 * @returns {number} Cart total
 */
export function getCartTotal() {
  return cart.total;
}

/**
 * Checks if item is in cart
 * @param {string} itemId - Item ID
 * @param {Object} [customizations] - Item customizations
 * @returns {boolean} True if in cart
 */
export function isInCart(itemId, customizations = null) {
  return cart.items.some(i => 
    i.id === itemId && 
    (customizations === null || JSON.stringify(i.customizations) === JSON.stringify(customizations))
  );
}

/**
 * Gets item quantity in cart
 * @param {string} itemId - Item ID
 * @param {Object} [customizations] - Item customizations
 * @returns {number} Quantity
 */
export function getItemQuantity(itemId, customizations = null) {
  const item = cart.items.find(i => 
    i.id === itemId && 
    (customizations === null || JSON.stringify(i.customizations) === JSON.stringify(customizations))
  );
  
  return item ? item.quantity : 0;
}

/**
 * Subscribes to cart changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onCartChange(callback) {
  cartListeners.push(callback);
  
  // Call immediately with current cart
  callback(cart);
  
  return () => {
    cartListeners = cartListeners.filter(cb => cb !== callback);
  };
}

/**
 * Applies a coupon code
 * @param {string} couponCode - Coupon code
 * @returns {Promise<Object>} Result with discount info
 */
export async function applyCoupon(couponCode) {
  try {
    // This would typically call a Cloud Function to validate the coupon
    // For now, return a mock implementation
    return {
      success: true,
      discount: 0,
      message: 'Coupon functionality to be implemented'
    };
  } catch (error) {
    console.error('Apply coupon error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validates cart before checkout
 * @returns {Object} Validation result
 */
export function validateCart() {
  if (cart.items.length === 0) {
    return {
      isValid: false,
      error: 'Cart is empty'
    };
  }
  
  // Check for invalid items
  const invalidItems = cart.items.filter(item => 
    !item.id || !item.name || !item.price || item.quantity <= 0
  );
  
  if (invalidItems.length > 0) {
    return {
      isValid: false,
      error: 'Cart contains invalid items'
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Merges guest cart with user cart after login
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Merged cart
 */
export async function mergeGuestCart(userId) {
  try {
    const guestCart = { ...cart };
    
    // Load user's existing cart
    await syncFromFirestore(userId);
    
    // Merge guest items
    guestCart.items.forEach(guestItem => {
      const existingIndex = cart.items.findIndex(i => 
        i.id === guestItem.id && 
        JSON.stringify(i.customizations) === JSON.stringify(guestItem.customizations)
      );
      
      if (existingIndex !== -1) {
        cart.items[existingIndex].quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    });
    
    recalculateCart();
    await saveCart();
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.CART);
    
    // Setup listener
    setupFirestoreListener(userId);
    
    notifyListeners();
    
    return cart;
  } catch (error) {
    console.error('Merge guest cart error:', error);
    throw error;
  }
}

// Private helper functions

/**
 * Recalculates cart totals
 */
function recalculateCart() {
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Saves cart to localStorage or Firestore
 */
async function saveCart() {
  if (isAuthenticated()) {
    await saveToFirestore();
  } else {
    saveToLocalStorage();
  }
}

/**
 * Saves cart to localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, safeJsonStringify(cart));
  } catch (error) {
    console.error('Save to localStorage error:', error);
  }
}

/**
 * Loads cart from localStorage
 */
function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    if (stored) {
      const parsed = safeJsonParse(stored, { items: [], total: 0, itemCount: 0 });
      cart = parsed;
      recalculateCart();
    }
  } catch (error) {
    console.error('Load from localStorage error:', error);
  }
}

/**
 * Saves cart to Firestore
 */
async function saveToFirestore() {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    await setDocument(COLLECTIONS.CARTS, user.uid, cart, true);
  } catch (error) {
    console.error('Save to Firestore error:', error);
  }
}

/**
 * Syncs cart from Firestore
 */
async function syncFromFirestore(userId) {
  try {
    const result = await getDocument(COLLECTIONS.CARTS, userId);
    
    if (result.success && result.data) {
      cart = {
        items: result.data.items || [],
        total: result.data.total || 0,
        itemCount: result.data.itemCount || 0
      };
      recalculateCart();
    }
  } catch (error) {
    console.error('Sync from Firestore error:', error);
  }
}

/**
 * Sets up Firestore real-time listener
 */
function setupFirestoreListener(userId) {
  // Remove existing listener
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe();
  }
  
  // Setup new listener
  firestoreUnsubscribe = listenToDocument(
    COLLECTIONS.CARTS,
    userId,
    (data) => {
      if (data) {
        cart = {
          items: data.items || [],
          total: data.total || 0,
          itemCount: data.itemCount || 0
        };
        recalculateCart();
        notifyListeners();
      }
    },
    (error) => {
      console.error('Cart listener error:', error);
    }
  );
}

/**
 * Notifies all listeners of cart changes
 */
function notifyListeners() {
  cartListeners.forEach(callback => {
    try {
      callback(cart);
    } catch (error) {
      console.error('Cart listener callback error:', error);
    }
  });
}

/**
 * Cleans up resources
 */
export function cleanupCart() {
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe();
    firestoreUnsubscribe = null;
  }
  cartListeners = [];
}

export default {
  initCart,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
  isInCart,
  getItemQuantity,
  onCartChange,
  applyCoupon,
  validateCart,
  mergeGuestCart,
  cleanupCart
};
