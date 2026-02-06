/**
 * Firestore Database Utilities
 * @module firestore
 */

import { getFirestoreInstance } from './firebase-init.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { FIREBASE_ERROR_CODES } from './constants.js';

/**
 * @typedef {Object} FirestoreResult
 * @property {boolean} success - Whether operation succeeded
 * @property {*} [data] - Data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * Gets a document by ID
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<FirestoreResult>} Document data
 */
export async function getDocument(collectionName, documentId) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      return {
        success: false,
        error: 'Document not found'
      };
    }
  } catch (error) {
    console.error('Get document error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Gets multiple documents from a collection
 * @param {string} collectionName - Collection name
 * @param {Object} [options] - Query options
 * @returns {Promise<FirestoreResult>} Array of documents
 */
export async function getDocuments(collectionName, options = {}) {
  try {
    const db = getFirestoreInstance();
    let q = collection(db, collectionName);
    
    // Apply filters
    if (options.where) {
      options.where.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    // Apply pagination
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }
    
    if (options.endBefore) {
      q = query(q, endBefore(options.endBefore));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Get documents error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Creates a new document
 * @param {string} collectionName - Collection name
 * @param {Object} data - Document data
 * @param {string} [documentId] - Optional custom document ID
 * @returns {Promise<FirestoreResult>} Created document
 */
export async function createDocument(collectionName, data, documentId = null) {
  try {
    const db = getFirestoreInstance();
    const timestamp = serverTimestamp();
    const docData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    if (documentId) {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, docData);
      
      return {
        success: true,
        data: { id: documentId, ...docData }
      };
    } else {
      const docRef = await addDoc(collection(db, collectionName), docData);
      
      return {
        success: true,
        data: { id: docRef.id, ...docData }
      };
    }
  } catch (error) {
    console.error('Create document error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Updates an existing document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<FirestoreResult>} Result
 */
export async function updateDocument(collectionName, documentId, updates) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      data: { id: documentId, ...updates }
    };
  } catch (error) {
    console.error('Update document error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Sets a document (creates or overwrites)
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Object} data - Document data
 * @param {boolean} [merge=false] - Merge with existing data
 * @returns {Promise<FirestoreResult>} Result
 */
export async function setDocument(collectionName, documentId, data, merge = false) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    const docData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    if (!merge) {
      docData.createdAt = serverTimestamp();
    }
    
    await setDoc(docRef, docData, { merge });
    
    return {
      success: true,
      data: { id: documentId, ...docData }
    };
  } catch (error) {
    console.error('Set document error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Deletes a document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<FirestoreResult>} Result
 */
export async function deleteDocument(collectionName, documentId) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Delete document error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Queries documents with filters
 * @param {string} collectionName - Collection name
 * @param {Array} filters - Array of filter arrays [field, operator, value]
 * @param {Object} [options] - Additional query options
 * @returns {Promise<FirestoreResult>} Query results
 */
export async function queryDocuments(collectionName, filters, options = {}) {
  try {
    const db = getFirestoreInstance();
    let q = collection(db, collectionName);
    
    // Apply filters
    filters.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });
    
    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents
    };
  } catch (error) {
    console.error('Query documents error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Listens to a document in real-time
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Function} callback - Callback function for updates
 * @param {Function} [errorCallback] - Error callback
 * @returns {Function} Unsubscribe function
 */
export function listenToDocument(collectionName, documentId, callback, errorCallback) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Listen to document error:', error);
        if (errorCallback) {
          errorCallback(FIREBASE_ERROR_CODES[error.code] || error.message);
        }
      }
    );
  } catch (error) {
    console.error('Listen to document error:', error);
    if (errorCallback) {
      errorCallback(error.message);
    }
    return () => {};
  }
}

/**
 * Listens to a collection in real-time
 * @param {string} collectionName - Collection name
 * @param {Function} callback - Callback function for updates
 * @param {Object} [options] - Query options
 * @param {Function} [errorCallback] - Error callback
 * @returns {Function} Unsubscribe function
 */
export function listenToCollection(collectionName, callback, options = {}, errorCallback) {
  try {
    const db = getFirestoreInstance();
    let q = collection(db, collectionName);
    
    // Apply filters
    if (options.where) {
      options.where.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      },
      (error) => {
        console.error('Listen to collection error:', error);
        if (errorCallback) {
          errorCallback(FIREBASE_ERROR_CODES[error.code] || error.message);
        }
      }
    );
  } catch (error) {
    console.error('Listen to collection error:', error);
    if (errorCallback) {
      errorCallback(error.message);
    }
    return () => {};
  }
}

/**
 * Performs a batch write operation
 * @param {Array} operations - Array of operations {type, collection, id, data}
 * @returns {Promise<FirestoreResult>} Result
 */
export async function batchWrite(operations) {
  try {
    const db = getFirestoreInstance();
    const batch = writeBatch(db);
    
    operations.forEach(({ type, collection: collectionName, id, data }) => {
      const docRef = doc(db, collectionName, id);
      
      switch (type) {
        case 'set':
          batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'update':
          batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Batch write error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Runs a transaction
 * @param {Function} transactionFn - Transaction function
 * @returns {Promise<FirestoreResult>} Result
 */
export async function runFirestoreTransaction(transactionFn) {
  try {
    const db = getFirestoreInstance();
    
    const result = await runTransaction(db, async (transaction) => {
      return await transactionFn(transaction);
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Transaction error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Increments a numeric field
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {string} field - Field name
 * @param {number} [value=1] - Increment value
 * @returns {Promise<FirestoreResult>} Result
 */
export async function incrementField(collectionName, documentId, field, value = 1) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    await updateDoc(docRef, {
      [field]: increment(value),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Increment field error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Adds item to array field
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {string} field - Field name
 * @param {*} value - Value to add
 * @returns {Promise<FirestoreResult>} Result
 */
export async function addToArray(collectionName, documentId, field, value) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    await updateDoc(docRef, {
      [field]: arrayUnion(value),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Add to array error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Removes item from array field
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {string} field - Field name
 * @param {*} value - Value to remove
 * @returns {Promise<FirestoreResult>} Result
 */
export async function removeFromArray(collectionName, documentId, field, value) {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, collectionName, documentId);
    
    await updateDoc(docRef, {
      [field]: arrayRemove(value),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Remove from array error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Converts Firestore Timestamp to JavaScript Date
 * @param {Timestamp} timestamp - Firestore timestamp
 * @returns {Date|null} JavaScript Date object
 */
export function timestampToDate(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return null;
  }
  return timestamp.toDate();
}

/**
 * Gets server timestamp
 * @returns {Object} Server timestamp object
 */
export function getServerTimestamp() {
  return serverTimestamp();
}

/**
 * Creates a Firestore Timestamp from Date
 * @param {Date} date - JavaScript Date object
 * @returns {Timestamp} Firestore Timestamp
 */
export function dateToTimestamp(date) {
  return Timestamp.fromDate(date);
}

export default {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  queryDocuments,
  listenToDocument,
  listenToCollection,
  batchWrite,
  runFirestoreTransaction,
  incrementField,
  addToArray,
  removeFromArray,
  timestampToDate,
  getServerTimestamp,
  dateToTimestamp
};
