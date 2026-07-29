"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";

/** Keeps navbar/footer mounted across storefront navigations (faster clicks). */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }
  return <SiteShell>{children}</SiteShell>;
}
