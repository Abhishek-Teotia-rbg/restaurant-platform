# Reusable Component Library

A collection of reusable HTML/JS components for the restaurant platform. These components are designed to work across customer, admin, and kitchen applications.

## Components

### 1. Header (`header.js`)
Navigation header with logo, menu, user info, and cart.

```javascript
import { render, updateCartCount } from './components/header.js';

const header = render({
  logo: 'Restaurant Platform',
  navItems: [
    { label: 'Menu', href: '/menu', active: true },
    { label: 'Orders', href: '/orders' }
  ],
  user: {
    name: 'John Doe',
    avatar: '/avatar.jpg'
  },
  cartCount: 3,
  onCartClick: () => console.log('Cart clicked'),
  onLogout: () => console.log('Logout'),
  showCart: true,
  showUser: true
});

document.body.appendChild(header);

// Update cart count
updateCartCount(header, 5);
```

### 2. Footer (`footer.js`)
Footer with links, social media, and copyright.

```javascript
import { render } from './components/footer.js';

const footer = render({
  sections: [
    {
      title: 'About',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' }
      ]
    }
  ],
  socialLinks: [
    { icon: 'facebook', href: '#', label: 'Facebook' },
    { icon: 'twitter', href: '#', label: 'Twitter' }
  ],
  companyName: 'Restaurant Platform'
});

document.body.appendChild(footer);
```

### 3. Loading (`loading.js`)
Loading indicators (spinner, skeleton, dots, bar).

```javascript
import { render, showLoading, hideLoading, skeletonCard } from './components/loading.js';

// Spinner
const spinner = render({ type: 'spinner', text: 'Loading...', size: 'large' });

// Skeleton
const skeleton = render({ type: 'skeleton', skeletonLines: 5 });

// Show overlay
const loading = showLoading(document.getElementById('content'), { type: 'spinner' });
setTimeout(() => hideLoading(loading), 2000);

// Skeleton cards
const cards = skeletonCard(3);
```

### 4. Modal (`modal.js`)
Modal dialogs with customizable content.

```javascript
import { show, confirm, alert } from './components/modal.js';

// Custom modal
show({
  title: 'Edit Profile',
  content: '<form>...</form>',
  buttons: [
    { label: 'Cancel', variant: 'secondary', action: () => {} },
    { label: 'Save', variant: 'primary', action: () => console.log('Saved') }
  ],
  size: 'medium'
});

// Confirmation
confirm({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
  onConfirm: () => console.log('Deleted'),
  confirmText: 'Delete',
  cancelText: 'Cancel'
});

// Alert
alert({
  title: 'Success',
  message: 'Your changes have been saved.',
  buttonText: 'OK'
});
```

### 5. Toast (`toast.js`)
Toast notifications for temporary messages.

```javascript
import { success, error, warning, info, render } from './components/toast.js';

// Quick methods
success('Order placed successfully!');
error('Failed to load data');
warning('Your session is about to expire');
info('New updates available');

// Custom toast
render({
  message: 'Item added to cart',
  type: 'success',
  duration: 3000,
  position: 'top-right',
  action: 'View Cart',
  onAction: () => window.location.href = '/cart'
});
```

### 6. Pagination (`pagination.js`)
Pagination controls for navigating through pages.

```javascript
import { render } from './components/pagination.js';

const pagination = render({
  currentPage: 1,
  totalPages: 10,
  onPageChange: (page) => console.log('Go to page:', page),
  maxVisible: 7,
  showFirstLast: true,
  showPrevNext: true
});

document.getElementById('pagination').appendChild(pagination);
```

### 7. Search (`search.js`)
Search bar with autocomplete functionality.

```javascript
import { render, showResults, getValue } from './components/search.js';

const search = render({
  placeholder: 'Search menu items...',
  onSearch: (query) => console.log('Search:', query),
  onInput: (query) => {
    // Fetch autocomplete results
    fetchResults(query).then(results => {
      showResults(search, results, (selected) => {
        console.log('Selected:', selected);
      });
    });
  },
  debounceDelay: 300,
  showButton: true,
  clearable: true
});

document.getElementById('search-container').appendChild(search);
```

### 8. Filters (`filters.js`)
Filter sidebar with various filter types.

```javascript
import { render, getValues } from './components/filters.js';

const filters = render({
  groups: [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { label: 'Pizza', value: 'pizza', count: 12 },
        { label: 'Pasta', value: 'pasta', count: 8 }
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range',
      range: { min: 0, max: 100, step: 5 }
    }
  ],
  onChange: (selectedFilters) => console.log('Filters:', selectedFilters),
  showApply: false,
  showClear: true
});

document.getElementById('filters').appendChild(filters);
```

