"use client";

import { FormEvent, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { Reveal } from "@/components/motion/Reveal";

export function InquiryForm() {
  const { settings } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    merch: "",
    qty: "",
    message: "",
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const email = settings.contact_email || "shopprintiful@gmail.com";
    const subject = encodeURIComponent(
      `Bulk Quote Request — ${form.merch || "Custom Merch"}`,
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nMerch: ${form.merch}\nQuantity: ${form.qty}\n\nNotes:\n${form.message}${file ? `\n\nAttached file (local): ${file.name}` : ""}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="inquiry" className="scroll-mt-20 bg-surface-alt py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block border border-brand-purple px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-brand-purple dark:border-brand-yellow dark:text-brand-yellow">
            Bulk Workspace
          </span>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Request a Custom Quote
          </h2>
          <p className="mt-4 text-muted">
            Custom prints, unique designs and orders exceeding 30 units
          </p>
        </Reveal>

        <Reveal delay={0.1}>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-12 max-w-3xl border border-border bg-surface p-6 sm:p-8"
          noValidate
        >
          {submitted && (
            <p className="mb-6 border border-brand-purple/30 bg-brand-purple/5 px-4 py-3 font-ui text-sm text-brand-purple dark:border-brand-yellow/30 dark:bg-brand-yellow/10 dark:text-brand-yellow">
              Opening your email client… If nothing opens, write us at{" "}
              {settings.contact_email || "shopprintiful@gmail.com"}.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name *"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. John Doe"
              required
            />
            <Field
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="e.g. john@email.com"
              required
            />
            <Field
              label="Merch Type *"
              value={form.merch}
              onChange={(v) => setForm((f) => ({ ...f, merch: v }))}
              placeholder="e.g. Heavyweight Hoodie"
              required
            />
            <Field
              label="Estimated Quantity *"
              type="number"
              value={form.qty}
              onChange={(v) => setForm((f) => ({ ...f, qty: v }))}
              placeholder="e.g. 50"
              required
              min={1}
            />
          </div>

          <label className="mt-5 block space-y-1.5">
            <span className="font-ui text-sm font-medium">
              Design Notes & Details *
            </span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder="Include print/embroidery preferences, placement guidelines, deadline specs…"
              className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
            />
          </label>

          <div className="mt-5 space-y-2">
            <p className="font-ui text-sm font-medium">
              Attach Artwork Mockup (Optional)
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border px-4 py-8 text-muted transition-colors hover:border-brand-purple hover:text-foreground dark:hover:border-brand-yellow"
            >
              <FileUp size={22} />
              <span className="font-ui text-sm">
                Drag file here or <strong>browse computer</strong>
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <div className="flex items-center justify-between border border-border px-3 py-2 text-sm">
                <span className="truncate">
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-brand-purple py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-yellow hover:text-brand-black"
          >
            Send Quote Request
          </button>
        </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-ui text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
      />
    </label>
  );
}
