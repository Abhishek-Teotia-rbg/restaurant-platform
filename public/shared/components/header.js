/**
 * Header Component
 * Displays navigation header with logo, menu, user info, and cart
 * @module components/header
 */

/**
 * @typedef {Object} HeaderConfig
 * @property {string} [logo] - Logo image URL or text
 * @property {Array<{label: string, href: string, active?: boolean}>} [navItems] - Navigation menu items
 * @property {Object} [user] - User information
 * @property {string} [user.name] - User display name
 * @property {string} [user.avatar] - User avatar URL
 * @property {number} [cartCount] - Number of items in cart
 * @property {Function} [onCartClick] - Cart click handler
 * @property {Function} [onLogout] - Logout handler
 * @property {boolean} [showCart] - Whether to show cart icon
 * @property {boolean} [showUser] - Whether to show user menu
 */

/**
 * Renders header component
 * @param {HeaderConfig} config - Header configuration
 * @returns {HTMLElement} Header element
 */
export function render(config = {}) {
  const {
    logo = 'Restaurant Platform',
    navItems = [],
    user = null,
    cartCount = 0,
    onCartClick = null,
    onLogout = null,
    showCart = true,
    showUser = true
  } = config;

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="header-container">
      <div class="header-logo">
        ${logo.startsWith('http') ? `<img src="${logo}" alt="Logo">` : `<span>${logo}</span>`}
      </div>
      
      <nav class="header-nav">
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${item.active ? 'active' : ''}">
            ${item.label}
          </a>
        `).join('')}
      </nav>
      
      <div class="header-actions">
        ${showCart ? `
          <button class="header-cart" data-action="cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
          </button>
        ` : ''}
        
        ${showUser && user ? `
          <div class="header-user">
            <button class="user-toggle" data-action="toggle-menu">
              ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : 
                `<div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>`}
              <span class="user-name">${user.name}</span>
            </button>
            <div class="user-menu hidden">
              <a href="/profile" class="menu-item">Profile</a>
              <a href="/orders" class="menu-item">Orders</a>
              <a href="/settings" class="menu-item">Settings</a>
              <button class="menu-item logout" data-action="logout">Logout</button>
            </div>
          </div>
        ` : showUser ? `
          <a href="/login" class="btn-login">Login</a>
        ` : ''}
      </div>
    </div>
  `;

  // Event handlers
  if (showCart && onCartClick) {
    const cartBtn = header.querySelector('[data-action="cart"]');
    if (cartBtn) cartBtn.addEventListener('click', onCartClick);
  }

  if (showUser && user) {
    const toggleBtn = header.querySelector('[data-action="toggle-menu"]');
    const userMenu = header.querySelector('.user-menu');
    
    if (toggleBtn && userMenu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        userMenu.classList.add('hidden');
      });
    }

    if (onLogout) {
      const logoutBtn = header.querySelector('[data-action="logout"]');
      if (logoutBtn) logoutBtn.addEventListener('click', onLogout);
    }
  }

  return header;
}

/**
 * Updates cart count badge
 * @param {HTMLElement} header - Header element
 * @param {number} count - New cart count
 */
export function updateCartCount(header, count) {
  const cartBtn = header.querySelector('[data-action="cart"]');
  if (!cartBtn) return;

  let badge = cartBtn.querySelector('.cart-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      cartBtn.appendChild(badge);
    }
    badge.textContent = count;
  } else if (badge) {
    badge.remove();
  }
}
