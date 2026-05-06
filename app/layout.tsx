import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayTrack — Suivi de bulletins de paie",
  description: "Analysez et suivez l'évolution de vos bulletins de paie avec PayTrack.",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PayTrack",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" style={{ overflowY: "scroll" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PayTrack" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}