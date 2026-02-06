# JavaScript Utility Modules

Comprehensive JavaScript utility modules for the restaurant platform, providing Firebase integration, authentication, data management, and UI utilities.

## 📦 Modules Overview

### 1. **firebase-init.js**
Firebase initialization and configuration module.

```javascript
import { initializeFirebase, getFirebaseServices } from './firebase-init.js';

// Auto-initializes on page load, or manually:
await initializeFirebase();

// Get services
const { auth, db, storage, messaging, functions } = getFirebaseServices();
```

**Features:**
- Auto environment detection (dev/prod)
- Emulator support for local development
- Service instances: Auth, Firestore, Storage, Messaging, Functions

### 2. **constants.js**
Application-wide constants and enums.

```javascript
import { ORDER_STATUS, PAYMENT_METHODS, COLLECTIONS } from './constants.js';

// Use constants
const status = ORDER_STATUS.PENDING;
const collection = COLLECTIONS.ORDERS;
```

**Includes:**
- Order statuses, payment methods, delivery types
- User roles, item categories, dietary preferences
- Notification types, collection names, storage keys
- Regex patterns, API endpoints, error/success messages
- Default values, HTTP status codes

### 3. **auth.js**
Authentication utilities for user management.

```javascript
import { signIn, signUp, logout, getCurrentUser } from './auth.js';

// Sign up
await signUp('email@example.com', 'password123', { displayName: 'John Doe' });

// Sign in
const result = await signIn('email@example.com', 'password123');

// Get current user
const user = getCurrentUser();

// Listen to auth state
const unsubscribe = onAuthStateChange((user) => {
  console.log('Auth state:', user);
});
```

**Features:**
- Email/password authentication
- Social login (Google, Facebook)
- Phone authentication with OTP
- Profile management
- Password reset
- Email verification
- Role checking

### 4. **firestore.js**
Firestore database operations.

```javascript
import { getDocument, createDocument, queryDocuments, listenToCollection } from './firestore.js';

// Create document
await createDocument('orders', {
  userId: 'user123',
  items: [...],
  total: 299
});

// Query documents
const { data } = await queryDocuments('orders', [
  ['userId', '==', 'user123'],
  ['status', '==', 'pending']
]);

// Real-time listener
const unsubscribe = listenToCollection('orders', (orders) => {
  console.log('Orders updated:', orders);
});
```

**Features:**
- CRUD operations
- Advanced queries with filters
- Real-time listeners
- Batch operations
- Transactions
- Array and field operations

### 5. **storage.js**
Firebase Storage file operations.

```javascript
import { uploadFile, uploadFileWithProgress, deleteFile } from './storage.js';

// Upload file
const result = await uploadFile(file, 'images/profile.jpg');
console.log('Download URL:', result.data.url);

// Upload with progress
await uploadFileWithProgress(file, path, (progress) => {
  console.log(`Upload: ${progress.progress}%`);
});

// Delete file
await deleteFile('images/old-photo.jpg');
```

**Features:**
- File upload/download/delete
- Progress tracking
- Image resizing
- File validation
- Metadata management
- Batch operations

### 6. **validators.js**
Input validation utilities.

```javascript
import { isValidEmail, validatePassword, validateAddress } from './validators.js';

// Validate email
if (isValidEmail('user@example.com')) { }

// Validate password
const result = validatePassword('MyPass123!');
// { isValid: true, strength: 'strong', checks: {...} }

// Validate form
const { isValid, errors } = validateForm(data, {
  email: { required: true, pattern: REGEX_PATTERNS.EMAIL },
  age: { required: true, type: 'number', min: 18 }
});
```

**Features:**
- Email, phone, URL validation
- Password strength checking
- Address validation
- Credit card validation
- Form validation with schema
- Input sanitization

### 7. **formatters.js**
Data formatting utilities.

```javascript
import { formatCurrency, formatDate, formatPhone, formatAddress } from './formatters.js';

// Format currency
formatCurrency(299); // ₹299.00

// Format date
formatDate(new Date()); // February 2, 2024

// Relative time
formatRelativeTime(date); // 2 hours ago

// Format phone
formatPhone('9876543210'); // +91 987-654-3210
```

**Features:**
- Currency, date/time formatting
- Phone and address formatting
- Relative time (ago/from now)
- Number formatting with separators
- Order status and payment method display
- Rating stars, file size, percentages

### 8. **utils.js**
General utility functions.

```javascript
import { debounce, throttle, deepClone, retry } from './utils.js';

// Debounce function
const debouncedSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Deep clone
const copy = deepClone(originalObject);

// Retry with exponential backoff
await retry(async () => {
  return await apiCall();
}, 3, 1000);

// Copy to clipboard
await copyToClipboard('Text to copy');
```

**Features:**
- Debounce, throttle
- Deep clone/merge objects
- Array utilities (groupBy, unique, chunk, flatten)
- String utilities (capitalize, slugify, truncate)
- Async utilities (delay, retry)
- Browser utilities (clipboard, query params)

### 9. **cart.js**
Shopping cart management with localStorage and Firestore sync.

```javascript
import { initCart, addToCart, getCart, onCartChange } from './cart.js';

// Initialize cart
await initCart();

// Add item
await addToCart({
  id: 'item123',
  name: 'Pizza',
  price: 299,
  quantity: 2
});

// Listen to changes
onCartChange((cart) => {
  console.log('Cart updated:', cart);
  updateCartUI(cart);
});
```

**Features:**
- Add/remove/update items
- Guest cart (localStorage)
- User cart (Firestore with real-time sync)
- Cart merging after login
- Quantity management
- Total calculation
- Validation