### 9. Breadcrumb (`breadcrumb.js`)
Breadcrumb navigation trail.

```javascript
import { render, fromPath } from './components/breadcrumb.js';

// Manual items
const breadcrumb = render({
  items: [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Pizza' }
  ],
  showHome: true
});

// From URL path
const breadcrumb2 = fromPath('/admin/orders/123');

document.getElementById('breadcrumb').appendChild(breadcrumb);
```

### 10. Rating (`rating.js`)
Star rating component for display and input.

```javascript
import { render, getValue, setValue, compact } from './components/rating.js';

// Display rating
const displayRating = render({
  value: 4.5,
  max: 5,
  readonly: true,
  size: 'medium',
  showValue: true,
  count: 234
});

// Input rating
const inputRating = render({
  value: 0,
  max: 5,
  readonly: false,
  onChange: (value) => console.log('Rating:', value),
  precision: 0.5
});

// Compact rating
const compactRating = compact(4.5, 123);

document.getElementById('rating').appendChild(inputRating);
```

### 11. Image Upload (`image-upload.js`)
Image upload with preview and validation.

```javascript
import { render, getFiles, clear } from './components/image-upload.js';

const upload = render({
  onUpload: (file, url, index) => {
    console.log('Uploaded:', file.name, url);
  },
  onRemove: (index) => {
    console.log('Removed:', index);
  },
  accept: 'image/*',
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  multiple: true,
  previewUrls: ['/existing-image.jpg']
});

document.getElementById('upload').appendChild(upload);

// Get uploaded files
const files = getFiles(upload);

// Clear all
clear(upload);
```

### 12. Empty State (`empty-state.js`)
Empty state with icon, message, and action.

```javascript
import { render, searchEmpty, cartEmpty, errorState } from './components/empty-state.js';

// Custom empty state
const emptyState = render({
  icon: 'box',
  title: 'No items found',
  message: 'There are no items to display.',
  action: {
    label: 'Add Item',
    onClick: () => console.log('Add clicked')
  },
  size: 'medium'
});

// Predefined states
const searchState = searchEmpty('pizza', () => console.log('Clear search'));
const cartState = cartEmpty(() => window.location.href = '/menu');
const errorMsg = errorState('Failed to load data', () => location.reload());

document.getElementById('content').appendChild(emptyState);
```

### 13. Error Boundary (`error-boundary.js`)
Error handling wrapper for components.

```javascript
import { render, setupGlobal, wrapAsync, safeHandler } from './components/error-boundary.js';

// Wrap component
const boundary = render({
  content: () => {
    // Component that might throw errors
    return document.getElementById('my-component');
  },
  onError: (error, info) => {
    console.error('Component error:', error, info);
  },
  showDetails: true,
  componentName: 'MyComponent'
});

document.body.appendChild(boundary);

// Wrap async function
const safeLoadData = wrapAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
}, (error) => console.error('Load error:', error));

// Safe event handler
button.addEventListener('click', safeHandler((e) => {
  // Handler that might throw
  processClick(e);
}, (error) => console.error('Handler error:', error)));

// Setup global error handling
setupGlobal({
  onError: (error, info) => console.error('Global error:', error),
  logErrors: true,
  errorEndpoint: '/api/errors'
});
```

## Usage Across Apps

These components can be used in:
- **Customer App**: Menu browsing, cart, orders
- **Admin App**: Dashboard, management interfaces
- **Kitchen App**: Order display, status updates

## Import Examples

```javascript
// Import individual component
import { render as renderHeader } from './shared/components/header.js';

// Import from index
import { Header, Modal, Toast } from './shared/components/index.js';

// Use components
const header = Header.render({ /* config */ });
Modal.show({ /* config */ });
Toast.success('Success!');
```

## Styling

Each component includes class names for styling. Create corresponding CSS:

```css
/* Example: Toast styles */
.toast-container { /* ... */ }
.toast { /* ... */ }
.toast-success { /* ... */ }
.toast-error { /* ... */ }

/* Example: Modal styles */
.modal-overlay { /* ... */ }
.modal-container { /* ... */ }
.modal-visible { /* ... */ }
```

## Best Practices

1. **Always provide configuration**: Use default configs but customize as needed
2. **Handle cleanup**: Remove event listeners when destroying components
3. **Use error boundaries**: Wrap components that might fail
4. **Accessibility**: Components include ARIA attributes
5. **Responsive**: Design mobile-first with these components
6. **Type safety**: JSDoc comments provide IDE autocomplete

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- No polyfills included (add as needed)

## License

Part of the Restaurant Platform project.
