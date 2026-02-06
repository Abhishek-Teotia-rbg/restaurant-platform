/**
 * Image Upload Component
 * Handles image upload with preview and validation
 * @module components/image-upload
 */

/**
 * @typedef {Object} ImageUploadConfig
 * @property {Function} [onUpload] - Upload callback with file
 * @property {Function} [onRemove] - Remove callback
 * @property {string} [accept] - Accepted file types
 * @property {number} [maxSize] - Max file size in bytes
 * @property {number} [maxFiles] - Maximum number of files
 * @property {boolean} [multiple] - Allow multiple uploads
 * @property {string} [previewUrl] - Initial preview image URL
 * @property {Array<string>} [previewUrls] - Initial preview URLs for multiple
 * @property {string} [uploadText] - Upload button text
 * @property {string} [dragText] - Drag and drop text
 */

/**
 * Renders image upload component
 * @param {ImageUploadConfig} config - Upload configuration
 * @returns {HTMLElement} Image upload element
 */
export function render(config = {}) {
  const {
    onUpload = null,
    onRemove = null,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 1,
    multiple = false,
    previewUrl = null,
    previewUrls = [],
    uploadText = 'Upload Image',
    dragText = 'Drag and drop image here'
  } = config;

  const upload = document.createElement('div');
  upload.className = 'image-upload-container';

  const initialPreviews = previewUrl ? [previewUrl] : previewUrls;
  const uploadedFiles = [];

  upload.innerHTML = `
    <div class="image-upload-area ${initialPreviews.length > 0 ? 'has-preview' : ''}" data-drag="false">
      <input type="file" 
             class="image-upload-input" 
             accept="${accept}"
             ${multiple ? 'multiple' : ''}
             style="display: none;">
      
      <div class="upload-placeholder">
        <svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p class="upload-text">${uploadText}</p>
        <p class="upload-hint">${dragText}</p>
        <p class="upload-info">Max size: ${formatFileSize(maxSize)}</p>
      </div>

      <div class="image-previews">
        ${initialPreviews.map((url, index) => renderPreview(url, index)).join('')}
      </div>
    </div>

    <div class="upload-error hidden"></div>
  `;

  const input = upload.querySelector('.image-upload-input');
  const uploadArea = upload.querySelector('.image-upload-area');
  const previewsContainer = upload.querySelector('.image-previews');
  const errorDiv = upload.querySelector('.upload-error');
  const placeholder = upload.querySelector('.upload-placeholder');

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (!e.target.closest('.preview-remove')) {
      input.click();
    }
  });

  // File selection
  input.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.dataset.drag = 'true';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.dataset.drag = 'false';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.dataset.drag = 'false';
    handleFiles(e.dataTransfer.files);
  });

  // Handle file upload
  function handleFiles(files) {
    errorDiv.classList.add('hidden');

    if (files.length === 0) return;

    // Check max files
    if (uploadedFiles.length + files.length > maxFiles) {
      showError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
      return;
    }

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        showError(`File size must be less than ${formatFileSize(maxSize)}`);
        return;
      }

      // Read and preview file
      const reader = new FileReader();
      reader.onload = (e) => {
        const index = uploadedFiles.length;
        uploadedFiles.push({ file, url: e.target.result });

        // Add preview
        const previewHTML = renderPreview(e.target.result, index);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = previewHTML;
        const previewElement = tempDiv.firstElementChild;
        previewsContainer.appendChild(previewElement);

        // Setup remove handler for new preview
        setupRemoveHandler(previewElement, index);

        uploadArea.classList.add('has-preview');
        
        if (onUpload) {
          onUpload(file, e.target.result, index);
        }
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  // Setup remove handlers for initial previews
  upload.querySelectorAll('.image-preview').forEach((preview, index) => {
    setupRemoveHandler(preview, index);
  });

  function setupRemoveHandler(preview, index) {
    const removeBtn = preview.querySelector('.preview-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        preview.remove();
        uploadedFiles.splice(index, 1);

        if (uploadedFiles.length === 0 && previewsContainer.children.length === 0) {
          uploadArea.classList.remove('has-preview');
        }

        if (onRemove) {
          onRemove(index);
        }
      });
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  }

  return upload;
}

/**
 * Renders image preview
 * @param {string} url - Image URL
 * @param {number} index - Preview index
 * @returns {string} HTML string
 */
function renderPreview(url, index) {
  return `
    <div class="image-preview" data-index="${index}">
      <img src="${url}" alt="Preview ${index + 1}">
      <button class="preview-remove" aria-label="Remove image">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
}

/**
 * Formats file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets uploaded files
 * @param {HTMLElement} upload - Upload element
 * @returns {Array<{file: File, url: string}>} Uploaded files
 */
export function getFiles(upload) {
  const files = [];
  
  upload.querySelectorAll('.image-preview').forEach(preview => {
    const img = preview.querySelector('img');
    if (img) {
      files.push({ url: img.src });
    }
  });

  return files;
}

/**
 * Clears all previews
 * @param {HTMLElement} upload - Upload element
 */
export function clear(upload) {
  const previewsContainer = upload.querySelector('.image-previews');
  const uploadArea = upload.querySelector('.image-upload-area');
  
  if (previewsContainer) {
    previewsContainer.innerHTML = '';
  }
  
  if (uploadArea) {
    uploadArea.classList.remove('has-preview');
  }

  const input = upload.querySelector('.image-upload-input');
  if (input) {
    input.value = '';
  }
}

/**
 * Sets preview images
 * @param {HTMLElement} upload - Upload element
 * @param {Array<string>} urls - Image URLs
 */
export function setPreviews(upload, urls) {
  clear(upload);
  
  const previewsContainer = upload.querySelector('.image-previews');
  const uploadArea = upload.querySelector('.image-upload-area');
  
  if (urls && urls.length > 0) {
    urls.forEach((url, index) => {
      const previewHTML = renderPreview(url, index);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = previewHTML;
      previewsContainer.appendChild(tempDiv.firstElementChild);
    });
    
    uploadArea.classList.add('has-preview');
  }
}
