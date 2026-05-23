// Immediately apply saved theme to avoid flash of light mode
const initialTheme = localStorage.getItem('printiful_theme') || 'light';
document.documentElement.setAttribute('data-theme', initialTheme);

/* ==========================================================================
   State & Constants
   ========================================================================== */

// 7 Pre-Designed product items inside assets/Image/
const defaultProducts = [
  {
    id: 1,
    name: 'Stand Still Black Tee',
    category: 'tshirt',
    basePrice: 29.99,
    image: 'assets/Image/Stand Still Black.jpeg',
    description: 'Heavyweight streetwear tee featuring premium black cotton with a minimalist signature chest print.',
    swatches: ['#000000', '#ffffff', '#53009B']
  },
  {
    id: 2,
    name: 'Love Won Premium Tee',
    category: 'tshirt',
    basePrice: 29.99,
    image: 'assets/Image/Love won tee.jpeg',
    description: 'Vibrant custom streetwear graphic printed on combed pre-shrunk cotton blank.',
    swatches: ['#ffffff', '#000000', '#FFFF00']
  },
  {
    id: 3,
    name: 'Affirmation Statement Tee',
    category: 'tshirt',
    basePrice: 27.99,
    image: 'assets/Image/Affirmation Tees.jpeg',
    description: 'Streetwear graphic tee highlighting bold positive statements on front and back panels.',
    swatches: ['#ffffff', '#000000', '#53009B']
  },
  {
    id: 4,
    name: 'Printiful Branded Blank Tee',
    category: 'tshirt',
    basePrice: 24.99,
    image: 'assets/Image/Branded Teeshirts.jpeg',
    description: 'Classic heavyweight streetwear basic tee, ideal for matching layers or raw branding.',
    swatches: ['#ffffff', '#000000', '#FFFF00']
  },
  {
    id: 5,
    name: 'Branded Hardcover Journal',
    category: 'stationery',
    basePrice: 15.99,
    image: 'assets/Image/Branded Journals.jpeg',
    description: 'Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 6,
    name: 'Magic Heat-Activated Mug',
    category: 'accessories',
    basePrice: 14.99,
    image: 'assets/Image/Magic mug.jpeg',
    description: 'Heat-activated ceramic color changing mug revealing brand graphics under warmth.',
    swatches: ['#000000']
  },
  {
    id: 7,
    name: 'Custom Matte Bookmark Set',
    category: 'stationery',
    basePrice: 5.99,
    image: 'assets/Image/Book marks.jpeg',
    description: 'Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.',
    swatches: ['#FFFF00', '#000000', '#53009B']
  }
];

// App State
let cart = [];
let products = [...defaultProducts];

/* ==========================================================================
   DOM Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Sync cart from LocalStorage initially
  loadCartFromStorage();
  updateCartUI();
  
  // Navigation & Drawer
  initCartDrawer();

  // Theme Management
  initTheme();

  // Mobile Hamburger Menu
  initMobileMenu();

  // Load dynamic products from DB
  await loadDynamicProducts();
  
  // Product Catalog Store Rendering
  initCatalog();
  
  // Inquiry Form Handler
  if (document.getElementById('inquiryForm')) {
    initInquiryForm();
  }

  // General Popup Modal Dialog
  initModals();

  // Admin Authentication Modal Dialog
  initAdminAuth();

  // Storage Sync Event Listener (Sync across open tabs/pages)
  window.addEventListener('storage', (e) => {
    if (e.key === 'printiful_cart') {
      loadCartFromStorage();
      updateCartUI();
    } else if (e.key === 'printiful_theme') {
      applyTheme(e.newValue || 'light');
    }
  });
});

/* ==========================================================================
   LocalStorage Integration
   ========================================================================== */
function saveCartToStorage() {
  localStorage.setItem('printiful_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('printiful_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  } else {
    cart = [];
  }
}

