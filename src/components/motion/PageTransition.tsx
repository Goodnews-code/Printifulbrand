"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Soft entrance when the route changes. Content is immediately visible before hydration. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.9, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
