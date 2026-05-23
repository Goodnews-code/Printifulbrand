// Storefront Javascript Application

// Global State
let products = [];
let cart = [];
let activeCategory = 'all';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoriesContainer = document.getElementById('categories-container');
const cartBadge = document.getElementById('cart-badge');
const cartDrawer = document.getElementById('cart-drawer');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartBackdrop = document.getElementById('cart-drawer-backdrop');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotalAmount = document.getElementById('cart-subtotal-amount');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// Detail Modal Elements
const productModal = document.getElementById('product-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalGridContent = document.getElementById('modal-grid-content');

// Checkout Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const checkoutBackdrop = document.getElementById('checkout-backdrop');
const checkoutSuccessClose = document.getElementById('checkout-success-close');

// Initialize Store
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  loadProducts();
  initCart();
  setupEventListeners();
});

// Setup Events
function setupEventListeners() {
  // Cart Drawer open/close
  cartToggleBtn.addEventListener('click', toggleCart);
  cartCloseBtn.addEventListener('click', toggleCart);
  cartBackdrop.addEventListener('click', toggleCart);

  // Detail Modal close
  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // Checkout Modal close
  checkoutSuccessClose.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
  });
  checkoutBackdrop.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
  });

  // Category Filtering
  categoriesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Toggle active class
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      activeCategory = e.target.getAttribute('data-category');
      renderProducts();
    }
  });

  // Place Order Action
  checkoutBtn.addEventListener('click', processCheckout);
}

// 1. Fetch & Apply Site Settings
async function loadSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const settings = await res.json();
    
    // Apply theme settings
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--primary-color', settings.primary_color);
      // Generate RGB values for shadows/alphas
      const rgb = hexToRgb(settings.primary_color);
      if (rgb) {
        document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
    }
    if (settings.accent_color) {
      document.documentElement.style.setProperty('--accent-color', settings.accent_color);
    }

    // Apply text settings
    if (settings.site_title) {
      document.title = settings.site_title + " - Premium Apparel";
      document.getElementById('site-logo-text').textContent = settings.site_title;
      document.getElementById('footer-logo-text').textContent = settings.site_title;
    }
    if (settings.hero_headline) {
      document.getElementById('hero-title').textContent = settings.hero_headline;
    }
    if (settings.hero_subtext) {
      document.getElementById('hero-desc').textContent = settings.hero_subtext;
    }
    if (settings.site_description) {
      document.getElementById('footer-desc').textContent = settings.site_description;
    }
    if (settings.contact_email) {
      document.getElementById('footer-email').textContent = settings.contact_email;
    }
    if (settings.contact_phone) {
      document.getElementById('footer-phone').textContent = settings.contact_phone;
    }
    if (settings.footer_text) {
      document.getElementById('footer-copyright-text').textContent = settings.footer_text;
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

// 2. Fetch & Render Products
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    products = await res.json();
    
    // Dynamically rebuild category filters based on items in database
    rebuildCategoryFilters();
    renderProducts();
  } catch (err) {
    productsGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-triangle-exclamation"></i> Error loading products. Please try again.
      </div>
    `;
    console.error('Error loading products:', err);
  }
}

// Rebuild Category Filters
function rebuildCategoryFilters() {
  // Get all unique categories (excluding default categories if they don't exist)
  const categories = new Set();
  products.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  
  // Create filters UI
  let html = `<button class="filter-btn ${activeCategory === 'all' ? 'active' : ''}" data-category="all">All Items</button>`;
  categories.forEach(cat => {
    html += `<button class="filter-btn ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
  });
  categoriesContainer.innerHTML = html;
}

// Render Products Grid
function renderProducts() {
  // Filter products
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-box-open"></i> No products available in this category. Check back soon!
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = '';
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card animate-fade-in';
    
    const imageUrl = product.image_url || '/assets/tshirt_base.svg';
    const priceText = parseFloat(product.price).toFixed(2);
    
    card.innerHTML = `
      <div class="product-image-wrapper" onclick="openProductDetail(${product.id})">
        <span class="product-category-tag">${product.category || 'General'}</span>
        <img src="${imageUrl}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h3 class="product-title" onclick="openProductDetail(${product.id})">${product.title}</h3>
        <p class="product-desc-snippet">${product.description || 'No description available.'}</p>
        <div class="product-footer">
          <span class="product-price">$${priceText}</span>
          <button class="add-cart-btn" onclick="addToCart(${product.id})" aria-label="Add to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// 3. Shopping Cart Logic
function initCart() {
  const savedCart = localStorage.getItem('printiful_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('printiful_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const cartItem = cart.find(item => item.product.id === id);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }

  saveCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.product.id !== id);
  saveCart();
}

function updateQuantity(id, change) {
  const cartItem = cart.find(item => item.product.id === id);
  if (!cartItem) return;

  cartItem.quantity += change;
  if (cartItem.quantity <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
  }
}

function updateCartUI() {
  // Update badge count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartCount.textContent = totalItems;

  // Toggle button state
  if (totalItems > 0) {
    checkoutBtn.disabled = false;
  } else {
    checkoutBtn.disabled = true;
  }

  // Render items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your shopping cart is empty.</p>
      </div>
    `;
    cartSubtotalAmount.textContent = '$0.00';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;
    
    const imageUrl = item.product.image_url || '/assets/tshirt_base.svg';
    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <div class="cart-item-img">
        <img src="${imageUrl}" alt="${item.product.title}">
      </div>
      <div class="cart-item-details">
        <h4>${item.product.title}</h4>
        <div class="cart-item-price">$${parseFloat(item.product.price).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity(${item.product.id}, -1)">-</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.product.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.product.id})" aria-label="Remove item">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    cartItemsContainer.appendChild(cartItemEl);
  });

  cartSubtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
}

function toggleCart() {
  cartDrawer.classList.toggle('open');
}

function openCart() {
  cartDrawer.classList.add('open');
}

function closeCart() {
  cartDrawer.classList.remove('open');
}

// 4. Product Details Modal
function openProductDetail(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const imageUrl = product.image_url || '/assets/tshirt_base.svg';
  const priceText = parseFloat(product.price).toFixed(2);
  
  modalGridContent.innerHTML = `
    <div class="modal-visual">
      <img src="${imageUrl}" alt="${product.title}">
    </div>
    <div class="modal-details">
      <span class="modal-category">${product.category || 'General'}</span>
      <h2>${product.title}</h2>
      <div class="modal-price">$${priceText}</div>
      <p class="modal-description">${product.description || 'No description available for this item. Built with 100% premium materials for stylish streetwear outfits.'}</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" onclick="addToCart(${product.id}); closeModal();">
          Add To Cart &nbsp;<i class="fa-solid fa-bag-shopping"></i>
        </button>
      </div>
    </div>
  `;

  productModal.classList.add('open');
}

function closeModal() {
  productModal.classList.remove('open');
}

// 5. Checkout
function processCheckout() {
  // Close the cart drawer
  closeCart();
  
  // Clear cart state
  cart = [];
  saveCart();
  
  // Open checkout success modal
  checkoutModal.classList.add('open');
}

// Helper: Hex Color to RGB object
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
