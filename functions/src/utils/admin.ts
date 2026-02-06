import * as admin from 'firebase-admin';

let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * Ensures admin is initialized only once
 */
export function initializeAdmin(): void {
  if (!initialized) {
    admin.initializeApp();
    initialized = true;
  }
}

initializeAdmin();

export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();
export const storage = admin.storage();

export { admin };
