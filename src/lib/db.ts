import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const globalForDb = globalThis as unknown as {
  printifulDb?: Database.Database;
};

function resolveDbPath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "ecommerce.db");
}

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      color_code TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size_name TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deleted_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'NGN',
      status TEXT DEFAULT 'pending',
      payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedDefaults(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM settings").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const defaults: Record<string, string> = {
    site_title: "Printiful | Premium Custom wear & High-Fidelity Printing",
    site_description:
      "Printiful crafts premium customized merch on heavyweight luxury blanks.",
    hero_headline: "Be Bold! Be Seen!! Be Known!!!",
    hero_subtext:
      "Heavyweight luxury blanks. High-fidelity Direct-to-Merch prints, industrial embroidery, and curated wear designed to endure.",
    primary_color: "#53009B",
    secondary_color: "#0D0015",
    accent_color: "#FFFF00",
    contact_email: "shopprintiful@gmail.com",
    contact_phone: "+234 000 000 0000",
    footer_text:
      "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed.",
    paystack_public_key: "",
    paystack_secret_key: "",
  };

  const insert = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(defaults)) {
      insert.run(key, value);
    }
  });
  tx();
}

export function getDb() {
  if (globalForDb.printifulDb) return globalForDb.printifulDb;

  const dbPath = resolveDbPath();
  const legacyDb = path.join(process.cwd(), "legacy", "ecommerce.db");
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyDb)) {
    fs.copyFileSync(legacyDb, dbPath);
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createSchema(db);
  seedDefaults(db);

  globalForDb.printifulDb = db;
  return db;
}
