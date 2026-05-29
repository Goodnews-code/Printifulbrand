// Immediately apply saved theme to avoid flash of light mode
const initialTheme = localStorage.getItem('printiful_theme') || 'light';
document.documentElement.setAttribute('data-theme', initialTheme);

/* ==========================================================================
   State & Constants
   ========================================================================== */

// 7 Pre-Designed product items inside assets/Image/
const defaultProducts = [
  // Apparels
  {
    id: 1,
    name: 'Premium Heavyweight Tee',
    category: 'apparels',
    basePrice: 29.99,
    image: 'assets/Image/Branded Teeshirts.jpeg',
    description: 'Heavyweight streetwear tee featuring premium cotton with a minimalist brand chest print.',
    swatches: ['#ffffff', '#000000', '#53009B']
  },
  {
    id: 2,
    name: 'Signature Oversized Hoodie',
    category: 'apparels',
    basePrice: 59.99,
    image: 'assets/hoodie_base.svg',
    description: 'Premium heavy cotton fleece hoodie with double-lined hood and relaxed drop-shoulder fit.',
    swatches: ['#000000', '#ffffff', '#53009B']
  },
  {
    id: 3,
    name: 'Minimalist Streetwear Cap',
    category: 'apparels',
    basePrice: 24.99,
    image: 'assets/cap_base.svg',
    description: 'Unstructured 6-panel strapback cap with premium embroidered brand icon.',
    swatches: ['#000000', '#53009B', '#FFFF00']
  },
  {
    id: 4,
    name: 'Classic Canvas Tote Bag',
    category: 'apparels',
    basePrice: 19.99,
    image: 'assets/Image/Love won tee.jpeg',
    description: 'Durable heavyweight cotton canvas tote bag with reinforced handles and interior pocket.',
    swatches: ['#ffffff', '#000000']
  },
  {
    id: 5,
    name: 'Streetwear School Backpack',
    category: 'apparels',
    basePrice: 49.99,
    image: 'assets/tshirt_base.svg',
    description: 'Water-resistant tactical backpack with multi-compartment layouts and utility straps.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 6,
    name: 'Children Brand Tee',
    category: 'apparels',
    basePrice: 19.99,
    image: 'assets/Image/Affirmation Tees.jpeg',
    description: 'Soft pre-shrunk children tee featuring custom brand artwork and non-toxic cured inks.',
    swatches: ['#ffffff', '#FFFF00']
  },
  
  // Stationery
  {
    id: 7,
    name: 'Branded Hardcover Journal',
    category: 'stationery',
    basePrice: 15.99,
    image: 'assets/Image/Branded Journals.jpeg',
    description: 'Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 8,
    name: 'Matte Custom Bookmark Set',
    category: 'stationery',
    basePrice: 5.99,
    image: 'assets/Image/Book marks.jpeg',
    description: 'Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.',
    swatches: ['#FFFF00', '#000000', '#53009B']
  },
  {
    id: 9,
    name: 'Premium Die-Cut Sticker Pack',
    category: 'stationery',
    basePrice: 4.99,
    image: 'assets/logo.svg',
    description: 'Weatherproof vinyl brand sticker pack featuring 8 unique high-fidelity graphic designs.',
    swatches: ['#FFFF00', '#53009B']
  },
  {
    id: 10,
    name: 'Sleek Aluminium Pen',
    category: 'stationery',
    basePrice: 9.99,
    image: 'assets/logo with printiful.svg',
    description: 'Retractable matte aluminium ballpoint pen with signature branding and gel ink.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 11,
    name: 'Soft-Touch Business Cards',
    category: 'stationery',
    basePrice: 12.99,
    image: 'assets/logo.svg',
    description: 'Set of 100 soft-touch laminated thick business cards with raised spot UV highlights.',
    swatches: ['#ffffff', '#000000']
  },

  // Brand Packaging
  {
    id: 12,
    name: 'Premium Thank You Card',
    category: 'packaging',
    basePrice: 7.99,
    image: 'assets/logo with printiful.svg',
    description: 'Double-sided heavy cardstock thank you cards with gold foil accent lettering.',
    swatches: ['#ffffff', '#53009B']
  },
  {
    id: 13,
    name: 'Custom Polymailer Nylon Bag',
    category: 'packaging',
    basePrice: 14.99,
    image: 'assets/logo.svg',
    description: 'Set of 50 heavy-duty weatherproof polymailer bags featuring all-over brand pattern print.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 14,
    name: 'Branded Packaging Sticker Reel',
    category: 'packaging',
    basePrice: 8.99,
    image: 'assets/logo.svg',
    description: 'Reel of 200 circular high-gloss paper stickers to secure tissue wrappers and boxes.',
    swatches: ['#FFFF00', '#53009B']
  },

  // Gadgets
  {
    id: 15,
    name: 'Custom Felt Laptop Sleeve',
    category: 'gadgets',
    basePrice: 24.99,
    image: 'assets/hoodie_base.svg',
    description: 'Premium organic wool felt sleeve with vegan leather accents and secure accessory pockets.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 16,
    name: 'Heavyweight Desk Mouse Pad',
    category: 'gadgets',
    basePrice: 19.99,
    image: 'assets/logo with printiful.svg',
    description: 'Extra-large anti-slip rubber desk mat featuring high-density microfiber print surface.',
    swatches: ['#000000', '#53009B', '#FFFF00']
  },
  {
    id: 17,
    name: 'Ergonomic Wireless Mouse',
    category: 'gadgets',
    basePrice: 29.99,
    image: 'assets/logo.svg',
    description: 'Sleek rechargeable silent click mouse with adjustable DPI and subtle brand watermark.',
    swatches: ['#000000', '#ffffff']
  },
  {
    id: 18,
    name: 'Premium Studio Headset',
    category: 'gadgets',
    basePrice: 79.99,
    image: 'assets/logo.svg',
    description: 'Over-ear active noise cancelling bluetooth headphones with memory foam cushions.',
    swatches: ['#000000']
  },
  {
    id: 19,
    name: 'Branded Wooden Flash Drive',
    category: 'gadgets',
    basePrice: 14.99,
    image: 'assets/logo with printiful.svg',
    description: '32GB USB 3.0 flash drive housed in elegant walnut casing with laser-engraved logo.',
    swatches: ['#000000']
  },
  {
    id: 20,
    name: '10000mAh Power Bank',
    category: 'gadgets',
    basePrice: 34.99,
    image: 'assets/logo.svg',
    description: 'Ultra-slim power bank with fast-charging dual outputs and soft-touch brand matte finish.',
    swatches: ['#000000', '#53009B']
  },

  // Corporate Gift
  {
    id: 21,
    name: 'Heat-Activated Magic Mug',
    category: 'gifts',
    basePrice: 14.99,
    image: 'assets/Image/Magic mug.jpeg',
    description: 'Heat-activated ceramic color changing mug revealing brand graphics under warmth.',
    swatches: ['#000000']
  },
  {
    id: 22,
    name: 'Double-Wall Water Bottle',
    category: 'gifts',
    basePrice: 24.99,
    image: 'assets/cap_base.svg',
    description: 'Vacuum-insulated stainless steel flask keeping beverages cold for 24h or hot for 12h.',
    swatches: ['#000000', '#53009B', '#FFFF00']
  },
  {
    id: 23,
    name: 'Stress Release Foam Ball',
    category: 'gifts',
    basePrice: 6.99,
    image: 'assets/logo.svg',
    description: 'High-density stress release squeeze ball featuring our signature smile face brand motif.',
    swatches: ['#FFFF00', '#000000']
  },
  {
    id: 24,
    name: 'Engraved Metal Key Holder',
    category: 'gifts',
    basePrice: 9.99,
    image: 'assets/logo with printiful.svg',
    description: 'Polished zinc alloy hardware keychain with heavy duty split ring and engraved logo.',
    swatches: ['#000000', '#ffffff']
  },
  {
    id: 25,
    name: 'Branded Kraft Gift Box',
    category: 'gifts',
    basePrice: 11.99,
    image: 'assets/logo.svg',
    description: 'Set of 5 premium folding card gift boxes complete with ribbons and thank you stickers.',
    swatches: ['#ffffff', '#000000']
  },
  {
    id: 26,
    name: 'Satin Custom Lanyard',
    category: 'gifts',
    basePrice: 4.99,
    image: 'assets/logo.svg',
    description: 'Smooth polyester satin neck strap with quick-release buckle and trigger swivel clip.',
    swatches: ['#53009B', '#000000', '#FFFF00']
  },

  // Lifestyle
  {
    id: 27,
    name: 'Embroidered Velvet Pillow',
    category: 'lifestyle',
    basePrice: 29.99,
    image: 'assets/hoodie_base.svg',
    description: 'Luxurious velvet throw pillow complete with high density brand emblem embroidery.',
    swatches: ['#000000', '#53009B']
  },
  {
    id: 28,
    name: 'Premium Matte Wooden Frame',
    category: 'lifestyle',
    basePrice: 34.99,
    image: 'assets/logo with printiful.svg',
    description: 'Sleek black wooden art frame with thick matboard, custom curated to display brand prints.',
    swatches: ['#000000']
  }
];

