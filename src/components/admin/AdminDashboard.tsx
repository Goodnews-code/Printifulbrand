"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from "lucide-react";
import type { Product, SiteSettings } from "@/types";
import { formatNaira, cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Apparels",
    image_url: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const reset = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      category: "Apparels",
      image_url: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Image upload failed.");
        return;
      }
      setForm((f) => ({ ...f, image_url: data.image_url as string }));
      setMessage("Image uploaded.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      category: form.category,
      image_url: form.image_url || undefined,
      is_active: form.is_active,
      images: form.image_url
        ? [
            {
              image_url: form.image_url,
              color_code: "#53009B",
              is_primary: true,
            },
          ]
        : undefined,
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

  const toggleActive = async (product: Product) => {
    const currentlyActive =
      product.is_active === 1 || product.is_active === true;
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({
        title: product.title,
        description: product.description || "",
        price: product.price,
        category: product.category || "Apparels",
        image_url: product.image_url || undefined,
        is_active: !currentlyActive,
        images: product.images?.length
          ? product.images
          : product.image_url
            ? [
                {
                  image_url: product.image_url,
                  color_code: "#53009B",
                  is_primary: true,
                },
              ]
            : undefined,
        sizes: product.sizes,
      }),
    });
    if (!res.ok) {
      setMessage("Failed to update visibility.");
      return;
    }
    setMessage(
      !currentlyActive
        ? `"${product.title}" is now LIVE.`
        : `"${product.title}" is now HIDDEN.`,
    );
    onChange();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      price: String(p.price),
      category: p.category || "Apparels",
      image_url: p.image_url || "",
      is_active: p.is_active === 1 || p.is_active === true,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
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
          <option value="Apparels">Apparels</option>
          <option value="Stationery">Stationery</option>
          <option value="Brand Packaging">Brand Packaging</option>
          <option value="Gadgets">Gadgets</option>
          <option value="Corporate Gift">Corporate Gift</option>
          <option value="Lifestyle">Lifestyle</option>
        </select>

        {/* Image: upload or URL */}
        <div className="space-y-2 border border-border bg-surface-alt p-3">
          <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted">
            Product image
          </p>
          {form.image_url ? (
            <div className="relative mx-auto h-36 w-full max-w-[180px] overflow-hidden border border-border bg-surface">
              <SmartImage
                src={form.image_url}
                alt="Preview"
                fillCover
                sizes="180px"
              />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center border border-dashed border-border text-muted">
              <ImagePlus size={28} strokeWidth={1.25} />
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 border border-border bg-surface px-3 py-2 font-ui text-sm font-medium disabled:opacity-60"
          >
            <Upload size={16} />
            {uploading ? "Uploading…" : "Import image from device"}
          </button>
          <input
            placeholder="Or paste image URL"
            value={form.image_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, image_url: e.target.value }))
            }
            className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-purple"
          />
        </div>

        {/* Live / Hidden toggle */}
        <label className="flex cursor-pointer items-center justify-between border border-border bg-surface-alt px-4 py-3">
          <span className="font-ui text-sm font-medium">
            Storefront visibility
          </span>
          <span className="flex items-center gap-3">
            <span
              className={cn(
                "font-ui text-xs font-bold uppercase tracking-wide",
                form.is_active ? "text-emerald-600" : "text-muted",
              )}
            >
              {form.is_active ? "Live" : "Hidden"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() =>
                setForm((f) => ({ ...f, is_active: !f.is_active }))
              }
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                form.is_active ? "bg-emerald-500" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
                  form.is_active && "translate-x-5",
                )}
              />
            </button>
          </span>
        </label>

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
          products.map((p) => {
            const live = p.is_active === 1 || p.is_active === true;
            const thumb =
              p.image_url ||
              p.images?.[0]?.image_url ||
              "/assets/tshirt_base.svg";
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 border border-border bg-surface p-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-surface-alt">
                  <SmartImage
                    src={thumb}
                    alt={p.title}
                    fillCover
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-semibold">
                    {p.title}
                  </p>
                  <p className="text-xs text-muted">
                    {p.category || "—"} · {formatNaira(p.price)}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1.5 font-ui text-[10px] font-bold uppercase tracking-wide",
                      live ? "text-emerald-600" : "text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        live ? "bg-emerald-500" : "bg-muted",
                      )}
                    />
                    {live ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={live}
                    aria-label={live ? "Hide product" : "Show product"}
                    title={live ? "Turn off (hide)" : "Turn on (live)"}
                    onClick={() => void toggleActive(p)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      live ? "bg-emerald-500" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
                        live && "translate-x-5",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    className="border border-border px-3 py-1.5 font-ui text-xs"
                    onClick={() => startEdit(p)}
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
            );
          })
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
