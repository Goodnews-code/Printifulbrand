"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSettings } from "@/context/SettingsContext";

const SESSION_READY_KEY = "printiful_wa_fab_ready_at";
const DELAY_MS = 60_000;

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

/** Floating WhatsApp chat button — fixed bottom-right, after 1 minute on site. */
export function WhatsAppFab() {
  const { settings } = useSettings();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const href = useMemo(() => {
    const raw = settings.whatsapp_number || settings.contact_phone || "";
    let digits = digitsOnly(raw);
    if (!digits || digits.length < 10) return null;
    if (/^2340+$/.test(digits) || /^0+$/.test(digits)) return null;
    if (digits.startsWith("0") && digits.length >= 10) {
      digits = `234${digits.slice(1)}`;
    }
    const text = encodeURIComponent(
      "Hi Printiful! I’d like to ask about an order / custom print.",
    );
    return `https://wa.me/${digits}?text=${text}`;
  }, [settings.whatsapp_number, settings.contact_phone]);

  useEffect(() => {
    if (!href || typeof window === "undefined") return;

    let readyAt = Number(sessionStorage.getItem(SESSION_READY_KEY));
    if (!Number.isFinite(readyAt) || readyAt <= 0) {
      readyAt = Date.now() + DELAY_MS;
      sessionStorage.setItem(SESSION_READY_KEY, String(readyAt));
    }

    const delay = Math.max(0, readyAt - Date.now());
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [href]);

  return (
    <AnimatePresence>
      {visible && href ? (
        <motion.a
          key="whatsapp-fab"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Printiful on WhatsApp"
          className="fixed bottom-5 right-5 z-[60] flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
          initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4, y: 24 }}
          animate={
            reduce
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
          }
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          whileHover={reduce ? undefined : { scale: 1.08 }}
          whileTap={reduce ? undefined : { scale: 0.95 }}
        >
          {!reduce ? (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[#25D366]/50"
              animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
          <svg
            viewBox="0 0 24 24"
            className="relative size-7"
            fill="currentColor"
            aria-hidden
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
