import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.paytrak.fr"),
  title: "paytrak — Suivi de bulletins de paie",
  description: "Analysez et suivez l'évolution de vos bulletins de paie avec paytrak.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "paytrak",
    title: "paytrak — Suivi de bulletins de paie",
    description: "Analysez et suivez l'évolution de vos bulletins de paie avec paytrak.",
  },
  twitter: {
    card: "summary",
    title: "paytrak — Suivi de bulletins de paie",
    description: "Analysez et suivez l'évolution de vos bulletins de paie avec paytrak.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "paytrak",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" style={{ overflowY: "scroll" }}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
