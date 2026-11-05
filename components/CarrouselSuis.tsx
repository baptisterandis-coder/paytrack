"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Euro, FileText, Medal, TrendingUp, Trophy, Users } from "lucide-react";

const FOND = "rounded-2xl border border-[#1e2a44] bg-[#0b0f1a] p-3 sm:p-4";
const CARTE = "rounded-xl border border-[#1e2a44] bg-[#10172a]";
const TITRES = ["Ton tableau de bord, dès l’ouverture", "Tes salaires records", "Ta progression, année après année"];

const TUILES = [
  { titre: "Cumul net 2026", valeur: "31 480 €", delta: "+6,4 %", Icone: Euro, vert: true },
  { titre: "Cumul brut 2026", valeur: "45 920 €", delta: "+6,4 %", Icone: TrendingUp, vert: false },
  { titre: "Impôt 2026", valeur: "3 870 €", delta: "+9,1 %", Icone: Users, vert: false },
  { titre: "Bulletins", valeur: "46", delta: "", Icone: FileText, vert: false },
];

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const NET_2025 = [2960, 2950, 3000, 2980, 3010, 3060, 3000, 3020, 3040, 3050, 3060, 4180];
const NET_2026 = [3120, 3110, 3160, 3140, 3150, 3190, 3130, 3160, 3170, 3150];
const hauteur = (v: number) => Math.round(((v - 2400) / (4300 - 2400)) * 100) + "%";

const RECORDS = [
  { rang: "1er", net: "4 218 €", brut: "5 960 €", periode: "mars 2026" },
  { rang: "2ème", net: "4 051 €", brut: "5 710 €", periode: "mars 2025" },
  { rang: "3ème", net: "3 902 €", brut: "5 480 €", periode: "mars 2024" },
];

const ANNEES = [
  { rang: "5ème", annee: "2022", total: "38 400 €", evo: "1re année", ton: "n", mois: "12 mois" },
  { rang: "4ème", annee: "2023", total: "41 250 €", evo: "+7,4 %", ton: "p", mois: "12 mois" },
  { rang: "3ème", annee: "2024", total: "44 800 €", evo: "+8,6 %", ton: "p", mois: "12 mois" },
  { rang: "1er", annee: "2025", total: "47 300 €", evo: "+5,6 %", ton: "p", mois: "12 mois" },
  { rang: "2ème", annee: "2026", total: "45 920 €", evo: "-2,9 %", ton: "m", mois: "10 mois" },
];

function Pastille({ rang }: { rang: string }) {
  const premier = rang === "1er";
  const podium = rang === "2ème" || rang === "3ème";
  const Icone = premier ? Trophy : Medal;
  const style = premier ? "bg-[#3a2a2e] text-primary" : podium ? "bg-[#1b2a4d] text-[#8aa4d6]" : "bg-[#16203a] text-[#8a97b5]";
  return (
    <span className={"w-9 h-9 shrink-0 rounded-full flex items-center justify-center " + style}>
      {premier || podium ? <Icone className="w-5 h-5" /> : <span className="text-xs font-medium">{rang}</span>}
    </span>
  );
}

function Tableau() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {TUILES.map(({ titre, valeur, delta, Icone, vert }) => (
          <div key={titre} className={CARTE + " p-2.5 relative"}>
            <p className="text-[11px] text-[#8a97b5]">{titre}</p>
            <p className="text-lg font-semibold text-white">{valeur}</p>
            <p className="mt-0.5 text-[11px] text-[#34c77b] min-h-[16px]">{delta ? "↗ " + delta : ""}</p>
            <span className={"absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center " + (vert ? "bg-[#17454f] text-[#34c77b]" : "bg-[#3a2a2e] text-primary")}>
              <Icone className="w-4 h-4" />
            </span>
          </div>
        ))}
      </div>
      <div className={CARTE + " p-3"}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-medium text-white">Net mensuel · 2025 / 2026</p>
          <p className="text-[11px] text-[#8a97b5] flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#3a5a99]" />2025</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" />2026</span>
          </p>
        </div>
        <div className="flex items-end gap-1 sm:gap-2 h-[70px] border-b border-[#1e2a44]">
          {MOIS.map((m, i) => (
            <div key={m} className="flex-1 h-full flex items-end justify-center gap-[2px]">
              <div className="w-1/2 max-w-[14px] rounded-t-sm bg-[#3a5a99]" style={{ height: hauteur(NET_2025[i]) }} />
              {NET_2026[i] ? <div className="w-1/2 max-w-[14px] rounded-t-sm bg-primary" style={{ height: hauteur(NET_2026[i]) }} /> : <div className="w-1/2 max-w-[14px]" />}
            </div>
          ))}
        </div>
        <div className="flex gap-1 sm:gap-2 mt-1.5">
          {MOIS.map((m) => (
            <span key={m} className="flex-1 text-center text-[9px] sm:text-[10px] text-[#8a97b5]">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Records() {
  return (
    <div className={CARTE + " p-4"}>
      <p className="flex items-center gap-2 text-sm font-semibold text-white mb-3"><Trophy className="w-4 h-4 text-primary" />Top 3 salaires record</p>
      <div className="space-y-2.5">
        {RECORDS.map((r) => (
          <div key={r.rang} className="rounded-xl border border-[#1e2a44] bg-[#0f1830] p-3 flex items-center gap-3 sm:gap-4">
            <Pastille rang={r.rang} />
            <div className="w-12 sm:w-14"><p className="text-[10px] uppercase text-[#8a97b5]">Rang</p><p className="text-[13px] font-semibold text-white">{r.rang}</p></div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Net</p><p className="text-[13px] font-semibold text-[#34c77b]">{r.net}</p></div>
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Brut</p><p className="text-[13px] font-semibold text-primary">{r.brut}</p></div>
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Entreprise</p><p className="text-[13px] font-semibold text-white">NOVA SERVICES</p></div>
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Période</p><p className="text-[13px] font-semibold text-white">{r.periode}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Progression() {
  return (
    <div className={CARTE + " p-4"}>
      <p className="flex items-center gap-2 text-sm font-semibold text-white mb-3"><TrendingUp className="w-4 h-4 text-[#34c77b]" />Progression 5 ans</p>
      <div className="space-y-1.5">
        {ANNEES.map((a) => (
          <div key={a.annee} className="rounded-xl border border-[#1e2a44] bg-[#0f1830] px-3 py-1.5 flex items-center gap-3 sm:gap-4">
            <Pastille rang={a.rang} />
            <div className="w-10 sm:w-14"><p className="text-[10px] uppercase text-[#8a97b5]">Année</p><p className="text-[13px] font-semibold text-primary">{a.annee}</p></div>
            <div className="flex-1 grid grid-cols-3 gap-x-3">
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Total brut</p><p className="text-[13px] font-semibold text-primary">{a.total}</p></div>
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Évolution</p><p className={"text-[13px] font-semibold " + (a.ton === "p" ? "text-[#34c77b]" : a.ton === "m" ? "text-[#e5566b]" : "text-[#8a97b5]")}>{a.evo}</p></div>
              <div><p className="text-[10px] uppercase text-[#8a97b5]">Bulletins</p><p className="text-[13px] font-semibold text-white">{a.mois}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES = [Tableau, Records, Progression];

export function CarrouselSuis() {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, [pause]);

  const Slide = SLIDES[index];
  const aller = (n: number) => setIndex((n + SLIDES.length) % SLIDES.length);

  return (
    <div onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div className={FOND}>
        <div className="h-[332px]">
          <Slide />
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
