// Admin Dashboard Javascript Logic

// Global Dashboard State
let sessionToken = localStorage.getItem('printiful_token') || '';
let dashboardProducts = [];
let uploadMode = 'file'; // 'file' or 'url'
let currentProductImage = ''; // track existing image in edit mode

// DOM Elements
const loginGate = document.getElementById('login-gate');
const adminLayout = document.getElementById('admin-layout');
const loginForm = document.getElementById('login-form');
const loginPassword = document.getElementById('admin-password');
const loginError = document.getElementById('login-error');
const togglePasswordBtn = document.getElementById('toggle-password-btn');
const logoutBtn = document.getElementById('logout-btn');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const tabPanels = document.querySelectorAll('.tab-panel');
const currentSectionTitle = document.getElementById('current-section-title');

// Stats
const statTotalProducts = document.getElementById('stat-total-products');
const statTotalCategories = document.getElementById('stat-total-categories');
const statAvgPrice = document.getElementById('stat-avg-price');

// Products CRUD
const productsTableBody = document.getElementById('products-table-body');
const productSearch = document.getElementById('product-search');
const addProductBtn = document.getElementById('add-product-btn');
const dbCleanupBtn = document.getElementById('db-cleanup-btn');

// Product Modal & Form
const productFormModal = document.getElementById('product-form-modal');
const productModalClose = document.getElementById('product-modal-close');
const productCrudForm = document.getElementById('product-crud-form');
const productFormTitle = document.getElementById('product-form-title');
const crudProductId = document.getElementById('crud-product-id');
const crudTitle = document.getElementById('crud-title');
const crudPrice = document.getElementById('crud-price');
const crudCategory = document.getElementById('crud-category');
const crudDescription = document.getElementById('crud-description');
const btnCancelCrud = document.getElementById('btn-cancel-crud');

// Dynamic Color-Image Variants & Status
const btnAddVariant = document.getElementById('btn-add-variant');
const variantsContainer = document.getElementById('variants-container');
const crudIsActive = document.getElementById('crud-is-active');

// Size Checkboxes & Input price fields
const sizeCheckboxes = document.querySelectorAll('.size-checkbox');

// Settings Form
const themeSettingsForm = document.getElementById('theme-settings-form');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const settingSiteTitle = document.getElementById('setting-site-title');
const settingSiteDescription = document.getElementById('setting-site-description');
const settingHeroHeadline = document.getElementById('setting-hero-headline');
const settingHeroSubtext = document.getElementById('setting-hero-subtext');
const settingPrimaryColor = document.getElementById('setting-primary-color');
const settingPrimaryColorText = document.getElementById('setting-primary-color-text');
const settingSecondaryColor = document.getElementById('setting-secondary-color');
const settingSecondaryColorText = document.getElementById('setting-secondary-color-text');
const settingAccentColor = document.getElementById('setting-accent-color');
const settingAccentColorText = document.getElementById('setting-accent-color-text');
const settingContactEmail = document.getElementById('setting-contact-email');
const settingContactPhone = document.getElementById('setting-contact-phone');
const settingFooterText = document.getElementById('setting-footer-text');
const settingMonnifyApiKey = document.getElementById('setting-monnify-api-key');
const settingMonnifyContractCode = document.getElementById('setting-monnify-contract-code');

// Init
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Setup Events
function setupEventListeners() {
  // Login Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPassword.setAttribute('type', type);
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
  });

  // Login Submit
  loginForm.addEventListener('submit', handleLogin);

  // Logout Action
  logoutBtn.addEventListener('click', handleLogout);

  // Sidebar Tab Switch
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab, item);
    });
  });

  // Database Manual Cleanup Trigger
  dbCleanupBtn.addEventListener('click', runImageCleanup);

  // Product Search Filter
  productSearch.addEventListener('input', filterProductsTable);

  // Product CRUD Modals
  addProductBtn.addEventListener('click', () => openProductModal(null));
  productModalClose.addEventListener('click', closeProductModal);
  btnCancelCrud.addEventListener('click', closeProductModal);
  productCrudForm.addEventListener('submit', handleProductSubmit);

  // Dynamic size checkboxes toggle price visibility
  sizeCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const targetInput = document.getElementById(cb.getAttribute('data-target'));
      if (cb.checked) {
        targetInput.style.display = 'block';
        targetInput.setAttribute('required', 'true');
      } else {
        targetInput.style.display = 'none';
        targetInput.removeAttribute('required');
        targetInput.value = '';
      }
    });
  });

  // Variant row addition
  btnAddVariant.addEventListener('click', () => addVariantRow());

  // Settings color pickers dynamic linking
  linkColors(settingPrimaryColor, settingPrimaryColorText);
  linkColors(settingSecondaryColor, settingSecondaryColorText);
  linkColors(settingAccentColor, settingAccentColorText);

  // Settings form handling
  themeSettingsForm.addEventListener('submit', handleSettingsSubmit);
  resetSettingsBtn.addEventListener('click', loadSettingsData);
}