/* ==========================================================================
   Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Sync initial icon state
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(currentTheme);

  themeToggle.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme(targetTheme);
    localStorage.setItem('printiful_theme', targetTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    }
  }
}

/* ==========================================================================
   Mobile Hamburger Menu
   ========================================================================== */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (!hamburgerBtn || !mobileNav) return;

  function openMenu() {
    hamburgerBtn.classList.add('open');
    mobileNav.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close Menu');
  }

  function closeMenu() {
    hamburgerBtn.classList.remove('open');
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open Menu');
  }

  function toggleMenu() {
    const isOpen = hamburgerBtn.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  hamburgerBtn.addEventListener('click', toggleMenu);

  // Close menu when any mobile nav link is clicked
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on page scroll (for UX cleanliness)
  window.addEventListener('scroll', () => {
    if (mobileNav.classList.contains('open')) {
      closeMenu();
    }
  }, { passive: true });
}


/* ==========================================================================
   Product Catalog Room / Page Logic
   ========================================================================== */
function initCatalog() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const storeSearch = document.getElementById('storeSearch');
  const storeSort = document.getElementById('storeSort');

  let currentFilter = 'all';
  let searchQuery = '';
  let sortBy = 'default';

  // Category filter clicks
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  // Search input clicks (store.html)
  if (storeSearch) {
    storeSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Sort changes (store.html)
  if (storeSort) {
    storeSort.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderProducts();
    });
  }

  function renderProducts() {
    productGrid.innerHTML = '';

    // Filter items
    let filtered = products.filter(p => {
      const matchesCategory = currentFilter === 'all' || p.category === currentFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                            p.description.toLowerCase().includes(searchQuery);
      return matchesCategory && matchesSearch;
    });

    // Sort items
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'name-az') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filtered.length === 0) {
      productGrid.innerHTML = `<div class="empty-results-message">No archival pieces match your criteria.</div>`;
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('product-card');

      const swatchesHtml = product.swatches.map((color, idx) => `
        <button class="product-swatch-dot ${idx === 0 ? 'active' : ''}" 
                style="background-color: ${color};" 
                data-color="${color}"
                aria-label="Select Color ${color}">
        </button>
      `).join('');

      const sizeDropdown = (product.category === 'tshirt') ? `
        <select class="product-size-select" aria-label="Select size option">
          <option value="S">S</option>
          <option value="M" selected>M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
      ` : `
        <select class="product-size-select" aria-label="Select size option">
          <option value="Standard" selected>Standard</option>
        </select>
      `;

      card.innerHTML = `
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}">
          <span class="catalog-tag">${product.category}</span>
        </div>
        <div class="product-info">
          <div class="product-header-row">
            <span class="product-category">${product.category}</span>
            <span class="product-price">$${product.basePrice.toFixed(2)}</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          
          <div class="product-options-row">
            <div class="product-swatches">
              ${swatchesHtml}
            </div>
            ${sizeDropdown}
          </div>

          <div class="product-footer-row">
            <button class="btn-add-cart" data-id="${product.id}">
               Add to Cart
            </button>
          </div>
        </div>
      `;

      productGrid.appendChild(card);

      // Bind local swatches updates
      const dots = card.querySelectorAll('.product-swatch-dot');
      let chosenColor = product.swatches[0];
      
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          dots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          chosenColor = dot.dataset.color;
        });
      });

      // Bind Add click
      const addBtn = card.querySelector('.btn-add-cart');
      addBtn.addEventListener('click', () => {
        const sizeBox = card.querySelector('.product-size-select');
        const chosenSize = sizeBox ? sizeBox.value : 'Standard';

        const catalogCartItem = {
          id: `catalog-${product.id}-${chosenColor.replace('#', '')}-${chosenSize}`,
          name: product.name,
          category: product.category,
          color: chosenColor,
          size: chosenSize,
          image: product.image,
          price: product.basePrice,
          qty: 1
        };

        addToCart(catalogCartItem);
      });
    });
  }

  renderProducts();
}

/* ==========================================================================
   Shopping Cart UI Drawer Logic
   ========================================================================== */
function initCartDrawer() {
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const checkoutBtn = document.getElementById('checkoutBtn');

  cartTrigger.addEventListener('click', () => toggleCart(true));
  cartClose.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    toggleCart(false);
    showModal(
      'ORDER RECEIVED',
      'Thank you for your order. We have received your request and our production team is reviewing layout details. Follow-up details have been sent to your email.',
      'success-checkout'
    );
    
    // Clear state
    cart = [];
    saveCartToStorage();
    updateCartUI();
  });
}

