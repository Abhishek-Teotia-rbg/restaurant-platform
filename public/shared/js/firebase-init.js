/**
 * Firebase Initialization Module
 * @module firebase-init
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, connectStorageEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getMessaging, isSupported } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { getFunctions, connectFunctionsEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';

/**
 * @typedef {Object} FirebaseServices
 * @property {Object} app - Firebase app instance
 * @property {Object} auth - Firebase Auth instance
 * @property {Object} db - Firestore instance
 * @property {Object} storage - Firebase Storage instance
 * @property {Object|null} messaging - Firebase Messaging instance (null if not supported)
 * @property {Object} functions - Firebase Functions instance
 */

let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;
let messaging = null;
let functions = null;
let isInitialized = false;

/**
 * Gets the Firebase configuration based on environment
 * @returns {Promise<Object>} Firebase configuration object
 * @throws {Error} If config cannot be loaded
 */
async function getFirebaseConfig() {
  try {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    // Dynamic import based on environment
    const configModule = isProduction
      ? await import('./firebase-config.prod.js')
      : await import('./firebase-config.dev.js');
    
    return configModule.firebaseConfig;
  } catch (error) {
    console.error('Error loading Firebase config:', error);
    throw new Error('Failed to load Firebase configuration');
  }
}

/**
 * Checks if Firebase emulator should be used
 * @returns {boolean} True if running on localhost
 */
function shouldUseEmulator() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Initializes Firebase services
 * @param {Object} [customConfig] - Optional custom Firebase configuration
 * @returns {Promise<FirebaseServices>} Firebase services object
 * @throws {Error} If initialization fails
 */
export async function initializeFirebase(customConfig = null) {
  if (isInitialized) {
    return getFirebaseServices();
  }

  try {
    // Check if Firebase app already exists
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
    } else {
      const config = customConfig || await getFirebaseConfig();
      firebaseApp = initializeApp(config);
    }

    // Initialize Auth
    auth = getAuth(firebaseApp);
    
    // Initialize Firestore
    db = getFirestore(firebaseApp);
    
    // Initialize Storage
    storage = getStorage(firebaseApp);
    
    // Initialize Functions
    functions = getFunctions(firebaseApp);
    
    // Initialize Messaging (if supported)
    try {
      const messagingSupported = await isSupported();
      if (messagingSupported) {
        messaging = getMessaging(firebaseApp);
      } else {
        console.warn('Firebase Messaging is not supported in this browser');
        messaging = null;
      }
    } catch (error) {
      console.warn('Firebase Messaging initialization failed:', error);
      messaging = null;
    }

    // Connect to emulators if in development
    if (shouldUseEmulator()) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Emulator connection failed (may already be connected):', error.message);
      }
    }

    isInitialized = true;
    console.log('Firebase initialized successfully');

    return getFirebaseServices();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error(`Failed to initialize Firebase: ${error.message}`);
  }
}

/**
 * Gets initialized Firebase services
 * @returns {FirebaseServices} Firebase services object
 * @throws {Error} If Firebase is not initialized
 */
export function getFirebaseServices() {
  if (!isInitialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }

  return {
    app: firebaseApp,
    auth,
    db,
    storage,
    messaging,
    functions
  };
}

/**
 * Gets Firebase Auth instance
 * @returns {Object} Firebase Auth instance
 * @throws {Error} If Firebase is not initialized
 */
export function getAuthInstance() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

/**
 * Gets Firestore instance
 * @returns {Object} Firestore instance
 * @throws {Error} If Firebase is not initialized
 */
export function getFirestoreInstance() {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

/**
 * Gets Firebase Storage instance
 * @returns {Object} Firebase Storage instance
 * @throws {Error} If Firebase is not initialized
 */
export function getStorageInstance() {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }
  return storage;
}

/**
 * Gets Firebase Messaging instance
 * @returns {Object|null} Firebase Messaging instance or null if not supported
 */
export function getMessagingInstance() {
  return messaging;
}

/**
 * Gets Firebase Functions instance
 * @returns {Object} Firebase Functions instance
 * @throws {Error} If Firebase is not initialized
 */
export function getFunctionsInstance() {
  if (!functions) {
    throw new Error('Firebase Functions not initialized');
  }
  return functions;
}

/**
 * Checks if Firebase is initialized
 * @returns {boolean} True if initialized
 */
export function isFirebaseInitialized() {
  return isInitialized;
}

/**
 * Auto-initialize Firebase when module is loaded
 */
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('Auto-initialization failed:', error);
    }
  });
}

export default {
  initializeFirebase,
  getFirebaseServices,
  getAuthInstance,
  getFirestoreInstance,
  getStorageInstance,
  getMessagingInstance,
  getFunctionsInstance,
  isFirebaseInitialized
};