// App State
let cart = [];
let products = defaultProducts.filter(p => p.image && p.image.toLowerCase().includes('assets/image/'));

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

  // Load dynamic layout settings from DB
  await loadDynamicSettings();

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

  // Initialize Monnify Checkout Modal
  initCheckoutModal();

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

    const isLandingPage = !storeSearch;

    // Landing Page Limit & Randomization: 
    // Under "All" filter, show 8 completely random available products from any category!
    // Under specific category filters, show at most 2 products per category (as set by standard filters)
    if (isLandingPage) {
      if (currentFilter === 'all') {
        // Randomize the entire filtered list and take a maximum of 8 items for editorial variety
        filtered = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 8);
      } else {
        // Limit to maximum of 2 products for the selected category on landing page
        const categoryCounts = {};
        filtered = filtered.filter(p => {
          const cat = p.category;
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          return categoryCounts[cat] <= 2;
        });
      }
    }

    if (filtered.length === 0) {
      productGrid.style.display = 'block';
      productGrid.innerHTML = `<div class="empty-results-message">No archival pieces match your criteria.</div>`;
      return;
    }

    // Helper to get beautiful capitalized group titles
    function getDisplayCategoryName(cat) {
      const c = cat.toLowerCase();
      if (c === 'apparels') return 'Apparels';
      if (c === 'stationery') return 'Stationery';
      if (c === 'packaging') return 'Brand Packaging';
      if (c === 'gadgets') return 'Gadgets';
      if (c === 'gifts') return 'Corporate Gifts';
      if (c === 'lifestyle') return 'Lifestyle';
      return cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    // Render helper for single product card (to avoid code duplication)
    function createProductCard(product) {
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.id = `product-${product.id}`;

      // If we are on the landing page, show simplified visual card (no price, no category tags, no cart options)
      if (isLandingPage) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = `store.html?filter=${product.category}#product-${product.id}`;
        });

        card.innerHTML = `
          <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-info" style="text-align: center; padding: 25px 20px;">
            <h3 class="product-title" style="margin-bottom: 10px; font-size: 1.3rem; font-family: 'Outfit', sans-serif; font-weight: 600; color: var(--color-text-primary);">${product.name}</h3>
            <p class="product-desc" style="font-size: 0.9rem; opacity: 0.8; line-height: 1.5; margin-bottom: 0;">${product.description}</p>
            <span class="view-store-link" style="display: inline-block; margin-top: 15px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--color-brand-accent); letter-spacing: 0.05em; border-bottom: 1px solid var(--color-brand-accent); padding-bottom: 2px; transition: var(--transition-smooth);">View in Archive Store</span>
          </div>
        `;
        return card;
      }

      // Catalog / Store page card (full e-commerce purchase functionality)
      const swatchesHtml = product.swatches.map((color, idx) => `
        <button class="product-swatch-dot ${idx === 0 ? 'active' : ''}" 
                style="background-color: ${color};" 
                data-color="${color}"
                aria-label="Select Color ${color}">
        </button>
      `).join('');

      let sizeOptionsHtml = '';
      if (product.sizes && product.sizes.length > 0) {
        sizeOptionsHtml = product.sizes.map((sz, idx) => `
          <option value="${sz.size_name}" ${idx === 0 ? 'selected' : ''}>${sz.size_name}</option>
        `).join('');
      } else {
        sizeOptionsHtml = `<option value="Standard" selected>Standard</option>`;
      }

      const sizeDropdown = `
        <select class="product-size-select" aria-label="Select size option">
          ${sizeOptionsHtml}
        </select>
      `;

      card.innerHTML = `
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <span class="catalog-tag">${getDisplayCategoryName(product.category)}</span>
        </div>
        <div class="product-info">
          <div class="product-header-row">
            <span class="product-category">${getDisplayCategoryName(product.category)}</span>
            <span class="product-price">₦${product.basePrice.toFixed(2)}</span>
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

      // Bind local swatches updates to swap main display image dynamically
      const dots = card.querySelectorAll('.product-swatch-dot');
      let chosenColor = product.swatches[0];
      
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          dots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          chosenColor = dot.dataset.color;

          // Swap image based on chosen swatch color mapping
          if (product.colorImages && product.colorImages[chosenColor.toUpperCase()]) {
            const productImgNode = card.querySelector('.product-image-container img');
            if (productImgNode) {
              productImgNode.src = product.colorImages[chosenColor.toUpperCase()];
            }
          }
        });
      });

      // Bind Size change to update card price display dynamically
      const sizeBox = card.querySelector('.product-size-select');
      const priceTag = card.querySelector('.product-price');
      let currentPrice = product.basePrice;

      if (sizeBox) {
        // Set initial price to first size's price if sizes list exists
        if (product.sizes && product.sizes.length > 0) {
          const initialSize = product.sizes.find(sz => sz.size_name === sizeBox.value);
          if (initialSize) {
            currentPrice = initialSize.price;
            priceTag.innerText = `₦${currentPrice.toFixed(2)}`;
          }
        }

        sizeBox.addEventListener('change', () => {
          const selectedSize = sizeBox.value;
          if (product.sizes && product.sizes.length > 0) {
            const matchedSize = product.sizes.find(sz => sz.size_name === selectedSize);
            if (matchedSize) {
              currentPrice = matchedSize.price;
              priceTag.innerText = `₦${currentPrice.toFixed(2)}`;
            }
          } else {
            currentPrice = product.basePrice;
            priceTag.innerText = `₦${currentPrice.toFixed(2)}`;
          }
        });
      }

      // Bind Add click
      const addBtn = card.querySelector('.btn-add-cart');
      addBtn.addEventListener('click', () => {
        const chosenSize = sizeBox ? sizeBox.value : 'Standard';

        // Retrieve size specific price dynamically for cart insertion
        let finalPrice = product.basePrice;
        if (product.sizes && product.sizes.length > 0) {
          const matchedSize = product.sizes.find(sz => sz.size_name === chosenSize);
          if (matchedSize) {
            finalPrice = matchedSize.price;
          }
        }

        // Retrieve active color image or base fallback
        const finalImage = (product.colorImages && product.colorImages[chosenColor.toUpperCase()]) 
          ? product.colorImages[chosenColor.toUpperCase()] 
          : product.image;

        const catalogCartItem = {
          id: `catalog-${product.id}-${chosenColor.replace('#', '')}-${chosenSize}`,
          name: product.name,
          category: product.category,
          color: chosenColor,
          size: chosenSize,
          image: finalImage,
          price: finalPrice,
          qty: 1
        };

        addToCart(catalogCartItem);
      });

      return card;
    }

    // Catalog page "All" filter displays grouped category sections
    if (!isLandingPage && currentFilter === 'all') {
      productGrid.style.display = 'block';
      
      // Group products by category
      const grouped = {};
      filtered.forEach(p => {
        grouped[p.category] = grouped[p.category] || [];
        grouped[p.category].push(p);
      });

      // Sort categories alphabetically by display name
      const sortedCategories = Object.keys(grouped).sort((a, b) => {
        return getDisplayCategoryName(a).localeCompare(getDisplayCategoryName(b));
      });

      // Render each category group
      sortedCategories.forEach(cat => {
        const categoryProducts = grouped[cat];
        
        // Sort products alphabetically within this category
        categoryProducts.sort((a, b) => a.name.localeCompare(b.name));

        const section = document.createElement('div');
        section.classList.add('category-group-section');
        section.style.marginBottom = '50px';

        const heading = document.createElement('h2');
        heading.classList.add('category-group-title');
        heading.style.fontFamily = "'Outfit', sans-serif";
        heading.style.fontSize = '1.8rem';
        heading.style.fontWeight = '700';
        heading.style.color = 'var(--color-text-primary)';
        heading.style.marginBottom = '25px';
        heading.style.borderBottom = '2px solid var(--color-brand-accent)';
        heading.style.paddingBottom = '8px';
        heading.style.textTransform = 'uppercase';
        heading.style.letterSpacing = '0.05em';
        heading.textContent = getDisplayCategoryName(cat);

        const grid = document.createElement('div');
        grid.classList.add('product-grid');

        categoryProducts.forEach(product => {
          const card = createProductCard(product);
          grid.appendChild(card);
        });

        section.appendChild(heading);
        section.appendChild(grid);
        productGrid.appendChild(section);
      });

    } else {
      productGrid.style.display = 'grid';

      // Sort items
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.basePrice - b.basePrice);
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.basePrice - a.basePrice);
      } else if (sortBy === 'name-az') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      filtered.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
      });
    }
  }

  // Parse query parameters from URL (e.g. ?q=product name or ?filter=category)
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  const filterParam = urlParams.get('filter');

  if (qParam && storeSearch) {
    storeSearch.value = qParam;
    searchQuery = qParam.toLowerCase().trim();
  }
  
  if (filterParam) {
    const matchingBtn = Array.from(filterButtons).find(btn => btn.dataset.filter === filterParam);
    if (matchingBtn) {
      filterButtons.forEach(b => b.classList.remove('active'));
      matchingBtn.classList.add('active');
      currentFilter = filterParam;
    }
  }

  renderProducts();

  // Highlight and smooth scroll to product card if hash is present
  const hash = window.location.hash;
  if (hash && hash.startsWith('#product-')) {
    setTimeout(() => {
      const targetElement = document.getElementById(hash.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a premium, glowing outline to guide the user's eyes
        targetElement.style.outline = '2px solid var(--color-brand-accent)';
        targetElement.style.boxShadow = '0 0 32px rgba(83, 0, 155, 0.45)';
        targetElement.style.transition = 'all 0.6s ease';
        
        // Gracefully remove highlight outline after 2.5s
        setTimeout(() => {
          targetElement.style.outline = 'none';
          targetElement.style.boxShadow = '';
        }, 2500);
      }
    }, 400); // Small timeout to ensure DOM layout is completely settled
  }
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
    
    // Open Checkout Details Modal
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      checkoutModal.classList.add('active');
    }
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
          <span class="cart-item-price">₦${itemCost.toFixed(2)}</span>
          
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

    cartSubtotal.innerText = `₦${subtotal.toFixed(2)}`;
    cartTax.innerText = `₦${tax.toFixed(2)}`;
    cartGrandTotal.innerText = `₦${total.toFixed(2)}`;
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
        // Filter for active products dynamically
        const activeProducts = dbProducts.filter(p => p.is_active !== 0);
        
        // Map database products to the storefront format
        products = activeProducts.map(p => {
          const category = normalizeCategory(p.category);
          
          // Set swatches and images dynamically from p.images if available
          let swatches = ['#000000', '#ffffff', '#53009B'];
          let colorImages = {}; // Map color hex -> image URL
          
          if (p.images && p.images.length > 0) {
            swatches = p.images.map(img => img.color_code.toUpperCase());
            p.images.forEach(img => {
              colorImages[img.color_code.toUpperCase()] = img.image_url;
            });
          } else {
            // Fallback for older seeded items
            colorImages['#000000'] = p.image_url;
            colorImages['#ffffff'] = p.image_url;
            colorImages['#53009B'] = p.image_url;
          }

          // Sizes and unique pricing
          let sizes = [];
          if (p.sizes && p.sizes.length > 0) {
            sizes = p.sizes.map(sz => ({
              size_name: sz.size_name,
              price: parseFloat(sz.price)
            }));
          }

          // Primary image
          let primaryImage = p.image_url || 'assets/tshirt_base.svg';
          if (p.images && p.images.length > 0) {
            const primary = p.images.find(img => img.is_primary === 1) || p.images[0];
            primaryImage = primary.image_url;
          }
          
          return {
            id: p.id,
            name: p.title,
            category: category,
            basePrice: parseFloat(p.price) || 29.99,
            image: primaryImage,
            description: p.description || '',
            swatches: swatches,
            colorImages: colorImages, // Attach color-image map
            sizes: sizes // Attach size-pricing list
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
  if (cat.includes('apparel') || cat.includes('shirt') || cat.includes('tee') || cat.includes('hoodie') || cat.includes('cap') || cat.includes('bag')) return 'apparels';
  if (cat.includes('stationery') || cat.includes('journal') || cat.includes('book') || cat.includes('pen') || cat.includes('card')) return 'stationery';
  if (cat.includes('packaging') || cat.includes('nylon') || cat.includes('thank')) return 'packaging';
  if (cat.includes('gadget') || cat.includes('mouse') || cat.includes('headset') || cat.includes('drive') || cat.includes('sleeve') || cat.includes('power')) return 'gadgets';
  if (cat.includes('gift') || cat.includes('mug') || cat.includes('bottle') || cat.includes('key') || cat.includes('box') || cat.includes('lanyard') || cat.includes('ball')) return 'gifts';
  if (cat.includes('lifestyle') || cat.includes('pillow') || cat.includes('frame')) return 'lifestyle';
  return 'apparels'; // default fallback
}

/* ==========================================================================
   Dynamic Site Settings Customizer Sync
   ========================================================================== */
async function loadDynamicSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const settings = await res.json();
      if (settings) {
        // 1. Dynamic Site Title
        if (settings.site_title) {
          document.title = settings.site_title;
        }
        
        // 2. Dynamic Hero Texts (on index.html landing page)
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.hero-description');
        if (heroTitle && settings.hero_headline) {
          heroTitle.textContent = settings.hero_headline;
        }
        if (heroDesc && settings.hero_subtext) {
          heroDesc.textContent = settings.hero_subtext;
        }
        
        // 3. Dynamic Footer Copyright
        const footerBottomP = document.querySelector('.footer-bottom p');
        if (footerBottomP && settings.footer_text) {
          footerBottomP.textContent = settings.footer_text;
        }
        
        // 4. Dynamic Color Customization applying custom brand theme variables dynamically
        if (settings.primary_color) {
          document.documentElement.style.setProperty('--color-brand-accent', settings.primary_color);
        }
        if (settings.accent_color) {
          document.documentElement.style.setProperty('--color-brand-yellow', settings.accent_color);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load settings from database API.", err);
  }
}

/* ==========================================================================
   Monnify Checkout Modal Logic
   ========================================================================== */
function initCheckoutModal() {
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutModalCloseBtn = document.getElementById('checkoutModalCloseBtn');
  const checkoutCancelBtn = document.getElementById('checkoutCancelBtn');
  const checkoutForm = document.getElementById('checkoutForm');

  if (!checkoutModal || !checkoutForm) return;

  const hideModal = () => checkoutModal.classList.remove('active');

  if (checkoutModalCloseBtn) checkoutModalCloseBtn.addEventListener('click', hideModal);
  if (checkoutCancelBtn) checkoutCancelBtn.addEventListener('click', hideModal);

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (cart.length === 0) return;

    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();

    if (!name || !email || !phone) {
      alert("Please fill all required checkout fields.");
      return;
    }

    // Calculate checkout totals in Naira
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.qty;
    });
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + tax;

    // Generate unique order/txn reference
    const txnRef = 'PRNTFL-' + Date.now();

    try {
      // Fetch latest Monnify credentials dynamically from Admin settings
      const settingsRes = await fetch('/api/settings');
      let apiKey = 'MK_TEST_XXXXXXXXXX';
      let contractCode = '9999999999';
      let monnifyMode = 'test';
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        // Securely prioritize configured settings keys
        apiKey = settings.monnify_api_key || apiKey;
        contractCode = settings.monnify_contract_code || contractCode;
        monnifyMode = settings.monnify_mode || monnifyMode;
      }

      // Initialize Monnify SDK overlay
      if (typeof window.MonnifySDK === 'undefined') {
        alert("Monnify Web Payment SDK failed to load. Please check your internet connection.");
        return;
      }

      const isTestMode = monnifyMode === 'live' ? false : (apiKey.includes('TEST') || apiKey.includes('XXXX'));

      console.log("Initializing Monnify checkout with:", {
        apiKey: apiKey,
        contractCode: contractCode,
        isTestMode: isTestMode,
        amount: totalAmount
      });

      window.MonnifySDK.initialize({
        amount: totalAmount,
        currency: "NGN",
        reference: txnRef,
        customerFullName: name,
        customerEmail: email,
        customerMobileNumber: phone,
        apiKey: apiKey,
        contractCode: contractCode,
        paymentDescription: "Payment for Printiful custom order " + txnRef,
        isTestMode: isTestMode,
        onComplete: function(response) {
          console.log("Monnify checkout callback complete:", response);
          
          // Close info modal
          hideModal();

          // Display success state dialog
          showModal(
            'PAYMENT SUCCESSFUL',
            `Thank you for your payment! Transaction Reference: ${response.transactionReference || response.paymentReference || txnRef}. We have successfully received your custom order request.`,
            'success-checkout'
          );

          // Clear storefront cart
          cart = [];
          saveCartToStorage();
          updateCartUI();
        },
        onClose: function(data) {
          console.log("Monnify checkout gateway dismissed:", data);
        }
      });

    } catch (err) {
      console.error("Monnify initialization error:", err);
      alert("Failed to initialize secure payment session. Please try again.");
    }
  });
}
