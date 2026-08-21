"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const LOGO = "/assets/logo%20with%20printiful.svg";

type NavId = "home" | "store" | "timeline" | "inquiry";

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
  /** Home uses the package-style chrome (fixed, purple on scroll). */
  const solidChrome = !isHome || scrolled || mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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

  const lightOnDark = isHome && solidChrome;

  return (
    <>
      <motion.header
        className={cn(
          "z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          isHome
            ? solidChrome
              ? "border-b border-white/10 bg-brand-purple shadow-md"
              : "border-b border-transparent bg-transparent"
            : cn(
                "border-b border-border backdrop-blur-md",
                scrolled ? "shadow-sm" : "",
              ),
        )}
        style={isHome ? undefined : { backgroundColor: "var(--navbar)" }}
        initial={reduce ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8",
            isHome ? "h-[94px]" : "h-16",
          )}
        >
          <Link href="/" className="shrink-0" aria-label="Printiful home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt="Printiful"
              className={cn(
                "h-9 w-auto transition",
                lightOnDark
                  ? "brightness-0 invert"
                  : "dark:brightness-0 dark:invert",
              )}
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {links.map((link) => {
              const active = activeId === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3 py-1.5 font-ui text-sm font-medium transition-colors",
                    lightOnDark
                      ? active
                        ? "text-brand-yellow"
                        : "text-white/85 hover:text-brand-yellow"
                      : active
                        ? "no-hover bg-brand-purple px-3 py-1.5 text-white dark:bg-brand-yellow dark:text-brand-black"
                        : "text-foreground/80 hover:-translate-y-0.5",
                  )}
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
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border transition",
                lightOnDark
                  ? "border-white/30 text-white hover:border-brand-yellow hover:text-brand-yellow"
                  : "border-border text-foreground",
              )}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              href={isHome ? "#inquiry" : "/#inquiry"}
              className={cn(
                "hidden px-4 py-2.5 font-ui text-sm font-semibold sm:inline-flex",
                lightOnDark
                  ? "rounded-full bg-brand-yellow font-bold uppercase tracking-wide text-brand-black hover:bg-white"
                  : "bg-brand-purple text-white",
              )}
            >
              {lightOnDark ? "Request quote" : "Request Quote"}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className={cn(
                "relative inline-flex size-10 items-center justify-center rounded-full border transition",
                lightOnDark
                  ? "border-white/30 text-white hover:border-brand-yellow hover:text-brand-yellow"
                  : "border-border text-foreground",
              )}
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
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border md:hidden",
                lightOnDark
                  ? "border-white/30 text-white"
                  : "border-border text-foreground",
              )}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {isHome ? <div className="h-[94px]" aria-hidden /> : null}

      <AnimatePresence mode="wait">
        {mobileOpen ? (
          <>
            <motion.button
              key="home-menu-backdrop"
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[45] bg-brand-black/45 backdrop-blur-md md:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="home-mobile-nav"
              className={cn(
                "fixed left-1/2 z-[48] w-[min(100%-1.5rem,325px)] overflow-hidden rounded-bl-[50%] rounded-br-[50%] border border-t-0 border-white/10 bg-brand-purple/95 shadow-xl backdrop-blur-xl md:hidden",
                isHome ? "top-[94px]" : "top-16",
              )}
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
                className="flex min-h-[min(70vh,490px)] flex-col items-center justify-center gap-5 px-5 py-10 text-center"
                aria-label="Mobile"
              >
                {links.map((link, i) => {
                  const active = activeId === link.id;
                  return (
                    <motion.div
                      key={link.id}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.28 + 0.12 * i,
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "px-3 py-2 font-ui text-xl font-medium leading-snug sm:text-2xl",
                          active ? "text-brand-yellow" : "text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.7,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={isHome ? "#inquiry" : "/#inquiry"}
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 inline-flex min-h-14 items-center justify-center rounded-full bg-brand-yellow px-8 py-4 font-ui text-sm font-bold uppercase tracking-wide text-brand-black"
                  >
                    Request quote
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
