import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";

/* ═══════════════════════════════════════════════════
   FONTS — redesign-plan.md Section 0.3
   Geist (display) + Inter (body), both self-hosted via
   next/font instead of Google Fonts <link> tags — no
   external request, no preconnect needed, no layout
   shift. Space Grotesk is fully retired site-wide.
═══════════════════════════════════════════════════ */

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YesBroker AI | Enterprise AI Real Estate Platform",
  description:
    "Enterprise-grade AI operating system for modern real estate. Voice agents, negotiation engine, and intelligent marketplace in one platform.",
  keywords: [
    "AI real estate",
    "enterprise platform",
    "voice agent",
    "property AI",
    "Dubai real estate AI",
  ],
  openGraph: {
    title: "YesBroker AI | Enterprise AI Real Estate Platform",
    description: "Enterprise-grade AI operating system for modern real estate.",
    type: "website",
  },
};

import GlobalBackground from "@/components/ui/GlobalBackground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${inter.variable}`}
    >
      <body
        className="min-h-screen"
        
        suppressHydrationWarning
      >
        <GlobalBackground />
        <Navbar />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
