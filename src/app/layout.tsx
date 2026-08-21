import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Outfit,
  Roboto,
} from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
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
  metadataBase: new URL("https://shopprintiful.com"),
  title: "Printiful | Premium Custom wear & High-Fidelity Printing",
  description:
    "Printiful help announce you and your brand even when you don't say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.",
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
    shortcut: "/assets/logo.svg",
    apple: "/assets/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Printiful",
    title: "Printiful | Be Bold! Be Seen!! Be Known!!!",
    description:
      "Printiful help announce you and your brand even when you don't say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.",
    url: "https://shopprintiful.com/",
    images: [
      {
        url: "/assets/logo.svg",
        alt: "Printiful",
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@Printiful",
    title: "Printiful | Be Bold! Be Seen!! Be Known!!!",
    description:
      "Printiful help announce you and your brand even when you don't say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.",
    images: [
      {
        url: "/assets/logo.svg",
        alt: "Printiful",
      },
    ],
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
        <AppProviders>
          <ConditionalShell>{children}</ConditionalShell>
        </AppProviders>
      </body>
    </html>
  );
}
