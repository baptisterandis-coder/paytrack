"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Trophy, TrendingUp } from "lucide-react";

const FOND = "rounded-2xl border border-[#1e2a44] bg-[#0b0f1a] p-3 sm:p-4";
const CARTE = "rounded-xl border border-[#1e2a44] bg-[#10172a]";
const TITRES = ["Tes paliers de salaire", "Ton cumul de carrière", "Ta régularité"];

type Trophee = { code: string; nom: string; valeur: string; info: string; ok: boolean };

const GROUPES: { titre: string; colonnes: string; items: Trophee[] }[] = [
  {
    titre: "Salaire mensuel brut",
    colonnes: "grid-cols-2 sm:grid-cols-4",
    items: [
      { code: "2K", nom: "Premier 2K", valeur: "3 150 €", info: "Jan 2022", ok: true },
      { code: "5K", nom: "Premier 5K", valeur: "5 480 €", info: "Mar 2024", ok: true },
      { code: "10K", nom: "Premier 10K", valeur: "", info: "5 960 € / 10 000 €", ok: false },
      { code: "15K", nom: "Premier 15K", valeur: "", info: "5 960 € / 15 000 €", ok: false },
    ],
  },
  {
    titre: "Cumul carrière brut",
    colonnes: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    items: [
      { code: "50K", nom: "Cumul 50K", valeur: "50 000 €", info: "Atteint en Mai 2023", ok: true },
      { code: "100K", nom: "Cumul 100K", valeur: "100 000 €", info: "Atteint en Juin 2024", ok: true },
      { code: "250K", nom: "Cumul 250K", valeur: "", info: "217 670 € / 250 000 €", ok: false },
      { code: "500K", nom: "Cumul 500K", valeur: "", info: "217 670 € / 500 000 €", ok: false },
      { code: "1M", nom: "Cumul 1M€", valeur: "", info: "217 670 € / 1 000 000 €", ok: false },
    ],
  },
  {
    titre: "Régularité",
    colonnes: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    items: [
      { code: "12M", nom: "12 Mois", valeur: "46 mois", info: "Jan 2023 – Oct 2026", ok: true },
      { code: "24M", nom: "24 Mois", valeur: "46 mois", info: "Jan 2023 – Oct 2026", ok: true },
      { code: "36M", nom: "36 Mois", valeur: "46 mois", info: "Jan 2023 – Oct 2026", ok: true },
      { code: "60M", nom: "60 Mois", valeur: "", info: "Meilleure séquence : 46 mois", ok: false },
      { code: "120M", nom: "120 Mois", valeur: "", info: "Meilleure séquence : 46 mois", ok: false },
    ],
  },
];

function Carte({ t, rang }: { t: Trophee; rang: number }) {
  const ton = !t.ok ? "bg-[#141c33] text-[#5f6b87]" : rang === 0 ? "bg-[#1b2a4d] text-[#8aa4d6]" : "bg-[#3a2a2e] text-primary";
  return (
    <div className={"rounded-xl border border-[#1e2a44] px-2 py-3 text-center " + (t.ok ? "bg-[#0f1830]" : "bg-[#0d1428] opacity-80")}>
      <span className={"mx-auto w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold " + ton}>
        {t.ok ? t.code : <Lock className="w-4 h-4" />}
      </span>
      <p className={"mt-2 text-xs font-semibold " + (t.ok ? "text-white" : "text-[#8a97b5]")}>{t.nom}</p>
      {t.valeur ? <p className="mt-1 text-[13px] font-bold text-primary whitespace-nowrap">{t.valeur}</p> : null}
      <p className="mt-1 text-[10px] leading-tight text-[#8a97b5]">{t.info}</p>
      <span className={"mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] " + (t.ok ? "border-primary/40 text-primary bg-primary/10" : "border-[#1e2a44] text-[#5f6b87]")}>
        {t.ok ? <Trophy className="w-3 h-3" /> : null}
        {t.ok ? "Débloqué" : "Bloqué"}
      </span>
    </div>
  );
}

function Galerie({ index }: { index: number }) {
  const g = GROUPES[index];
  return (
    <div className={CARTE + " p-4"}>
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Trophy className="w-4 h-4 text-primary" />
          {"Galerie des Trophées"}
        </p>
        <span className="rounded-full bg-[#1b2a4d] px-2 py-0.5 text-[11px] text-[#8aa4d6]">7/14</span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a97b5] mb-2">{g.titre}</p>
      <div className={"grid gap-2 " + g.colonnes}>
        {g.items.map((t, i) => (
          <Carte key={t.code} t={t} rang={i} />
        ))}
      </div>
    </div>
  );
}

function Objectif() {
  return (
    <div className={CARTE + " mt-2 px-4 py-3"}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <TrendingUp className="w-4 h-4 text-primary" />
          {"Objectif Annuel Brut"}
        </p>
        <span className="text-[11px] text-[#8a97b5]">{"2026"}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-[#8a97b5]">{"Objectif"}</p>
          <p className="text-[13px] font-bold text-white whitespace-nowrap">{"54 000 €"}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8a97b5]">{"Actuel (10 bulletins)"}</p>
          <p className="text-[13px] font-bold text-white whitespace-nowrap">{"45 920 €"}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8a97b5]">{"Avance (fin octobre)"}</p>
          <p className="text-[13px] font-bold text-[#34c38f] whitespace-nowrap">{"+920 €"}</p>
        </div>
      </div>
      <div className="mt-2 h-4 rounded-full bg-[#1b2a4d]">
        <div className="h-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-[#0b0f1a]" style={{ width: "85%" }}>
          {"85%"}
        </div>
      </div>
    </div>
  );
}

const SLIDES = [0, 1, 2];

export function CarrouselProgresse() {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("paytrak-slide", { detail: { id: "progresse", index } }));
  }, [index]);

  useEffect(() => {
    const f = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && d.id === "progresse") setIndex(d.index);
    };
    window.addEventListener("paytrak-goto", f);
    return () => window.removeEventListener("paytrak-goto", f);
  }, []);

  useEffect(() => {
    if (pause) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, [pause]);

  const aller = (n: number) => setIndex((n + SLIDES.length) % SLIDES.length);

  return (
    <div onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div className={FOND}>
        <div className="min-h-[332px]">
          <Galerie index={index} />
          <Objectif />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => aller(i)}
              aria-label={TITRES[i]}
              className={"h-2 rounded-full transition-all " + (i === index ? "w-6 bg-primary" : "w-2 bg-secondary")}
            />
          ))}
          <span className="ml-3 text-xs text-muted-foreground">{TITRES[index]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => aller(index - 1)} aria-label="Précédent" className="p-1.5 rounded-lg hover:bg-secondary/60">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button type="button" onClick={() => aller(index + 1)} aria-label="Suivant" className="p-1.5 rounded-lg hover:bg-secondary/60">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
