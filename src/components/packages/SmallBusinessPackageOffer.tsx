"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatNaira } from "@/lib/utils";
import {
  SMALL_BUSINESS_PACKAGE_CATEGORY,
  SMALL_BUSINESS_PACKAGE_IMAGE,
  SMALL_BUSINESS_PACKAGE_PRODUCT_ID,
  resolveSmallBusinessPackage,
} from "@/lib/packages";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none ring-brand-purple/30 focus:ring-2";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.14em] text-muted";
const helpClass = "block text-xs text-muted";

export function SmallBusinessPackageOffer() {
  const { addItem } = useCart();
  const { settings } = useSettings();
  const pkg = resolveSmallBusinessPackage(settings);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [bagDesign, setBagDesign] = useState("");
  const [bagLogoUrl, setBagLogoUrl] = useState("");
  const [bagLogoName, setBagLogoName] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [bagText, setBagText] = useState("");
  const [cardContent, setCardContent] = useState("");
  const [tee1Color, setTee1Color] = useState("");
  const [tee2Color, setTee2Color] = useState("");
  const [tee1Design, setTee1Design] = useState("");
  const [tee2Design, setTee2Design] = useState("");

  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  async function handleLogoChange(file: File | null) {
    setError("");
    if (!file) {
      setBagLogoUrl("");
      setBagLogoName("");
      return;
    }

    setLogoUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/packages/upload-logo", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Logo upload failed");
      setBagLogoUrl(data.image_url as string);
      setBagLogoName(file.name);
    } catch (err) {
      setBagLogoUrl("");
      setBagLogoName("");
      if (logoInputRef.current) logoInputRef.current.value = "";
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  }

  function clearLogo() {
    setBagLogoUrl("");
    setBagLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setAdded(false);

    if (!pkg.enabled) {
      setError("This package is currently unavailable.");
      return;
    }
    if (logoUploading) {
      setError("Please wait for the logo upload to finish.");
      return;
    }

    const design = bagDesign.trim();
    const text = bagText.trim();
    const card = cardContent.trim();
    const c1 = tee1Color.trim();
    const c2 = tee2Color.trim();
    const d1 = tee1Design.trim();
    const d2 = tee2Design.trim();

    if (!design) {
      setError("Please describe the artwork/layout for the poly bags.");
      return;
    }
    if (!text) {
      setError("Please enter the exact words to print on the poly bags.");
      return;
    }
    if (!card) {
      setError("Please tell us what you want on the thank you cards.");
      return;
    }
    if (!c1 || !c2) {
      setError("Please choose a color for both tees.");
      return;
    }
    if (!d1 || !d2) {
      setError("Please describe the design for both tees.");
      return;
    }

    const color = [
      `Poly bag artwork/layout: ${design}`,
      `Poly bag printed wording: ${text}`,
      `Poly bag logo file: ${bagLogoUrl || "None"}`,
      `Thank you card: ${card}`,
      `Tee 1 color: ${c1}`,
      `Tee 1 design: ${d1}`,
      `Tee 2 color: ${c2}`,
      `Tee 2 design: ${d2}`,
    ].join("\n");

    addItem({
      productId: SMALL_BUSINESS_PACKAGE_PRODUCT_ID,
      name: pkg.title,
      category: SMALL_BUSINESS_PACKAGE_CATEGORY,
      price: pkg.price,
      image: SMALL_BUSINESS_PACKAGE_IMAGE,
      color,
      size: "Package",
    });
    setAdded(true);
  }

  if (!pkg.enabled) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface px-5 py-6 text-center text-sm text-muted">
        Package ordering is turned off in Admin. Contact{" "}
        <a
          href="mailto:shopprintiful@gmail.com"
          className="text-brand-purple underline-offset-2 hover:underline"
        >
          shopprintiful@gmail.com
        </a>{" "}
        for custom orders.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="font-heading text-xl font-semibold text-foreground">
            Poly mailer bags
          </legend>

          <label className="block space-y-1.5">
            <span className={labelClass}>Artwork &amp; layout</span>
            <textarea
              value={bagDesign}
              onChange={(e) => setBagDesign(e.target.value)}
              placeholder="e.g. logo top-left, purple accents, minimal layout — how it should look"
              required
              rows={3}
              className={fieldClass}
            />
            <span className={helpClass}>
              Visual only: placement, colors, graphics style. Not the wording.
            </span>
          </label>

          <div className="space-y-1.5">
            <span className={labelClass}>
              Logo file{" "}
              <span className="normal-case tracking-normal text-muted/80">
                (optional)
              </span>
            </span>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={(e) => void handleLogoChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-brand-purple file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-purple-deep"
            />
            <span className={helpClass}>
              Upload JPEG, PNG, WebP, or GIF (max 5MB) if the bag needs your logo.
            </span>
            {logoUploading ? (
              <p className="text-xs text-muted">Uploading logo…</p>
            ) : null}
            {bagLogoUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bagLogoUrl}
                  alt="Uploaded logo preview"
                  className="size-14 rounded object-contain bg-surface-alt"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {bagLogoName || "Logo uploaded"}
                  </p>
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="mt-1 text-xs font-semibold text-brand-purple underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <label className="block space-y-1.5">
            <span className={labelClass}>Printed wording</span>
            <input
              type="text"
              value={bagText}
              onChange={(e) => setBagText(e.target.value)}
              placeholder='e.g. "Thank you for shopping with Ada Styles"'
              required
              className={fieldClass}
            />
            <span className={helpClass}>
              Exact words to print on the bag — separate from artwork/layout above.
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-xl font-semibold text-foreground">
            Thank you cards
          </legend>
          <label className="block space-y-1.5">
            <span className={labelClass}>Card message &amp; design notes</span>
            <textarea
              value={cardContent}
              onChange={(e) => setCardContent(e.target.value)}
              placeholder="Message, branding, or layout notes for the A6 thank you cards"
              required
              rows={3}
              className={fieldClass}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-heading text-xl font-semibold text-foreground">
            Customized tees
          </legend>

          <div className="space-y-3 border border-border bg-surface p-4">
            <p className="font-ui text-sm font-semibold text-foreground">Tee 1</p>
            <label className="block space-y-1.5">
              <span className={labelClass}>Color</span>
              <input
                type="text"
                value={tee1Color}
                onChange={(e) => setTee1Color(e.target.value)}
                placeholder="e.g. Black"
                required
                className={fieldClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={labelClass}>Design / print</span>
              <textarea
                value={tee1Design}
                onChange={(e) => setTee1Design(e.target.value)}
                placeholder="What should be printed on tee 1 (artwork, text, placement)"
                required
                rows={3}
                className={fieldClass}
              />
            </label>
          </div>

          <div className="space-y-3 border border-border bg-surface p-4">
            <p className="font-ui text-sm font-semibold text-foreground">Tee 2</p>
            <label className="block space-y-1.5">
              <span className={labelClass}>Color</span>
              <input
                type="text"
                value={tee2Color}
                onChange={(e) => setTee2Color(e.target.value)}
                placeholder="e.g. White"
                required
                className={fieldClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={labelClass}>Design / print</span>
              <textarea
                value={tee2Design}
                onChange={(e) => setTee2Design(e.target.value)}
                placeholder="What should be printed on tee 2 (artwork, text, placement)"
                required
                rows={3}
                className={fieldClass}
              />
            </label>
          </div>
        </fieldset>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {added ? (
          <p className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 px-4 py-3 text-sm text-foreground">
            Package added to your cart.{" "}
            <Link
              href="/store"
              className="font-semibold text-brand-purple underline-offset-2 hover:underline"
            >
              Continue to store
            </Link>{" "}
            or checkout from the cart.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={logoUploading}
          className="w-full rounded-full bg-brand-yellow px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-black transition hover:bg-[color:var(--hover-on-white)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Get the package — {formatNaira(pkg.price)}
        </button>
      </form>
    </div>
  );
}
