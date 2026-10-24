import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ConnectorForge Developer Console",
  description: "Organization-scoped marketplace, publishing, administration, and offline evaluation evidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-black">
        <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-white focus:px-3 focus:py-2" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