// 1. Authentication
function checkAuth() {
  if (sessionToken === 'mock-session-token-printiful-123') {
    loginGate.classList.add('hide');
    adminLayout.classList.remove('hide');
    initializeDashboard();
  } else {
    loginGate.classList.remove('hide');
    adminLayout.classList.add('hide');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const password = loginPassword.value;
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (res.ok) {
      const data = await res.json();
      sessionToken = data.token;
      localStorage.setItem('printiful_token', sessionToken);
      loginError.classList.add('hide');
      loginPassword.value = '';
      checkAuth();
      showToast('Authentication Successful', 'success');
    } else {
      loginError.classList.remove('hide');
      showToast('Invalid Password', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Connection failed', 'error');
  }
}

function handleLogout() {
  sessionToken = '';
  localStorage.removeItem('printiful_token');
  checkAuth();
  showToast('Logged out successfully', 'success');
}

// 2. Navigation Tab Switcher
function switchTab(tabId, navItem) {
  // Toggle nav buttons active
  navItems.forEach(btn => btn.classList.remove('active'));
  navItem.classList.add('active');

  // Toggle panel visibility
  tabPanels.forEach(panel => panel.classList.add('hide'));
  const activePanel = document.getElementById(tabId);
  activePanel.classList.remove('hide');

  // Title update
  const panelName = navItem.innerText.trim();
  currentSectionTitle.innerText = panelName === 'Overview' ? 'Dashboard Overview' : panelName;
}

// 3. Dashboard Data Fetching
function initializeDashboard() {
  loadProductsData();
  loadSettingsData();
}

async function loadProductsData() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to load products');
    dashboardProducts = await res.json();
    
    updateStatsCards();
    renderProductsTable();
    updateCategoryDatalist();
  } catch (err) {
    console.error('Error fetching products:', err);
    showToast('Failed to load products database.', 'error');
  }
}

// Update Overview Statistics
function updateStatsCards() {
  statTotalProducts.textContent = dashboardProducts.length;
  
  // Calculate unique categories
  const categories = new Set();
  let totalPrice = 0;
  
  dashboardProducts.forEach(p => {
    if (p.category) categories.add(p.category);
    totalPrice += parseFloat(p.price || 0);
  });
  
  statTotalCategories.textContent = categories.size;
  
  const avg = dashboardProducts.length > 0 ? (totalPrice / dashboardProducts.length) : 0;
  statAvgPrice.textContent = `₦${avg.toFixed(2)}`;
}

// Rebuild category options datalist in forms
function updateCategoryDatalist() {
  const datalist = document.getElementById('categories-list');
  const categories = new Set();
  dashboardProducts.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  
  let html = '';
  categories.forEach(cat => {
    html += `<option value="${cat}">`;
  });
  datalist.innerHTML = html;
}

