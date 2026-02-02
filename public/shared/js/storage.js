/**
 * Firebase Storage Utilities
 * @module storage
 */

import { getStorageInstance } from './firebase-init.js';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { FIREBASE_ERROR_CODES, DEFAULTS } from './constants.js';

/**
 * @typedef {Object} StorageResult
 * @property {boolean} success - Whether operation succeeded
 * @property {*} [data] - Data if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} UploadProgress
 * @property {number} progress - Upload progress percentage (0-100)
 * @property {number} bytesTransferred - Bytes transferred
 * @property {number} totalBytes - Total bytes
 */

/**
 * Uploads a file to Firebase Storage
 * @param {File|Blob} file - File to upload
 * @param {string} path - Storage path
 * @param {Object} [metadata] - Optional file metadata
 * @returns {Promise<StorageResult>} Upload result with download URL
 */
export async function uploadFile(file, path, metadata = {}) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    
    const uploadMetadata = {
      contentType: file.type,
      ...metadata
    };
    
    const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      data: {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        metadata: snapshot.metadata
      }
    };
  } catch (error) {
    console.error('Upload file error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Uploads a file with progress tracking
 * @param {File|Blob} file - File to upload
 * @param {string} path - Storage path
 * @param {Function} onProgress - Progress callback
 * @param {Object} [metadata] - Optional file metadata
 * @returns {Promise<StorageResult>} Upload result
 */
export async function uploadFileWithProgress(file, path, onProgress, metadata = {}) {
  return new Promise((resolve) => {
    try {
      const storage = getStorageInstance();
      const storageRef = ref(storage, path);
      
      const uploadMetadata = {
        contentType: file.type,
        ...metadata
      };
      
      const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            progress,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            state: snapshot.state
          });
        },
        (error) => {
          console.error('Upload error:', error);
          resolve({
            success: false,
            error: FIREBASE_ERROR_CODES[error.code] || error.message
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              data: {
                url: downloadURL,
                path: uploadTask.snapshot.ref.fullPath,
                metadata: uploadTask.snapshot.metadata
              }
            });
          } catch (error) {
            resolve({
              success: false,
              error: error.message
            });
          }
        }
      );
    } catch (error) {
      console.error('Upload initialization error:', error);
      resolve({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Uploads a data URL/base64 string
 * @param {string} dataUrl - Data URL string
 * @param {string} path - Storage path
 * @param {Object} [metadata] - Optional file metadata
 * @returns {Promise<StorageResult>} Upload result
 */
export async function uploadDataURL(dataUrl, path, metadata = {}) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url', metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      data: {
        url: downloadURL,
        path: snapshot.ref.fullPath
      }
    };
  } catch (error) {
    console.error('Upload data URL error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Downloads a file URL
 * @param {string} path - Storage path
 * @returns {Promise<StorageResult>} Download URL
 */
export async function getFileURL(path) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      success: true,
      data: { url: downloadURL }
    };
  } catch (error) {
    console.error('Get file URL error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Deletes a file from storage
 * @param {string} path - Storage path
 * @returns {Promise<StorageResult>} Result
 */
export async function deleteFile(path) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Lists all files in a directory
 * @param {string} path - Directory path
 * @returns {Promise<StorageResult>} List of files
 */
export async function listFiles(path) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = result.items.map(item => ({
      name: item.name,
      fullPath: item.fullPath,
      bucket: item.bucket
    }));
    
    const folders = result.prefixes.map(prefix => ({
      name: prefix.name,
      fullPath: prefix.fullPath
    }));
    
    return {
      success: true,
      data: { files, folders }
    };
  } catch (error) {
    console.error('List files error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Gets file metadata
 * @param {string} path - Storage path
 * @returns {Promise<StorageResult>} File metadata
 */
export async function getFileMetadata(path) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    
    return {
      success: true,
      data: metadata
    };
  } catch (error) {
    console.error('Get metadata error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Updates file metadata
 * @param {string} path - Storage path
 * @param {Object} metadata - New metadata
 * @returns {Promise<StorageResult>} Updated metadata
 */
export async function updateFileMetadata(path, metadata) {
  try {
    const storage = getStorageInstance();
    const storageRef = ref(storage, path);
    const updatedMetadata = await updateMetadata(storageRef, metadata);
    
    return {
      success: true,
      data: updatedMetadata
    };
  } catch (error) {
    console.error('Update metadata error:', error);
    return {
      success: false,
      error: FIREBASE_ERROR_CODES[error.code] || error.message
    };
  }
}

/**
 * Validates file before upload
 * @param {File} file - File to validate
 * @param {Object} [options] - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = DEFAULTS.IMAGE_MAX_SIZE_MB * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;
  
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Check file extension
  if (allowedExtensions && allowedExtensions.length > 0) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: 'File extension not allowed' };
    }
  }
  
  return { isValid: true };
}

/**
 * Generates a unique file path
 * @param {string} directory - Directory path
 * @param {string} fileName - Original file name
 * @param {string} [userId] - Optional user ID
 * @returns {string} Unique file path
 */
export function generateFilePath(directory, fileName, userId = null) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  
  const uniqueName = `${sanitizedName}_${timestamp}_${randomStr}.${extension}`;
  
  if (userId) {
    return `${directory}/${userId}/${uniqueName}`;
  }
  
  return `${directory}/${uniqueName}`;
}

/**
 * Uploads an image with automatic resizing (client-side)
 * @param {File} file - Image file
 * @param {string} path - Storage path
 * @param {Object} [options] - Resize options
 * @returns {Promise<StorageResult>} Upload result
 */
export async function uploadImage(file, path, options = {}) {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.9
    } = options;
    
    // Validate file
    const validation = validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }
    
    // Resize image
    const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality);
    
    // Upload resized image
    return await uploadFile(resizedBlob, path, {
      contentType: file.type
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Resizes an image file
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<Blob>} Resized image blob
 */
export function resizeImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Image load failed'));
    };
    
    reader.onerror = () => {
      reject(new Error('File read failed'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads file from URL to local device
 * @param {string} url - File URL
 * @param {string} [fileName='download'] - Download file name
 * @returns {Promise<boolean>} Success status
 */
export async function downloadFileToDevice(url, fileName = 'download') {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error('Download file error:', error);
    return false;
  }
}

/**
 * Converts File to Data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Data URL
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a storage reference path for user uploads
 * @param {string} userId - User ID
 * @param {string} category - Upload category (e.g., 'profile', 'orders')
 * @param {string} fileName - File name
 * @returns {string} Storage path
 */
export function createUserUploadPath(userId, category, fileName) {
  return generateFilePath(`users/${userId}/${category}`, fileName);
}

/**
 * Batch deletes multiple files
 * @param {Array<string>} paths - Array of file paths
 * @returns {Promise<Object>} Results object with success/failure counts
 */
export async function batchDeleteFiles(paths) {
  const results = {
    total: paths.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  await Promise.all(
    paths.map(async (path) => {
      const result = await deleteFile(path);
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({ path, error: result.error });
      }
    })
  );
  
  return results;
}

export default {
  uploadFile,
  uploadFileWithProgress,
  uploadDataURL,
  getFileURL,
  deleteFile,
  listFiles,
  getFileMetadata,
  updateFileMetadata,
  validateFile,
  generateFilePath,
  uploadImage,
  resizeImage,
  downloadFileToDevice,
  fileToDataURL,
  createUserUploadPath,
  batchDeleteFiles
};
