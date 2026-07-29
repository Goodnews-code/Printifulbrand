"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const LOGO = "/assets/logo%20with%20printiful.svg";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: isHome ? "#hero" : "/#hero", label: "Home" },
    { href: "/store", label: "Catalog Store" },
    { href: isHome ? "#timeline" : "/#timeline", label: "How We Print" },
    { href: isHome ? "#inquiry" : "/#inquiry", label: "Bulk Inquiry" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border transition-shadow",
        scrolled ? "shadow-sm" : "",
      )}
      style={{ backgroundColor: "var(--navbar)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Printiful home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Printiful"
            className="h-9 w-auto dark:brightness-0 dark:invert"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-ui text-sm font-medium text-foreground/80 transition-colors hover:text-brand-purple dark:hover:text-brand-yellow"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-alt"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href={isHome ? "#inquiry" : "/#inquiry"}
            className="hidden rounded-none bg-brand-purple px-4 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-yellow hover:text-brand-black sm:inline-flex"
          >
            Request Quote
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-alt"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 font-ui text-[10px] font-bold text-brand-black">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-ui text-base font-medium text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isHome ? "#inquiry" : "/#inquiry"}
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex justify-center bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white"
            >
              Request Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
