"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Lightbulb } from "lucide-react";

const FOND = "rounded-2xl border border-[#1e2a44] bg-[#0b0f1a] p-3 sm:p-4";
const CARTE = "rounded-xl border border-[#1e2a44] bg-[#10172a]";
const TITRES = ["Contrôlé et comparé à chaque bulletin", "Chaque ligne, ton montant et ton cumul", "Tous tes bulletins au même endroit"];

const LISTE = [
  ["septembre 2026", "2 463 €", "3 298 €", "171 €"],
  ["août 2026", "2 425 €", "3 246 €", "168 €"],
  ["juillet 2026", "2 431 €", "3 251 €", "169 €"],
  ["juin 2026", "2 418 €", "3 240 €", "167 €"],
];

const LIGNES = [
  ["Salaire de base", "3 120 €", "28 080 €"],
  ["CSG déductible", "165 €", "1 485 €"],
  ["Retraite complémentaire", "214 €", "1 926 €"],
  ["Prévoyance", "38 €", "342 €"],
  ["Net social", "2 702 €", "24 318 €"],
];

function Bulletin() {
  return (
    <div className={CARTE + " p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#16233f] flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">bulletin-de-paie-2026-09.pdf</p>
            <p className="text-xs text-[#8a97b5]">septembre 2026 · NOVA SERVICES</p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-[#34c77b] bg-[#0f2a1e] rounded-full px-2.5 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Contrôlé
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-[#1e2a44] mt-3.5 pt-3">
        <div><p className="text-xs text-[#8a97b5]">Net</p><p className="font-semibold text-[#34c77b]">2 463 €</p></div>
        <div><p className="text-xs text-[#8a97b5]">Brut</p><p className="font-semibold text-primary">3 298 €</p></div>
        <div><p className="text-xs text-[#8a97b5]">Impôt / PAS</p><p className="font-semibold text-[#c3cbe0]">171 €</p></div>
      </div>
      <div className="border-t border-[#1e2a44] mt-3 pt-3">
        <p className="text-sm text-primary flex items-center gap-1.5 mb-2"><Lightbulb className="w-4 h-4" />Insights<ChevronDown className="w-3.5 h-3.5" /></p>
        <div className="rounded-[10px] bg-[#16233f] px-3.5 py-3 text-[13px] leading-relaxed text-[#dbe2f2] space-y-1">
          <p>Ton net progresse de <strong className="font-semibold text-white">+38 €</strong> par rapport à août, porté par une hausse du brut de +52 €.</p>
          <p>Ton impôt à la source augmente de 3 € : c’est cohérent avec la hausse du brut.</p>
          <p>Aucune ligne nouvelle ni disparue par rapport au mois précédent.</p>
        </div>
      </div>
    </div>
  );
}

function Comprendre() {
  return (
    <div className={CARTE + " p-4"}>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-5 gap-y-1.5 text-[13px] items-center">
        <span className="text-xs text-[#8a97b5]">Ligne</span>
        <span className="text-xs text-[#8a97b5] text-right">Ce mois-ci</span>
        <span className="text-xs text-[#8a97b5] text-right">Cumul annuel</span>
        {LIGNES.map(([nom, mois, cumul]) => {
          const actif = nom === "CSG déductible";
          return (
            <div key={nom} className="contents">
              <span className={actif ? "text-white bg-[#2a1a14] rounded-md px-2 py-0.5 -ml-2 w-fit" : "text-[#c3cbe0]"}>{nom}</span>
              <span className={"text-right " + (actif ? "text-primary font-semibold" : "text-white")}>{mois}</span>
              <span className={"text-right " + (actif ? "text-primary font-semibold" : "text-white")}>{cumul}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 rounded-[10px] bg-[#16233f] px-3.5 py-3">
        <p className="text-[13px] font-medium text-white mb-1">CSG déductible</p>
        <p className="text-[13px] leading-relaxed text-[#aab5d0]">
          Une contribution qui finance la protection sociale, déduite de ton revenu imposable : tu paies donc un peu moins d’impôt grâce à elle. Cette année, tu en as déjà versé 1 485 €.
        </p>
      </div>
    </div>
  );
}

function Liste() {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-base font-semibold text-white">Vos bulletins</span>
        <span className="text-xs text-[#c3cbe0] bg-[#16233f] rounded-full px-2.5 py-0.5">54</span>
        <span className="ml-auto text-xs text-[#c3cbe0] border border-[#1e2a44] rounded-lg px-2.5 py-1">Toutes les années</span>
      </div>
      <div className="space-y-2">
        {LISTE.map(([periode, net, brut, impot]) => (
          <div key={periode} className={CARTE + " px-3.5 py-3 flex items-center gap-3"}>
            <FileText className="w-5 h-5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white">{periode}</p>
              <p className="text-xs text-[#8a97b5]">Net {net} · Brut {brut} · Impôt {impot}</p>
            </div>
            <span className="text-xs text-[#34c77b]">Traité</span>
            <Download className="w-4 h-4 text-[#8a97b5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES = [Bulletin, Comprendre, Liste];

export function CarrouselComprends() {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
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
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => aller(index + 1)} aria-label="Suivant" className="p-1.5 rounded-lg hover:bg-secondary/60">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
