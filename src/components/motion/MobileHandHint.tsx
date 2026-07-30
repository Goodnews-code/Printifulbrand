"use client";

import { useEffect, useState } from "react";
import { Hand } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Mobile-only hand motion hint: gently swipes upward to suggest scrolling.
 * Hides after the user scrolls or taps.
 */
export function MobileHandHint() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduce) {
      setVisible(false);
      return;
    }

    const hide = () => setVisible(false);
    const onScroll = () => {
      if (window.scrollY > 24) hide();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", hide, { passive: true, once: true });
    const timer = window.setTimeout(hide, 8000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", hide);
      window.clearTimeout(timer);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 md:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.div
            className="flex size-14 items-center justify-center rounded-full border border-brand-purple/30 bg-surface/90 text-brand-purple shadow-lg backdrop-blur-sm dark:border-brand-yellow/40 dark:text-brand-yellow"
            animate={{ y: [0, -18, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Hand size={26} strokeWidth={1.75} className="-rotate-12" />
          </motion.div>
          <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Swipe up
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
