"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

const LOGO = "/assets/logo%20with%20printiful.svg";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.34 6.34 6.34 0 0 0 9.5 21.67a6.34 6.34 0 0 0 6.34-6.34V8.87a8.2 8.2 0 0 0 4.76 1.51V6.94a4.85 4.85 0 0 1-.99-.25z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.727-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="space-y-4">
          <Link href="/" aria-label="Printiful home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt="Printiful"
              className="h-10 w-auto dark:brightness-0 dark:invert"
            />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Premium branded merch for brands, businesses and individuals,
            designed to stand the test of time.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/printiful_brand"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex size-10 items-center justify-center border border-border text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple dark:hover:border-brand-yellow dark:hover:text-brand-yellow"
            >
              <InstagramIcon className="size-[18px]" />
            </a>
            <a
              href="https://www.tiktok.com/@printifulbrand"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex size-10 items-center justify-center border border-border text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple dark:hover:border-brand-yellow dark:hover:text-brand-yellow"
            >
              <TikTokIcon className="size-[18px]" />
            </a>
            <a
              href="https://twitter.com/printiful"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              className="inline-flex size-10 items-center justify-center border border-border text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple dark:hover:border-brand-yellow dark:hover:text-brand-yellow"
            >
              <XIcon className="size-[18px]" />
            </a>
          </div>
          <a
            href={`mailto:${settings.contact_email || "shopprintiful@gmail.com"}`}
            className="inline-block font-ui text-sm text-brand-purple dark:text-brand-yellow"
          >
            {settings.contact_email || "shopprintiful@gmail.com"}
          </a>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold italic">
              Studio Rooms
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/store" prefetch>
                  Catalog Store
                </Link>
              </li>
              <li>
                <Link href="/#timeline">Step Journey</Link>
              </li>
              <li>
                <Link href="/#inquiry">Bulk Orders</Link>
              </li>
              <li>
                <Link href="/admin">Admin Access</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold italic">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/#inquiry">Contact Designer</Link>
              </li>
              <li>
                <Link href="/store" prefetch>
                  Product Sizing
                </Link>
              </li>
              <li>
                <Link href="/#timeline">Eco Commitments</Link>
              </li>
              <li>
                <Link href="/#inquiry">Wholesale</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold italic">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/terms" prefetch>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" prefetch>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" prefetch>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" prefetch>
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted sm:px-6">
        {settings.footer_text ||
          "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed."}
      </div>
    </footer>
  );
}
