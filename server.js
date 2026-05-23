const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup file paths
const dbPath = path.join(__dirname, 'ecommerce.db');
const rootDir = __dirname;          // Storefront lives here
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(rootDir, 'assets');
const uploadsDir = path.join(publicDir, 'uploads');

// Ensure directory structure exists
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Storefront routes ──
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.get('/store.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'store.html'));
});

// ── Admin Dashboard routes ──
// Accessible at /admin  OR  /admin.html  OR  /admin/admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// Serve the storefront root-level files (styles.css, app.js, /assets/)
app.use(express.static(rootDir, { index: false, dotfiles: 'ignore' }));

// Serve admin CSS, JS and its assets from /public under the same root
// so relative paths like admin.css, admin.js, /uploads/ all work
app.use(express.static(publicDir, { index: false, dotfiles: 'ignore' }));

// Explicit upload and assets aliases
app.use('/uploads', express.static(uploadsDir));
app.use('/assets',  express.static(assetsDir));


// Default assets are served directly from the root assets/ directory; no copying required.

// Database helper variables
let db;
let SQL;

// Helper functions for Database interactions
function run(query, params = []) {
  db.run(query, params);
  saveDatabase();
}

function get(query, params = []) {
  const stmt = db.prepare(query);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function all(query, params = []) {
  const stmt = db.prepare(query);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Initialize database schema
function initializeSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deleted_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings
  const defaultSettings = {
    site_title: "Printiful",
    site_description: "Printiful crafts premium customized garments on heavyweight luxury blanks. High-fidelity Direct-to-Garment prints, detailed industrial embroidery, and curated streetwear archives designed to endure.",
    hero_headline: "INTENTIONAL DESIGN. UNCOMPROMISED QUALITY.",
    hero_subtext: "Premium customized garments crafted on heavyweight luxury blanks. High-fidelity Direct-to-Garment prints, detailed industrial embroidery, and curated streetwear archives designed to endure.",
    primary_color: "#53009B", // Purple
    secondary_color: "#0D0015", // Deep purple-black
    accent_color: "#FFFF00", // Yellow
    contact_email: "support@printiful.store",
    contact_phone: "+1 (555) 774-6843",
    footer_text: "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed."
  };

  const stmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaultSettings)) {
    stmt.run([key, value]);
  }
  stmt.free();

  // Check if we have products; if not, populate defaults
  const productCount = get("SELECT count(*) as count FROM products");
  if (productCount && productCount.count === 0) {
    const defaultProducts = [
      {
        title: "Stand Still Black Tee",
        description: "Heavyweight streetwear tee featuring premium black cotton with a minimalist signature chest print.",
        price: 29.99,
        image_url: "/assets/Image/Stand Still Black.jpeg",
        category: "T-Shirts"
      },
      {
        title: "Love Won Premium Tee",
        description: "Vibrant custom streetwear graphic printed on combed pre-shrunk cotton blank.",
        price: 29.99,
        image_url: "/assets/Image/Love won tee.jpeg",
        category: "T-Shirts"
      },
      {
        title: "Affirmation Statement Tee",
        description: "Streetwear graphic tee highlighting bold positive statements on front and back panels.",
        price: 27.99,
        image_url: "/assets/Image/Affirmation Tees.jpeg",
        category: "T-Shirts"
      },
      {
        title: "Printiful Branded Blank Tee",
        description: "Classic heavyweight streetwear basic tee, ideal for matching layers or raw branding.",
        price: 24.99,
        image_url: "/assets/Image/Branded Teeshirts.jpeg",
        category: "T-Shirts"
      },
      {
        title: "Branded Hardcover Journal",
        description: "Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.",
        price: 15.99,
        image_url: "/assets/Image/Branded Journals.jpeg",
        category: "Stationery"
      },
      {
        title: "Magic Heat-Activated Mug",
        description: "Heat-activated ceramic color changing mug revealing brand graphics under warmth.",
        price: 14.99,
        image_url: "/assets/Image/Magic mug.jpeg",
        category: "Accessories"
      },
      {
        title: "Custom Matte Bookmark Set",
        description: "Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.",
        price: 5.99,
        image_url: "/assets/Image/Book marks.jpeg",
        category: "Stationery"
      }
    ];

    const prodStmt = db.prepare("INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
    for (const p of defaultProducts) {
      prodStmt.run([p.title, p.description, p.price, p.image_url, p.category]);
    }
    prodStmt.free();
  }

  saveDatabase();
  console.log("Database schema initialized and populated with defaults.");
}

