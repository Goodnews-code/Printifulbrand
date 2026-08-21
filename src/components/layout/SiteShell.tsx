"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageTransition } from "@/components/motion/PageTransition";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { PackageNavbar } from "@/components/packages/PackageNavbar";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPackage = Boolean(pathname?.startsWith("/packages"));

  return (
    <>
      {isPackage ? <PackageNavbar /> : <Navbar />}
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </>
  );
}
