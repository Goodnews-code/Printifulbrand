"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import type { Product, SiteSettings } from "@/types";
import { formatNaira, cn } from "@/lib/utils";

const TOKEN_KEY = "printiful_token";

type Tab = "overview" | "products" | "settings";

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/products?all=true", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("/api/settings"),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
      if (sRes.ok) {
        setSettings(await sRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void loadData(token);
  }, [token, loadData]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Invalid security password");
      return;
    }
    const data = (await res.json()) as { token: string };
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setPassword("");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md border border-border bg-surface p-8 shadow-lg"
        >
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-brand-purple dark:text-brand-yellow">
            Admin Access
          </p>
          <h1 className="mt-2 font-heading text-3xl italic">
            Dashboard Gate
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter the admin passcode to manage products and settings.
          </p>
          <label className="mt-6 block space-y-1.5">
            <span className="font-ui text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
              placeholder="Enter password…"
            />
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="mt-6 w-full bg-brand-purple py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
          >
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Printiful Admin
            </p>
            <h1 className="font-heading text-2xl italic">Studio Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-border px-3 py-2 font-ui text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {(
            [
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package },
              { id: "settings", label: "Settings", icon: SettingsIcon },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-4 py-3 font-ui text-sm font-medium transition-colors",
                  tab === item.id
                    ? "border-brand-purple text-brand-purple dark:border-brand-yellow dark:text-brand-yellow"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {message && (
          <p className="mb-4 border border-brand-purple/20 bg-brand-purple/5 px-4 py-2 text-sm text-brand-purple dark:border-brand-yellow/20 dark:bg-brand-yellow/10 dark:text-brand-yellow">
            {message}
          </p>
        )}
        {loading && (
          <p className="mb-4 font-ui text-sm text-muted">Refreshing…</p>
        )}

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Products" value={String(products.length)} />
              <Stat
                label="Active"
                value={String(
                  products.filter(
                    (p) => p.is_active === 1 || p.is_active === true,
                  ).length,
                )}
              />
              <Stat
                label="Contact"
                value={settings.contact_email || "shopprintiful@gmail.com"}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 border border-border bg-surface p-5">
              <div className="flex-1">
                <p className="font-ui text-sm font-medium">Image cleanup</p>
                <p className="mt-1 text-sm text-muted">
                  Remove soft-deleted uploads older than 3 days.
                </p>
              </div>
              <button
                type="button"
                className="border border-border px-4 py-2 font-ui text-sm font-medium hover:border-brand-purple hover:text-brand-purple"
                onClick={async () => {
                  const res = await fetch("/api/cleanup", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMessage(data.error || "Cleanup failed.");
                    return;
                  }
                  setMessage(
                    `Cleanup done — removed ${data.removed ?? 0} of ${data.queued ?? 0} queued files.`,
                  );
                }}
              >
                Run cleanup
              </button>
              <a
                href="/store"
                className="border border-brand-purple bg-brand-purple px-4 py-2 font-ui text-sm font-medium text-white"
              >
                View shop
              </a>
            </div>
          </div>
        )}

        {tab === "products" && (
          <ProductsTab
            products={products}
            token={token}
            onChange={() => loadData(token)}
            setMessage={setMessage}
          />
        )}

        {tab === "settings" && (
          <SettingsTab
            settings={settings}
            token={token}
            onSaved={(next) => {
              setSettings(next);
              setMessage("Settings saved.");
            }}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="font-ui text-xs uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 truncate font-heading text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function ProductsTab({
  products,
  token,
  onChange,
  setMessage,
}: {
  products: Product[];
  token: string;
  onChange: () => void;
  setMessage: (m: string) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "apparels",
    image_url: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const reset = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      category: "apparels",
      image_url: "",
    });
    setEditingId(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      category: form.category,
      image_url: form.image_url || undefined,
      is_active: true,
    };

    const url =
      editingId != null ? `/api/products/${editingId}` : "/api/products";
    const method = editingId != null ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setMessage("Failed to save product.");
      return;
    }
    setMessage(editingId != null ? "Product updated." : "Product created.");
    reset();
    onChange();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) {
      setMessage("Failed to delete product.");
      return;
    }
    setMessage("Product deleted.");
    onChange();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form
        onSubmit={save}
        className="space-y-3 border border-border bg-surface p-5"
      >
        <h2 className="font-heading text-xl italic">
          {editingId != null ? "Edit Product" : "Add Product"}
        </h2>
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
        />
        <input
          required
          type="number"
          min={0}
          step="0.01"
          placeholder="Price (₦)"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
        >
          <option value="apparels">Apparels</option>
          <option value="stationery">Stationery</option>
          <option value="packaging">Brand Packaging</option>
          <option value="gadgets">Gadgets</option>
          <option value="gifts">Corporate Gifts</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) =>
            setForm((f) => ({ ...f, image_url: e.target.value }))
          }
          className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
        />
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-brand-purple py-2.5 font-ui text-sm font-semibold text-white"
          >
            {editingId != null ? "Update" : "Create"}
          </button>
          {editingId != null && (
            <button
              type="button"
              onClick={reset}
              className="border border-border px-4 py-2.5 font-ui text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted">No products yet.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-ui text-sm font-semibold">
                  {p.title}
                </p>
                <p className="text-xs text-muted">
                  {p.category || "—"} · {formatNaira(p.price)}
                  {(p.is_active === 0 || p.is_active === false) && " · inactive"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="border border-border px-3 py-1.5 font-ui text-xs"
                  onClick={() => {
                    setEditingId(p.id);
                    setForm({
                      title: p.title,
                      description: p.description || "",
                      price: String(p.price),
                      category: p.category || "apparels",
                      image_url: p.image_url || "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center border border-border px-2 py-1.5 text-red-600"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsTab({
  settings,
  token,
  onSaved,
}: {
  settings: Partial<SiteSettings>;
  token: string;
  onSaved: (s: SiteSettings) => void;
}) {
  const [form, setForm] = useState({
    site_title: "",
    site_description: "",
    hero_headline: "",
    hero_subtext: "",
    contact_email: "",
    contact_phone: "",
    footer_text: "",
    paystack_public_key: "",
  });

  useEffect(() => {
    setForm({
      site_title: settings.site_title || "",
      site_description: settings.site_description || "",
      hero_headline: settings.hero_headline || "",
      hero_subtext: settings.hero_subtext || "",
      contact_email: settings.contact_email || "",
      contact_phone: settings.contact_phone || "",
      footer_text: settings.footer_text || "",
      paystack_public_key: settings.paystack_public_key || "",
    });
  }, [settings]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    onSaved(await res.json());
  };

  const fields: Array<{ key: keyof typeof form; label: string; rows?: number }> =
    [
      { key: "site_title", label: "Site Title" },
      { key: "site_description", label: "Site Description", rows: 2 },
      { key: "hero_headline", label: "Hero Headline" },
      { key: "hero_subtext", label: "Hero Subtext", rows: 3 },
      { key: "contact_email", label: "Contact Email" },
      { key: "contact_phone", label: "Contact Phone" },
      { key: "footer_text", label: "Footer Text", rows: 2 },
      {
        key: "paystack_public_key",
        label: "Paystack Public Key (pk_test_… or pk_live_…)",
      },
    ];

  return (
    <form
      onSubmit={save}
      className="max-w-2xl space-y-4 border border-border bg-surface p-5"
    >
      {fields.map((field) => (
        <label key={field.key} className="block space-y-1.5">
          <span className="font-ui text-sm font-medium">{field.label}</span>
          {field.rows ? (
            <textarea
              rows={field.rows}
              value={form[field.key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field.key]: e.target.value }))
              }
              className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
            />
          ) : (
            <input
              value={form[field.key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field.key]: e.target.value }))
              }
              className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-brand-purple"
            />
          )}
        </label>
      ))}
      <p className="text-sm text-muted">
        Keep your Paystack <strong>secret key</strong> in{" "}
        <code className="text-xs">.env</code> as{" "}
        <code className="text-xs">PAYSTACK_SECRET_KEY</code> — never in the
        browser.
      </p>
      <button
        type="submit"
        className="bg-brand-purple px-6 py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
      >
        Save Settings
      </button>
    </form>
  );
}
