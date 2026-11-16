"use client";

import { useEffect, useState } from "react";
import { Award, BarChart3, FolderOpen, Flame, LayoutDashboard, ScanSearch, ShieldCheck, Trophy, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONES: Record<string, LucideIcon> = {
  Award,
  BarChart3,
  FolderOpen,
  Flame,
  LayoutDashboard,
  ScanSearch,
  ShieldCheck,
  Trophy,
  TrendingUp,
};

type Point = { icone: string; titre: string; texte: string };

export function PointsCles({ id, points }: { id: string; points: Point[] }) {
  const [actif, setActif] = useState(0);

  useEffect(() => {
    const f = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && d.id === id) setActif(d.index);
    };
    window.addEventListener("paytrak-slide", f);
    return () => window.removeEventListener("paytrak-slide", f);
  }, [id]);

  return (
    <ul className="mt-6 space-y-2">
      {points.map((p, i) => {
        const Icone = ICONES[p.icone] || Trophy;
        const on = i === actif;
        return (
          <li key={p.titre}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("paytrak-goto", { detail: { id, index: i } }))}
              className={
                "w-full flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors " +
                (on ? "border-primary/50 bg-primary/10" : "border-border/40 hover:bg-secondary/40")
              }
            >
              <span
                className={
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                  (on ? "bg-primary text-white" : "bg-secondary text-primary")
                }
              >
                <Icone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{p.titre}</span>
                <span className="block text-sm text-muted-foreground">{p.texte}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
