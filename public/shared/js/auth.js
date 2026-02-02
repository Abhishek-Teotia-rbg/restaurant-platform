/**
 * Authentication Utilities
 * @module auth
 */

import { getAuthInstance } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { FIREBASE_ERROR_CODES, USER_ROLES } from './constants.js';

/**
 * @typedef {Object} AuthResult
 * @property {boolean} success - Whether operation succeeded
 * @property {Object} [user] - User object if successful
 * @property {string} [error] - Error message if failed
 */

let currentUser = null;
let authStateListeners = [];

/**
 * Initializes auth state listener
 */
export function initAuthListener() {
  const auth = getAuthInstance();
  
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authStateListeners.forEach(callback => callback(user));
  });
}

/**
 * Subscribes to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  authStateListeners.push(callback);
  
  // Call immediately with current user
  if (currentUser !== null) {
    callback(currentUser);
  }
  
  return () => {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  };
}

/**
 * Signs up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} [userData] - Additional user data
 * @returns {Promise<AuthResult>} Authentication result
 */
export async function signUp(email, password, userData = {}) {
  try {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile if display name provided
    if (userData.displayName) {
      await firebaseUpdateProfile(userCredential.user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL || null
      });
    }
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Signs in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<AuthResult>} Authentication result
 */
export async function signIn(email, password) {
  try {
    const auth = getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Signs in with Google
 * @returns {Promise<AuthResult>} Authentication result
 */
export async function signInWithGoogle() {
  try {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Signs in with Facebook
 * @returns {Promise<AuthResult>} Authentication result
 */
export async function signInWithFacebook() {
  try {
    const auth = getAuthInstance();
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Facebook sign in error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Initializes phone auth with reCAPTCHA
 * @param {string} containerId - ID of container element for reCAPTCHA
 * @returns {RecaptchaVerifier} ReCAPTCHA verifier instance
 */
export function initPhoneAuth(containerId) {
  const auth = getAuthInstance();
  
  return new RecaptchaVerifier(containerId, {
    size: 'normal',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  }, auth);
}

/**
 * Sends OTP to phone number
 * @param {string} phoneNumber - Phone number with country code
 * @param {RecaptchaVerifier} recaptchaVerifier - reCAPTCHA verifier
 * @returns {Promise<Object>} Confirmation result
 */
export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  try {
    const auth = getAuthInstance();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    return {
      success: true,
      confirmationResult
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Verifies OTP and signs in
 * @param {Object} confirmationResult - Confirmation result from sendPhoneOTP
 * @param {string} otp - OTP code
 * @returns {Promise<AuthResult>} Authentication result
 */
export async function verifyPhoneOTP(confirmationResult, otp) {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: 'Invalid OTP. Please try again.'
    };
  }
}

/**
 * Signs out current user
 * @returns {Promise<AuthResult>} Result
 */
export async function logout() {
  try {
    const auth = getAuthInstance();
    await signOut(auth);
    currentUser = null;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gets current authenticated user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  const auth = getAuthInstance();
  return auth.currentUser || currentUser;
}

/**
 * Checks if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Gets current user's ID token
 * @param {boolean} [forceRefresh=false] - Force token refresh
 * @returns {Promise<string|null>} ID token or null
 */
export async function getIdToken(forceRefresh = false) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return null;
    }
    
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
}

/**
 * Updates user profile
 * @param {Object} updates - Profile updates (displayName, photoURL)
 * @returns {Promise<AuthResult>} Result
 */
export async function updateProfile(updates) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await firebaseUpdateProfile(user, updates);
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Updates user email
 * @param {string} newEmail - New email address
 * @returns {Promise<AuthResult>} Result
 */
export async function changeEmail(newEmail) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await updateEmail(user, newEmail);
    await sendEmailVerification(user);
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Change email error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Updates user password
 * @param {string} newPassword - New password
 * @returns {Promise<AuthResult>} Result
 */
export async function changePassword(newPassword) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await updatePassword(user, newPassword);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Sends password reset email
 * @param {string} email - User email
 * @returns {Promise<AuthResult>} Result
 */
export async function resetPassword(email) {
  try {
    const auth = getAuthInstance();
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Sends email verification to current user
 * @returns {Promise<AuthResult>} Result
 */
export async function sendVerificationEmail() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await sendEmailVerification(user);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Send verification email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Checks if user's email is verified
 * @returns {boolean} True if verified
 */
export function isEmailVerified() {
  const user = getCurrentUser();
  return user ? user.emailVerified : false;
}

/**
 * Re-authenticates user with credentials
 * @param {string} password - User's current password
 * @returns {Promise<AuthResult>} Result
 */
export async function reauthenticate(password) {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }
    
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Reauthenticate error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Deletes current user account
 * @returns {Promise<AuthResult>} Result
 */
export async function deleteAccount() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await deleteUser(user);
    currentUser = null;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Gets user metadata
 * @returns {Object|null} User metadata
 */
export function getUserMetadata() {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    createdAt: user.metadata.creationTime,
    lastSignIn: user.metadata.lastSignInTime
  };
}

/**
 * Checks if user has a specific role (requires custom claims)
 * @param {string} role - Role to check
 * @returns {Promise<boolean>} True if user has role
 */
export async function hasRole(role) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }
    
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.role === role || idTokenResult.claims[role] === true;
  } catch (error) {
    console.error('Check role error:', error);
    return false;
  }
}

/**
 * Checks if user is admin
 * @returns {Promise<boolean>} True if admin
 */
export async function isAdmin() {
  return await hasRole(USER_ROLES.ADMIN);
}

/**
 * Waits for auth to be ready
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<Object|null>} Current user or null
 */
export function waitForAuth(timeout = 5000) {
  return new Promise((resolve) => {
    const auth = getAuthInstance();
    
    // If user already available, resolve immediately
    if (auth.currentUser !== null) {
      resolve(auth.currentUser);
      return;
    }
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, timeout);
    
    // Wait for auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(user);
    });
  });
}

// Auto-initialize auth listener
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    try {
      initAuthListener();
    } catch (error) {
      console.error('Auth listener initialization failed:', error);
    }
  });
}

export default {
  initAuthListener,
  onAuthStateChange,
  signUp,
  signIn,
  signInWithGoogle,
  signInWithFacebook,
  initPhoneAuth,
  sendPhoneOTP,
  verifyPhoneOTP,
  logout,
  getCurrentUser,
  isAuthenticated,
  getIdToken,
  updateProfile,
  changeEmail,
  changePassword,
  resetPassword,
  sendVerificationEmail,
  isEmailVerified,
  reauthenticate,
  deleteAccount,
  getUserMetadata,
  hasRole,
  isAdmin,
  waitForAuth
};