// Queue image for deletion in 3 days
function queueImageForDeletion(imageUrl) {
  if (!imageUrl || !imageUrl.includes('/uploads/')) return;
  const basename = path.basename(imageUrl);
  const imagePath = path.join(uploadsDir, basename);
  
  try {
    db.run(
      "INSERT INTO deleted_images (image_path, deleted_at) VALUES (?, datetime('now'))",
      [imagePath]
    );
    saveDatabase();
    console.log(`Queued image for deletion: ${imagePath}`);
  } catch (err) {
    console.error("Failed to queue image for deletion:", err);
  }
}

// Cleanup images that have been in the queue for more than 3 days
function cleanupDeletedImages() {
  console.log("Running deleted images cleanup routine...");
  try {
    // Select images deleted more than 3 days ago (using SQLite datetime function)
    const oldDeleted = all(
      "SELECT id, image_path FROM deleted_images WHERE deleted_at < datetime('now', '-3 days')"
    );
    
    oldDeleted.forEach(item => {
      const filePath = item.image_path;
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Permanently deleted image: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete file from disk: ${filePath}`, err);
        }
      } else {
        console.log(`Image file already missing from disk: ${filePath}`);
      }
      // Remove from queue
      db.run("DELETE FROM deleted_images WHERE id = ?", [item.id]);
    });
    
    if (oldDeleted.length > 0) {
      saveDatabase();
      console.log(`Cleanup complete. Removed ${oldDeleted.length} records.`);
    } else {
      console.log("No images to delete (none older than 3 days).");
    }
  } catch (err) {
    console.error("Error during image cleanup:", err);
  }
}

// Middleware: Admin Auth Gate
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === 'Bearer mock-session-token-printiful-123') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized access. Please login.' });
  }
}

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'prod-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// --- API ROUTES ---

// Auth Route
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Printiful123') {
    res.json({ success: true, token: 'mock-session-token-printiful-123' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password. Access Denied.' });
  }
});

// Site Settings Routes
app.get('/api/settings', (req, res) => {
  try {
    const rows = all("SELECT key, value FROM settings");
    const settingsObj = {};
    rows.forEach(row => {
      settingsObj[row.key] = row.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', requireAdmin, (req, res) => {
  try {
    const settings = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(settings)) {
      stmt.run([key, String(value)]);
    }
    stmt.free();
    saveDatabase();
    res.json({ success: true, message: "Settings updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product Routes
app.get('/api/products', (req, res) => {
  try {
    const products = all("SELECT * FROM products ORDER BY id DESC");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = get("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (supports JSON payload if no image file, or FormData if uploading an image)
app.post('/api/products', requireAdmin, upload.single('image'), (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let image_url = req.body.image_url || '';
    
    // If a file was uploaded, set the URL path
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    if (!title || !price) {
      return res.status(400).json({ error: "Title and price are required fields." });
    }

    run(
      "INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)",
      [title, description, parseFloat(price), image_url, category || 'General']
    );

    res.json({ success: true, message: "Product created successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
app.put('/api/products/:id', requireAdmin, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    let image_url = req.body.image_url;

    // Fetch existing product
    const existing = get("SELECT * FROM products WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    // If new file is uploaded
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
      // Queue old image for deletion if it was a file upload
      if (existing.image_url && existing.image_url !== image_url) {
        queueImageForDeletion(existing.image_url);
      }
    } else if (image_url === undefined) {
      // Keep old image if not supplied and not uploading new file
      image_url = existing.image_url;
    } else {
      // Image was explicitly updated to another URL or cleared
      if (existing.image_url && existing.image_url !== image_url) {
        queueImageForDeletion(existing.image_url);
      }
    }

    run(
      "UPDATE products SET title = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?",
      [title || existing.title, description || existing.description, price ? parseFloat(price) : existing.price, image_url, category || existing.category, id]
    );

    res.json({ success: true, message: "Product updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = get("SELECT * FROM products WHERE id = ?", [id]);
    
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Queue old image for deletion
    if (existing.image_url) {
      queueImageForDeletion(existing.image_url);
    }

    run("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper route to manually trigger image cleanup (useful for testing/verification)
app.post('/api/cleanup', requireAdmin, (req, res) => {
  cleanupDeletedImages();
  res.json({ success: true, message: "Cleanup completed." });
});

// Initialize sql.js and start server
initSqlJs().then(sqlLibrary => {
  SQL = sqlLibrary;
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
    console.log("Database loaded from file.");
    
    // Auto-migrate settings if loading legacy "Retro & Dino Shop"
    try {
      const titleSetting = get("SELECT value FROM settings WHERE key = 'site_title'");
      if (titleSetting && titleSetting.value === "Retro & Dino Shop") {
        console.log("Migrating database settings to Printiful...");
        const printifulSettings = {
          site_title: "Printiful",
          site_description: "Printiful crafts premium customized garments on heavyweight luxury blanks. High-fidelity Direct-to-Garment prints, detailed industrial embroidery, and curated streetwear archives designed to endure.",
          hero_headline: "INTENTIONAL DESIGN. UNCOMPROMISED QUALITY.",
          hero_subtext: "Premium customized garments crafted on heavyweight luxury blanks. High-fidelity Direct-to-Garment prints, detailed industrial embroidery, and curated streetwear archives designed to endure.",
          primary_color: "#53009B", // Purple
          secondary_color: "#0D0015", // Deep purple-black
          accent_color: "#FFFF00", // Yellow
          contact_email: "support@printiful.store",
          contact_phone: "+1 (555) 774-6843",
          footer_text: "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed."
        };
        const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
        for (const [key, value] of Object.entries(printifulSettings)) {
          stmt.run([key, value]);
        }
        stmt.free();
        saveDatabase();
        console.log("Database settings successfully migrated.");
      }
    } catch (err) {
      console.error("Failed to run database settings migration:", err);
    }

    // Check if the products table has legacy Dino products and migrate them to Printiful default products
    try {
      const dinoProduct = get("SELECT id FROM products WHERE title = 'Cute Dino Sweatshirt'");
      if (dinoProduct) {
        console.log("Migrating database products to Printiful defaults...");
        // Clear old products
        run("DELETE FROM products");
        
        const printifulDefaultProducts = [
          {
            title: "Stand Still Black Tee",
            description: "Heavyweight streetwear tee featuring premium black cotton with a minimalist signature chest print.",
            price: 29.99,
            image_url: "/assets/Image/Stand Still Black.jpeg",
            category: "T-Shirts"
          },
          {
            title: "Love Won Premium Tee",
            description: "Vibrant custom streetwear graphic printed on combed pre-shrunk cotton blank.",
            price: 29.99,
            image_url: "/assets/Image/Love won tee.jpeg",
            category: "T-Shirts"
          },
          {
            title: "Affirmation Statement Tee",
            description: "Streetwear graphic tee highlighting bold positive statements on front and back panels.",
            price: 27.99,
            image_url: "/assets/Image/Affirmation Tees.jpeg",
            category: "T-Shirts"
          },
          {
            title: "Printiful Branded Blank Tee",
            description: "Classic heavyweight streetwear basic tee, ideal for matching layers or raw branding.",
            price: 24.99,
            image_url: "/assets/Image/Branded Teeshirts.jpeg",
            category: "T-Shirts"
          },
          {
            title: "Branded Hardcover Journal",
            description: "Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.",
            price: 15.99,
            image_url: "/assets/Image/Branded Journals.jpeg",
            category: "Stationery"
          },
          {
            title: "Magic Heat-Activated Mug",
            description: "Heat-activated ceramic color changing mug revealing brand graphics under warmth.",
            price: 14.99,
            image_url: "/assets/Image/Magic mug.jpeg",
            category: "Accessories"
          },
          {
            title: "Custom Matte Bookmark Set",
            description: "Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.",
            price: 5.99,
            image_url: "/assets/Image/Book marks.jpeg",
            category: "Stationery"
          }
        ];

        const prodStmt = db.prepare("INSERT INTO products (title, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
        for (const p of printifulDefaultProducts) {
          prodStmt.run([p.title, p.description, p.price, p.image_url, p.category]);
        }
        prodStmt.free();
        saveDatabase();
        console.log("Database products successfully migrated.");
      }
    } catch (err) {
      console.error("Failed to run database products migration:", err);
    }
  } else {
    db = new SQL.Database();
    initializeSchema();
    console.log("New database initialized.");
  }

  // Run cleanup once on server startup
  cleanupDeletedImages();

  // Run image deletion check every 12 hours
  setInterval(cleanupDeletedImages, 12 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize SQLite Wasm database:", err);
  process.exit(1);
});
