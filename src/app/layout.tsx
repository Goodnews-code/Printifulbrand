import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Outfit,
  Roboto,
} from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Printiful | Premium Custom wear & High-Fidelity Printing",
  description:
    "Printiful crafts premium customized merch on heavyweight luxury blanks. High-fidelity Direct-to-Merch prints, industrial embroidery, and curated wear designed to endure.",
  keywords: [
    "custom wear",
    "DTG printing",
    "embroidery",
    "custom t-shirts",
    "bulk printing",
    "Printiful",
    "custom merch",
  ],
  authors: [{ name: "Printiful Custom Studio" }],
  icons: {
    icon: "/assets/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Printiful",
    title: "Printiful | Premium Custom wear & Printing",
    description:
      "Heavyweight luxury blanks. High-fidelity DTG prints & industrial embroidery. Custom wear designed to endure.",
    url: "https://printiful.store/",
    images: [
      {
        url: "/assets/logo%20with%20printiful.svg",
        alt: "Printiful Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Printiful",
    title: "Printiful | Premium Custom wear & Printing",
    description:
      "Heavyweight luxury blanks. High-fidelity DTG prints & industrial embroidery.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${outfit.variable} ${inter.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-foreground font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
