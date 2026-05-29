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
const crudFile = document.getElementById('crud-file');
const crudImageUrl = document.getElementById('crud-image-url');
const btnCancelCrud = document.getElementById('btn-cancel-crud');

// Image upload controls
const btnOptFile = document.getElementById('btn-opt-file');
const btnOptUrl = document.getElementById('btn-opt-url');
const wrapperUploadFile = document.getElementById('wrapper-upload-file');
const wrapperUploadUrl = document.getElementById('wrapper-upload-url');
const wrapperExistingPreview = document.getElementById('wrapper-existing-preview');
const existingImgPreview = document.getElementById('existing-img-preview');
const btnRemoveExistingImg = document.getElementById('btn-remove-existing-img');
const fileNamePreview = document.getElementById('file-name-preview');

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

  // Image upload selector buttons
  btnOptFile.addEventListener('click', () => switchUploadMode('file'));
  btnOptUrl.addEventListener('click', () => switchUploadMode('url'));
  
  // Show selected file name
  crudFile.addEventListener('change', () => {
    if (crudFile.files.length > 0) {
      fileNamePreview.textContent = `Selected: ${crudFile.files[0].name}`;
    } else {
      fileNamePreview.textContent = '';
    }
  });

  // Change existing product image
  btnRemoveExistingImg.addEventListener('click', () => {
    wrapperExistingPreview.classList.add('hide');
    // Enable upload selection inputs
    switchUploadMode('file');
  });

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

  dashboardProducts.forEach(product => {
    const tr = document.createElement('tr');
    
    const imageUrl = product.image_url || '/assets/tshirt_base.svg';
    const priceText = parseFloat(product.price).toFixed(2);
    
    tr.innerHTML = `
      <td>
        <div class="table-thumbnail">
          <img src="${imageUrl}" alt="${product.title}">
        </div>
      </td>
      <td><strong>${product.title}</strong></td>
      <td><span class="table-category">${product.category || 'General'}</span></td>
      <td><span class="table-price">₦${priceText}</span></td>
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
    if (row.cells.length < 6) continue;

    const title = row.cells[1].innerText.toLowerCase();
    const category = row.cells[2].innerText.toLowerCase();
    const desc = row.cells[4].innerText.toLowerCase();

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
  // Clear file uploads & presets
  productCrudForm.reset();
  crudProductId.value = '';
  currentProductImage = '';
  fileNamePreview.textContent = '';
  
  if (productId === null) {
    // Add product state
    productFormTitle.innerText = "Add New Product";
    crudProductId.value = '';
    
    // Hide current image previews
    wrapperExistingPreview.classList.add('hide');
    
    // Switch to file upload view by default
    switchUploadMode('file');
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
    
    if (product.image_url) {
      currentProductImage = product.image_url;
      // Show existing image preview
      existingImgPreview.src = product.image_url;
      wrapperExistingPreview.classList.remove('hide');
      
      // Hide other input fields until user presses 'Change Image'
      wrapperUploadFile.classList.add('hide');
      wrapperUploadUrl.classList.add('hide');
    } else {
      wrapperExistingPreview.classList.add('hide');
      switchUploadMode('file');
    }
  }

  productFormModal.classList.add('open');
}

function closeProductModal() {
  productFormModal.classList.remove('open');
}

function switchUploadMode(mode) {
  uploadMode = mode;
  btnOptFile.classList.remove('active');
  btnOptUrl.classList.remove('active');
  wrapperUploadFile.classList.add('hide');
  wrapperUploadUrl.classList.add('hide');

  if (mode === 'file') {
    btnOptFile.classList.add('active');
    wrapperUploadFile.classList.remove('hide');
  } else {
    btnOptUrl.classList.add('active');
    wrapperUploadUrl.classList.remove('hide');
  }
}

// Form Submit (Add/Edit)
async function handleProductSubmit(e) {
  e.preventDefault();

  const id = crudProductId.value;
  const isEdit = id !== '';
  
  const formData = new FormData();
  formData.append('title', crudTitle.value);
  formData.append('price', crudPrice.value);
  formData.append('category', crudCategory.value);
  formData.append('description', crudDescription.value);

  // Handle Image data based on state
  const isImgChanged = wrapperExistingPreview.classList.contains('hide');

  if (!isImgChanged && isEdit) {
    // Kept current image, pass existing url
    formData.append('image_url', currentProductImage);
  } else {
    // User is submitting new image
    if (uploadMode === 'file') {
      if (crudFile.files.length > 0) {
        formData.append('image', crudFile.files[0]);
      } else {
        // No file uploaded
        formData.append('image_url', '');
      }
    } else {
      formData.append('image_url', crudImageUrl.value.trim());
    }
  }

  const url = isEdit ? `/api/products/${id}` : '/api/products';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      },
      body: formData
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