### 10. **api.js**
Cloud Functions API wrapper.

```javascript
import { createOrder, processPayment, getMenuItems } from './api.js';

// Create order
const result = await createOrder({
  items: [...],
  deliveryAddress: {...},
  paymentMethod: 'card'
});

// Process payment
await processPayment({
  orderId: 'order123',
  amount: 299,
  method: 'card'
});

// Get menu items
const { data: items } = await getMenuItems({ category: 'main_course' });
```

**Features:**
- Order management
- Payment processing
- Menu operations
- User profile management
- Address management
- Reviews and feedback
- Retry logic
- Batch requests

### 11. **notifications.js**
Toast notifications and FCM push notifications.

```javascript
import { showSuccess, showError, showConfirm, initNotifications } from './notifications.js';

// Initialize (with FCM)
await initNotifications();

// Show toast
showSuccess('Order placed successfully!');
showError('Payment failed. Please try again.');

// Confirmation dialog
const confirmed = await showConfirm('Cancel this order?');
if (confirmed) {
  // Cancel order
}

// FCM messages
onMessageReceived((payload) => {
  console.log('Push notification:', payload);
});
```

**Features:**
- Toast notifications (success, error, warning, info)
- Browser notifications
- FCM push notifications
- Confirmation dialogs
- Alert dialogs
- Auto-dismiss
- Custom styling

## 🚀 Getting Started

### Installation

No installation needed! These are pure ES6 modules that work directly in modern browsers.

### Setup

1. **Configure Firebase:**
   - Update `firebase-config.dev.js` with your dev credentials
   - Update `firebase-config.prod.js` with your prod credentials

2. **Import modules in your HTML:**
```html
<script type="module">
  import { initializeFirebase } from './shared/js/firebase-init.js';
  import { showSuccess } from './shared/js/notifications.js';
  import { initCart } from './shared/js/cart.js';
  
  // Initialize
  await initializeFirebase();
  await initCart();
  
  showSuccess('App initialized!');
</script>
```

### Usage Examples

#### Complete Authentication Flow
```javascript
import { signUp, signIn, onAuthStateChange } from './shared/js/auth.js';
import { showSuccess, showError } from './shared/js/notifications.js';

// Listen to auth state
onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user.email);
    loadUserData(user.uid);
  } else {
    console.log('User logged out');
    redirectToLogin();
  }
});

// Sign up
async function handleSignUp(email, password, name) {
  const result = await signUp(email, password, { displayName: name });
  
  if (result.success) {
    showSuccess('Account created! Please verify your email.');
  } else {
    showError(result.error);
  }
}
```

#### Order Management
```javascript
import { createOrder, getUserOrders } from './shared/js/api.js';
import { getCart, clearCart } from './shared/js/cart.js';
import { showSuccess } from './shared/js/notifications.js';

async function placeOrder(deliveryAddress, paymentMethod) {
  const cart = getCart();
  
  const result = await createOrder({
    items: cart.items,
    total: cart.total,
    deliveryAddress,
    paymentMethod
  });
  
  if (result.success) {
    await clearCart();
    showSuccess('Order placed successfully!');
    return result.data.orderId;
  } else {
    showError(result.error);
    return null;
  }
}
```

#### Real-time Order Tracking
```javascript
import { listenToDocument } from './shared/js/firestore.js';
import { formatOrderStatus } from './shared/js/formatters.js';

function trackOrder(orderId) {
  const unsubscribe = listenToDocument('orders', orderId, (order) => {
    if (order) {
      updateOrderStatus(formatOrderStatus(order.status));
      
      if (order.status === 'delivered') {
        unsubscribe();
        showSuccess('Order delivered! Enjoy your meal!');
      }
    }
  });
  
  return unsubscribe;
}
```

## 🛡️ Error Handling

All modules follow consistent error handling:

```javascript
// All async operations return { success, data?, error? }
const result = await createDocument('orders', data);

if (result.success) {
  console.log('Created:', result.data);
} else {
  console.error('Error:', result.error);
  showError(result.error);
}
```

## 🔒 Security Features

- Input sanitization
- XSS prevention
- Firebase security rules integration
- Authentication state management
- Token-based API calls
- CORS handling

## 🎨 Customization

### Toast Notifications
Customize toast styles by modifying the CSS in `notifications.js` or override with your own:

```css
.toast-success { background: #your-color; }
```

### Validators
Add custom validators:

```javascript
import { validateForm } from './validators.js';

const schema = {
  customField: {
    required: true,
    validator: (value) => {
      return value.startsWith('custom-') || 'Must start with custom-';
    }
  }
};
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES6 modules support.

## 🧪 Testing

Test individual modules in browser console:

```javascript
import { isValidEmail } from './shared/js/validators.js';
console.log(isValidEmail('test@example.com')); // true
```

## 📝 Best Practices

1. **Always initialize Firebase first:**
   ```javascript
   await initializeFirebase();
   ```

2. **Handle errors gracefully:**
   ```javascript
   const result = await apiCall();
   if (!result.success) {
     showError(result.error);
     return;
   }
   ```

3. **Clean up listeners:**
   ```javascript
   const unsubscribe = onCartChange(callback);
   // Later:
   unsubscribe();
   ```

4. **Use constants:**
   ```javascript
   import { ORDER_STATUS } from './constants.js';
   if (order.status === ORDER_STATUS.DELIVERED) { }
   ```

## 📄 License

Part of the restaurant-platform project.

## 🤝 Contributing

Follow the project's contribution guidelines.

---

**Total:** ~5,500 lines of production-ready JavaScript code across 11 modules.
