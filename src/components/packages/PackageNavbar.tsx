"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { resolveSmallBusinessPackage } from "@/lib/packages";
import { cn } from "@/lib/utils";

const LOGO = "/assets/logo%20with%20printiful.svg";

const LINKS = [
  { href: "#includes", label: "What’s included" },
  { href: "#for", label: "Who it’s for" },
  { href: "#order", label: "Customize" },
] as const;

/** Package landing navbar — lighter, offer-focused, distinct from the main site nav. */
export function PackageNavbar() {
  const { itemCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const pkg = resolveSmallBusinessPackage(settings);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
          scrolled || mobileOpen
            ? "border-b border-white/10 bg-brand-purple shadow-md"
            : "border-b border-transparent bg-transparent",
        )}
        initial={reduce ? false : { y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="shrink-0" aria-label="Printiful home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO}
                alt="Printiful"
                className="h-8 w-auto brightness-0 invert sm:h-9"
              />
            </Link>
            <span className="hidden h-5 w-px bg-white/25 sm:block" aria-hidden />
            <p className="hidden max-w-[14rem] truncate font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-yellow sm:block">
              {pkg.title}
            </p>
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Package sections"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 font-ui text-sm font-medium text-white/85 transition hover:text-brand-yellow"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-brand-yellow hover:text-brand-yellow"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {pkg.enabled ? (
              <a
                href="#order"
                className="hidden rounded-full bg-brand-yellow px-4 py-2 font-ui text-sm font-bold uppercase tracking-wide text-brand-black transition hover:bg-white sm:inline-flex"
              >
                Get package
              </a>
            ) : null}

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-brand-yellow hover:text-brand-yellow"
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
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {mobileOpen ? (
          <>
            <motion.button
              key="package-menu-backdrop"
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[45] bg-brand-black/45 backdrop-blur-md lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="package-mobile-nav"
              className="fixed left-1/2 top-16 z-[48] w-[min(100%-1.5rem,20rem)] overflow-hidden rounded-bl-[50%] rounded-br-[50%] border border-t-0 border-white/10 bg-brand-purple/95 shadow-xl backdrop-blur-xl lg:hidden"
              style={{ transformOrigin: "top center" }}
              initial={
                reduce
                  ? false
                  : { x: "-50%", scaleY: 0.35, opacity: 0, y: -12 }
              }
              animate={{ x: "-50%", scaleY: 1, opacity: 1, y: 0 }}
              exit={
                reduce
                  ? undefined
                  : { x: "-50%", scaleY: 0.45, opacity: 0, y: -8 }
              }
              transition={{
                duration: 0.95,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <nav
                className="flex min-h-[min(70vh,480px)] flex-col items-center justify-center gap-5 px-5 py-10 text-center"
                aria-label="Package mobile"
              >
                {LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 font-ui text-xl font-medium leading-snug text-white sm:text-2xl"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.28 + 0.12 * i,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                {pkg.enabled ? (
                  <motion.a
                    href="#order"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 inline-flex min-h-14 items-center justify-center rounded-full bg-brand-yellow px-8 py-4 font-ui text-sm font-bold uppercase tracking-wide text-brand-black"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.7,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Get package
                  </motion.a>
                ) : null}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