// Render Products management list
function renderProductsTable() {
  productsTableBody.innerHTML = '';
  
  if (dashboardProducts.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No products in store. Click 'Add Product' to list your first item.
        </td>
      </tr>
    `;
    return;
  }

  // Sort products alphabetically by Category, then alphabetically by Title
  const sortedProducts = [...dashboardProducts].sort((a, b) => {
    const catA = (a.category || 'General').toLowerCase();
    const catB = (b.category || 'General').toLowerCase();
    if (catA !== catB) {
      return catA.localeCompare(catB);
    }
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();
    return titleA.localeCompare(titleB);
  });

  sortedProducts.forEach(product => {
    const tr = document.createElement('tr');
    
    const imageUrl = product.image_url || '/assets/tshirt_base.svg';
    const priceText = parseFloat(product.price).toFixed(2);
    
    const isLive = product.is_active === 1 || product.is_active === undefined;
    const statusBadge = isLive
      ? `<span style="
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(16,185,129,0.12); color: #10b981;
            border: 1px solid rgba(16,185,129,0.35);
            padding: 4px 10px; border-radius: 20px;
            font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
            white-space: nowrap;
          ">
          <span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;box-shadow:0 0 6px #10b981;"></span>
          LIVE
        </span>`
      : `<span style="
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(100,116,139,0.12); color: #94a3b8;
            border: 1px solid rgba(100,116,139,0.3);
            padding: 4px 10px; border-radius: 20px;
            font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
            white-space: nowrap;
          ">
          <span style="width:6px;height:6px;border-radius:50%;background:#94a3b8;display:inline-block;"></span>
          HIDDEN
        </span>`;

    tr.innerHTML = `
      <td>
        <div class="table-thumbnail">
          <img src="${imageUrl}" alt="${product.title}">
        </div>
      </td>
      <td><strong>${product.title}</strong></td>
      <td><span class="table-category">${product.category || 'General'}</span></td>
      <td><span class="table-price">₦${priceText}</span></td>
      <td style="text-align: center;">${statusBadge}</td>
      <td><div class="table-description">${product.description || '-'}</div></td>
      <td>
        <div class="table-actions">
          <button onclick="openProductModal(${product.id})" class="action-btn" title="Edit Product"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="deleteProduct(${product.id})" class="action-btn btn-delete" title="Delete Product"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

// Filter table items dynamically
function filterProductsTable() {
  const query = productSearch.value.toLowerCase().trim();
  const rows = productsTableBody.getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty row message
    if (row.cells.length < 7) continue;

    const title = row.cells[1].innerText.toLowerCase();
    const category = row.cells[2].innerText.toLowerCase();
    const desc = row.cells[5].innerText.toLowerCase(); // shifted by new Status column

    if (title.includes(query) || category.includes(query) || desc.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  }
}

// 4. Custom settings
async function loadSettingsData() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    const settings = await res.json();

    // Populate form fields
    settingSiteTitle.value = settings.site_title || '';
    settingSiteDescription.value = settings.site_description || '';
    settingHeroHeadline.value = settings.hero_headline || '';
    settingHeroSubtext.value = settings.hero_subtext || '';
    
    // Theme colors
    settingPrimaryColor.value = settings.primary_color || '#6366f1';
    settingPrimaryColorText.value = settings.primary_color || '#6366f1';
    
    settingSecondaryColor.value = settings.secondary_color || '#0f172a';
    settingSecondaryColorText.value = settings.secondary_color || '#0f172a';
    
    settingAccentColor.value = settings.accent_color || '#f43f5e';
    settingAccentColorText.value = settings.accent_color || '#f43f5e';

    settingContactEmail.value = settings.contact_email || '';
    settingContactPhone.value = settings.contact_phone || '';
    settingFooterText.value = settings.footer_text || '';
    settingMonnifyApiKey.value = settings.monnify_api_key || '';
    settingMonnifyContractCode.value = settings.monnify_contract_code || '';
  } catch (err) {
    console.error('Error loading settings:', err);
    showToast('Failed to load site layout configuration.', 'error');
  }
}

// Sync Color Picker with HEX Text box
function linkColors(picker, textBox) {
  picker.addEventListener('input', () => {
    textBox.value = picker.value;
  });
  textBox.addEventListener('input', () => {
    if (textBox.checkValidity()) {
      picker.value = textBox.value;
    }
  });
}

// Settings submit
async function handleSettingsSubmit(e) {
  e.preventDefault();

  const settingsPayload = {
    site_title: settingSiteTitle.value,
    site_description: settingSiteDescription.value,
    hero_headline: settingHeroHeadline.value,
    hero_subtext: settingHeroSubtext.value,
    primary_color: settingPrimaryColorText.value,
    secondary_color: settingSecondaryColorText.value,
    accent_color: settingAccentColorText.value,
    contact_email: settingContactEmail.value,
    contact_phone: settingContactPhone.value,
    footer_text: settingFooterText.value,
    monnify_api_key: settingMonnifyApiKey.value,
    monnify_contract_code: settingMonnifyContractCode.value
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(settingsPayload)
    });

    if (res.ok) {
      showToast('Store layout settings saved.', 'success');
      loadSettingsData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save settings.', 'error');
    }
  } catch (err) {
    console.error('Settings submit error:', err);
    showToast('Failed to connect to backend server.', 'error');
  }
}

