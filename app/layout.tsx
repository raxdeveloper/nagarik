import type { Metadata } from "next";
import { Yantramanav, Mukta } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const yantra = Yantramanav({
  subsets: ["latin", "devanagari"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  variable: "--font-body",
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAGRIKA (नागरिक) — Empowering Nepal's Citizens",
  description:
    "Nagrika is a minimalist, citizen-action platform for Nepal. Report local civic issues, infrastructure problems, and track resolutions across all 7 provinces and 77 districts.",
  keywords: "Nepal, civic problems, citizen reporting, infrastructure, Kathmandu, provinces, districts, Nagrika, dashboard, civic tech",
  authors: [{ name: "Nagrika Team" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "NAGRIKA",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "NAGRIKA — Nepal's Civic Platform",
    description: "Report and track civic problems across Nepal in real-time.",
    url: "https://nagrika.np",
    siteName: "NAGRIKA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NAGRIKA — Nepal's Civic Platform",
    description: "Report and track civic problems across Nepal in real-time.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${yantra.variable} ${mukta.variable} bg-[#030303] text-[#f8f8f8] min-h-screen antialiased`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
