import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayTrack — Suivi de bulletins de paie",
  description: "Analysez et suivez l'évolution de vos bulletins de paie avec PayTrack.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}