// 5. Product CRUD Form Logic
function openProductModal(productId) {
  // Clear variants container
  variantsContainer.innerHTML = '';

  // Reset size price controls
  sizeCheckboxes.forEach(cb => {
    cb.checked = false;
    const targetInput = document.getElementById(cb.getAttribute('data-target'));
    if (targetInput) {
      targetInput.style.display = 'none';
      targetInput.removeAttribute('required');
      targetInput.value = '';
    }
  });

  // Clear presets
  productCrudForm.reset();
  crudProductId.value = '';
  
  if (productId === null) {
    // Add product state
    productFormTitle.innerText = "Add New Product";
    crudProductId.value = '';
    crudIsActive.checked = true;
    
    // Add a single blank variant row by default
    addVariantRow();
  } else {
    // Edit product state
    productFormTitle.innerText = "Modify Product";
    const product = dashboardProducts.find(p => p.id === productId);
    if (!product) return;

    crudProductId.value = product.id;
    crudTitle.value = product.title;
    crudPrice.value = parseFloat(product.price);
    crudCategory.value = product.category || '';
    crudDescription.value = product.description || '';
    crudIsActive.checked = (product.is_active === 1);

    // Populate Size Pricing
    if (product.sizes && Array.isArray(product.sizes)) {
      product.sizes.forEach(sz => {
        const checkbox = Array.from(sizeCheckboxes).find(cb => cb.value === sz.size_name);
        if (checkbox) {
          checkbox.checked = true;
          const targetInput = document.getElementById(checkbox.getAttribute('data-target'));
          if (targetInput) {
            targetInput.style.display = 'block';
            targetInput.setAttribute('required', 'true');
            targetInput.value = sz.price;
          }
        }
      });
    }

    // Populate Image-Color Mappings
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => addVariantRow(img));
    } else {
      // Fallback: create a primary variant using existing product image
      if (product.image_url) {
        addVariantRow({ image_url: product.image_url, color_code: '#53009B', is_primary: 1 });
      } else {
        addVariantRow();
      }
    }
  }

  productFormModal.classList.add('open');
}

function closeProductModal() {
  productFormModal.classList.remove('open');
}

