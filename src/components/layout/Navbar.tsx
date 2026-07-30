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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const LOGO = "/assets/logo%20with%20printiful.svg";

type NavId = "home" | "store" | "timeline" | "inquiry";

const navLinkClass = (active: boolean) =>
  cn(
    "font-ui text-sm font-medium transition-colors",
    active
      ? "no-hover bg-brand-purple px-3 py-1.5 text-white dark:bg-brand-yellow dark:text-brand-black"
      : "px-3 py-1.5 text-foreground/80 hover:-translate-y-0.5",
  );

const navLinkClassMobile = (active: boolean) =>
  cn(
    "inline-flex font-ui text-base font-medium transition-colors",
    active
      ? "no-hover bg-brand-purple px-3 py-2 text-white dark:bg-brand-yellow dark:text-brand-black"
      : "px-3 py-2 text-foreground",
  );

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const reduce = useReducedMotion();

  const isHome = pathname === "/";
  const isStore = pathname === "/store" || pathname.startsWith("/store/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash.replace(/^#/, ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  /** Prefer section hash on home; otherwise mark the current route. */
  const activeId: NavId = (() => {
    if (isStore) return "store";
    if (!isHome) return "home";
    if (hash === "timeline") return "timeline";
    if (hash === "inquiry") return "inquiry";
    return "home";
  })();

  const links: { id: NavId; href: string; label: string }[] = [
    { id: "home", href: isHome ? "#hero" : "/#hero", label: "Home" },
    { id: "store", href: "/store", label: "Catalog Store" },
    {
      id: "timeline",
      href: isHome ? "#timeline" : "/#timeline",
      label: "How We Print",
    },
    {
      id: "inquiry",
      href: isHome ? "#inquiry" : "/#inquiry",
      label: "Bulk Inquiry",
    },
  ];

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 border-b border-border backdrop-blur-md transition-shadow",
        scrolled ? "shadow-sm" : "",
      )}
      style={{ backgroundColor: "var(--navbar)" }}
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = activeId === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href={isHome ? "#inquiry" : "/#inquiry"}
            className="hidden bg-brand-purple px-4 py-2.5 font-ui text-sm font-semibold text-white sm:inline-flex"
          >
            Request Quote
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 font-ui text-[10px] font-bold text-brand-black"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <nav className="flex flex-col gap-2 px-4 py-4" aria-label="Mobile">
              {links.map((link, i) => {
                const active = activeId === link.id;
                return (
                  <motion.div
                    key={link.id}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={navLinkClassMobile(active)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <Link
                href={isHome ? "#inquiry" : "/#inquiry"}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex justify-center bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white"
              >
                Request Quote
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