function toggleCart(open) {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  
  if (open) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  } else {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(item);
  }
  
  saveCartToStorage();
  updateCartUI();
  toggleCart(true); // Open drawer automatically
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartBadge');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartGrandTotal = document.getElementById('cartGrandTotal');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.innerText = totalQty;

  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartItems.style.display = 'none';
    cartFooter.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartItems.style.display = 'flex';
    cartFooter.style.display = 'block';

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      const itemCost = item.price * item.qty;
      subtotal += itemCost;

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('cart-item');
      
      const previewHtml = `<img src="${item.image}" alt="${item.name}">`;

      itemDiv.innerHTML = `
        <div class="cart-item-preview">
          ${previewHtml}
        </div>
        <div class="cart-item-details">
          <div>
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-meta">
              Size: ${item.size} | Color: <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${item.color}; border:1px solid #ddd; vertical-align:middle; margin-left: 2px;"></span>
            </span>
          </div>
          <span class="cart-item-price">$${itemCost.toFixed(2)}</span>
          
          <div class="cart-item-qty-controls">
            <button onclick="changeQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="btn-cart-remove" onclick="removeCartItem('${item.id}')" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      cartItems.appendChild(itemDiv);
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    cartTax.innerText = `$${tax.toFixed(2)}`;
    cartGrandTotal.innerText = `$${total.toFixed(2)}`;
  }
}

// Global scope bindings for quantity updates inside cart elements
window.changeQty = function(itemId, amount) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item.qty += amount;
    if (item.qty <= 0) {
      removeCartItem(itemId);
      return;
    }
    saveCartToStorage();
    updateCartUI();
  }
};

window.removeCartItem = function(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  saveCartToStorage();
  updateCartUI();
};

/* ==========================================================================
   Bulk Inquiry Form Validations & Handling
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('inquiryForm');
  const fileInput = document.getElementById('formFile');
  const dropzone = document.getElementById('formDropzone');
  const preview = document.getElementById('formFilePreview');
  const previewName = document.getElementById('fileName');
  const previewSize = document.getElementById('fileSize');
  const removeFileBtn = document.getElementById('btnRemoveFile');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      showFilePreview(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      showFilePreview(e.target.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    preview.style.display = 'none';
    dropzone.style.display = 'block';
  });

  function showFilePreview(file) {
    previewName.innerText = file.name;
    previewSize.innerText = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    dropzone.style.display = 'none';
    preview.style.display = 'flex';
  }

  // Submissions validation and logic
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      const parent = field.closest('.form-group');
      const val = field.value.trim();
      let fieldValid = true;

      if (!val) {
        fieldValid = false;
      } else if (field.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(val)) {
          fieldValid = false;
        }
      } else if (field.type === 'number') {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          fieldValid = false;
        }
      }

      if (!fieldValid) {
        parent.classList.add('invalid');
        isValid = false;
      } else {
        parent.classList.remove('invalid');
      }

      // Live correction listener
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          parent.classList.remove('invalid');
        }
      });
    });

    if (isValid) {
      const submitBtn = form.querySelector('.btn-form-submit');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Quote Request... <i class="fa-solid fa-spinner fa-spin"></i>';

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        preview.style.display = 'none';
        dropzone.style.display = 'block';
        
        showModal(
          'INQUIRY RECEIVED',
          'Your bulk customization request has been logged. Our design studio will review your attached artwork and notes, and issue a digital mockup and quote estimate in 2-4 hours.',
          'success-inquiry'
        );
      }, 1500);
    }
  });
}

/* ==========================================================================
   Modals & Popups Utility
   ========================================================================== */
function initModals() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  
  modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
}

function showModal(title, message, accentClass = 'success-checkout') {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalIcon = document.getElementById('modalIcon');
  
  modalTitle.innerText = title;
  modalMessage.innerText = message;
  
  if (accentClass === 'success-checkout') {
    modalIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
  } else {
    modalIcon.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  }
  
  modalOverlay.className = `modal-overlay ${accentClass}`;
  modalOverlay.classList.add('active');
}

/* ==========================================================================
   Admin Authentication Modal Dialog
   ========================================================================== */
function initAdminAuth() {
  const adminModal = document.getElementById('adminModalOverlay');
  const adminForm = document.getElementById('adminPassForm');
  const adminInput = document.getElementById('adminPassInput');
  const togglePass = document.getElementById('toggleAdminPass');
  const errorMsg = document.getElementById('adminErrorMsg');
  
  const triggers = [
    document.getElementById('adminTrigger'),
    document.getElementById('mobileAdminTrigger'),
    document.getElementById('footerAdminTrigger')
  ];
  
  const closeBtn = document.getElementById('adminModalCloseBtn');

  if (!adminModal || !adminForm) return;

  function openAdminModal(e) {
    if (e) e.preventDefault();
    adminInput.value = '';
    errorMsg.style.display = 'none';
    adminModal.classList.add('active');
    setTimeout(() => adminInput.focus(), 100);
  }

  function closeAdminModal() {
    adminModal.classList.remove('active');
  }

  // Bind all triggers
  triggers.forEach(trigger => {
    if (trigger) {
      trigger.addEventListener('click', openAdminModal);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAdminModal);
  }

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      closeAdminModal();
    }
  });

  // Toggle Password Visibility
  if (togglePass && adminInput) {
    togglePass.addEventListener('click', () => {
      const type = adminInput.getAttribute('type') === 'password' ? 'text' : 'password';
      adminInput.setAttribute('type', type);
      const icon = togglePass.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }

  // Form Submit Authenticate
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminInput.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        // Save the session token to match the admin dashboard expectations
        localStorage.setItem('printiful_token', data.token);
        errorMsg.style.display = 'none';
        closeAdminModal();
        
        // Redirect to admin panel
        window.location.href = '/admin';
      } else {
        errorMsg.style.display = 'block';
        adminInput.focus();
      }
    } catch (err) {
      console.error('Admin authentication connection error:', err);
      errorMsg.textContent = 'Connection failed. Please check server status.';
      errorMsg.style.display = 'block';
    }
  });
}

/* ==========================================================================
   Dynamic Database Products Curation
   ========================================================================== */
async function loadDynamicProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const dbProducts = await res.json();
      if (dbProducts && dbProducts.length > 0) {
        // Map database products to the storefront format
        products = dbProducts.map(p => {
          // Normalize category
          const category = normalizeCategory(p.category);
          
          // Set brand swatches based on category or default
          let swatches = ['#000000', '#ffffff', '#53009B'];
          const titleLower = p.title.toLowerCase();
          if (titleLower.includes('love won') || titleLower.includes('blank tee')) {
            swatches = ['#ffffff', '#000000', '#FFFF00'];
          } else if (titleLower.includes('journal')) {
            swatches = ['#000000', '#53009B'];
          } else if (titleLower.includes('mug')) {
            swatches = ['#000000'];
          } else if (titleLower.includes('bookmark')) {
            swatches = ['#FFFF00', '#000000', '#53009B'];
          }
          
          return {
            id: p.id,
            name: p.title,
            category: category,
            basePrice: parseFloat(p.price) || 29.99,
            image: p.image_url || 'assets/tshirt_base.svg',
            description: p.description || '',
            swatches: swatches
          };
        });
        
        console.log("Successfully loaded products from database API.");
      }
    }
  } catch (err) {
    console.warn("Failed to load products from database, falling back to local archive defaults.", err);
  }
}

function normalizeCategory(dbCategory) {
  const cat = (dbCategory || '').toLowerCase();
  if (cat.includes('shirt') || cat.includes('tee')) return 'tshirt';
  if (cat.includes('stationery') || cat.includes('journal') || cat.includes('book')) return 'stationery';
  if (cat.includes('access') || cat.includes('mug') || cat.includes('cap') || cat.includes('hat')) return 'accessories';
  return 'accessories'; // default fallback
}