/* ── Dynamic Product Image & Color Variants Row Builder ── */
function addVariantRow(data = null) {
  const rowId = 'variant-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const row = document.createElement('div');
  row.classList.add('variant-row');
  row.id = rowId;
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.gap = '10px';
  row.style.background = 'rgba(255,255,255,0.01)';
  row.style.padding = '8px 12px';
  row.style.borderRadius = '6px';
  row.style.border = '1px solid var(--border-color)';

  const initialColor = data ? data.color_code : '#53009B';
  const initialUrl = data ? data.image_url : '';
  const isPrimary = data ? (data.is_primary === 1) : (variantsContainer.children.length === 0);

  row.innerHTML = `
    <input type="color" class="variant-color-picker" style="width:34px; padding:0; border:none; height:34px; border-radius:4px; cursor:pointer; flex-shrink:0;" value="${initialColor}">
    <input type="text" class="variant-color-code" placeholder="#HEX" pattern="^#([A-Fa-f0-9]{6})$" required style="width:85px; padding:6px 8px; font-size:0.8rem; border-radius:4px; flex-shrink:0;" value="${initialColor}">

    <input type="text" class="variant-image-url" placeholder="Upload file or enter image URL" required style="flex-grow:1; padding:6px 10px; font-size:0.8rem; border-radius:4px;" value="${initialUrl}">
    <input type="file" class="variant-file" accept="image/*" style="display:none;">
    <button type="button" class="btn btn-outline btn-xs btn-upload-variant" style="padding:6px 10px; font-size:0.75rem; white-space:nowrap; flex-shrink:0;"><i class="fa-solid fa-cloud-arrow-up"></i> Upload</button>

    <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem; white-space:nowrap; cursor:pointer; font-weight:600; flex-shrink:0; margin:0;">
      <input type="radio" name="variant-primary" class="variant-primary-radio" ${isPrimary ? 'checked' : ''} style="width:auto; margin:0;"> Main
    </label>

    <button type="button" class="btn btn-danger btn-xs btn-remove-variant" style="padding:6px 10px; font-size:0.75rem; flex-shrink:0; background:var(--color-accent) !important; color:#fff !important; border:none !important;"><i class="fa-solid fa-trash-can"></i></button>
  `;

  // Dynamic HEX to Picker bindings
  const picker = row.querySelector('.variant-color-picker');
  const textBox = row.querySelector('.variant-color-code');
  picker.addEventListener('input', () => {
    textBox.value = picker.value.toUpperCase();
  });
  textBox.addEventListener('input', () => {
    if (textBox.value.match(/^#[A-Fa-f0-9]{6}$/)) {
      picker.value = textBox.value;
    }
  });

  // Dynamic file upload
  const fileInput = row.querySelector('.variant-file');
  const uploadBtn = row.querySelector('.btn-upload-variant');
  const urlInput = row.querySelector('.variant-image-url');

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    if (fileInput.files.length === 0) return;
    
    uploadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;
    uploadBtn.disabled = true;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        },
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        urlInput.value = result.image_url;
        uploadBtn.innerHTML = `<i class="fa-solid fa-check" style="color:var(--color-success)"></i> Done`;
      } else {
        alert("Image upload failed.");
        uploadBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Fail`;
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
      uploadBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Error`;
    } finally {
      uploadBtn.disabled = false;
      setTimeout(() => {
        uploadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Upload`;
      }, 3000);
    }
  });

  // Row deletion
  const removeBtn = row.querySelector('.btn-remove-variant');
  removeBtn.addEventListener('click', () => {
    if (variantsContainer.children.length <= 1) {
      alert("At least one image-color mapping variant is required.");
      return;
    }
    row.remove();
  });

  variantsContainer.appendChild(row);
}

// Form Submit (Add/Edit)
async function handleProductSubmit(e) {
  e.preventDefault();

  const id = crudProductId.value;
  const isEdit = id !== '';

  // Gather variants (images & colors)
  const imageRows = variantsContainer.querySelectorAll('.variant-row');
  const images = [];
  let primaryChosen = false;

  for (const row of imageRows) {
    const colorCode = row.querySelector('.variant-color-code').value.trim();
    const imageUrl = row.querySelector('.variant-image-url').value.trim();
    const isPrimary = row.querySelector('.variant-primary-radio').checked;

    if (!colorCode || !imageUrl) {
      showToast('All image variants must have a required color and image file/URL.', 'error');
      return;
    }

    images.push({
      color_code: colorCode,
      image_url: imageUrl,
      is_primary: isPrimary ? 1 : 0
    });

    if (isPrimary) primaryChosen = true;
  }

  if (images.length === 0) {
    showToast('At least one color image variant is required.', 'error');
    return;
  }

  // If no variant is explicitly marked as primary, default the first one as primary
  if (!primaryChosen) {
    images[0].is_primary = 1;
  }

  // Gather Sizes & Prices
  const sizes = [];
  let sizeValidationFailed = false;
  sizeCheckboxes.forEach(cb => {
    if (cb.checked) {
      const priceInput = document.getElementById(cb.getAttribute('data-target'));
      const priceVal = priceInput ? priceInput.value.trim() : '';
      if (!priceVal) {
        showToast(`Price for selected size "${cb.value}" is required.`, 'error');
        sizeValidationFailed = true;
        return;
      }
      sizes.push({
        size_name: cb.value,
        price: parseFloat(priceVal)
      });
    }
  });

  if (sizeValidationFailed) return;

  const payload = {
    title: crudTitle.value.trim(),
    description: crudDescription.value.trim(),
    price: parseFloat(crudPrice.value),
    category: crudCategory.value.trim() || 'General',
    is_active: crudIsActive.checked ? 1 : 0,
    images: images,
    sizes: sizes
  };

  const url = isEdit ? `/api/products/${id}` : '/api/products';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast(isEdit ? 'Product listing modified.' : 'Product listing created.', 'success');
      closeProductModal();
      loadProductsData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit product.', 'error');
    }
  } catch (err) {
    console.error('Product submit error:', err);
    showToast('Failed to connect to backend server.', 'error');
  }
}

// Delete product
async function deleteProduct(productId) {
  const product = dashboardProducts.find(p => p.id === productId);
  if (!product) return;

  const confirmMsg = `Are you sure you want to delete "${product.title}"? \n\nNote: If this product has an uploaded thumbnail, it will be permanently deleted after 3 days.`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (res.ok) {
      showToast('Product listing deleted.', 'success');
      loadProductsData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to delete product.', 'error');
    }
  } catch (err) {
    console.error('Product deletion error:', err);
    showToast('Failed to connect to backend server.', 'error');
  }
}

// 6. DB manual cleanup
async function runImageCleanup() {
  dbCleanupBtn.disabled = true;
  dbCleanupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cleaning...';
  
  try {
    const res = await fetch('/api/cleanup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      showToast('Image cleanup triggered successfully.', 'success');
    } else {
      showToast('Failed to execute cleanup script.', 'error');
    }
  } catch (err) {
    console.error('Cleanup trigger error:', err);
    showToast('Failed to communicate with cleanup worker.', 'error');
  } finally {
    dbCleanupBtn.disabled = false;
    dbCleanupBtn.innerHTML = '<i class="fa-solid fa-broom"></i> Run Image Cleanup';
  }
}

// 7. Toast Alerts System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove toast after 3.5 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
