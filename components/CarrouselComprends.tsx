"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

const CARTE = "bg-gradient-card border border-border/50 rounded-2xl shadow-card";
const LIGNES = ["CSG déductible", "Retraite complémentaire", "Prévoyance", "Net social"];
const TITRES = ["Chaque ligne expliquée", "Contrôlé et comparé", "Ton montant et ton cumul"];

function Lexique() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">Dans l’onglet Comprendre</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {LIGNES.map((ligne) => (
          <span key={ligne} className="text-xs bg-secondary/70 rounded-full px-3 py-1.5">{ligne}</span>
        ))}
      </div>
      <div className="bg-primary/10 rounded-xl p-4">
        <p className="font-semibold mb-1">CSG déductible</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Une contribution qui finance la protection sociale, déduite de ton revenu imposable : tu paies donc un peu moins d’impôt grâce à elle.
        </p>
      </div>
    </div>
  );
}

function Controle() {
  const lignes = [
    ["Net à payer", "3 855 €", "+31 €"],
    ["Brut", "5 646 €", "+0 €"],
    ["Impôt (PAS)", "508 €", "-11 €"],
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">Exemple · profil de démonstration</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/15 rounded-full px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Contrôlé
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Ce mois-ci</span>
          <span>vs mois précédent</span>
        </div>
        {lignes.map(([nom, montant, ecart]) => (
          <div key={nom} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
            <span className="text-muted-foreground">{nom}</span>
            <span className="flex items-center gap-4">
              <span className="font-semibold">{montant}</span>
              <span className="w-14 text-right text-xs font-medium text-primary">{ecart}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Chaque écart est relevé et expliqué. Ce qui mérite d’être vérifié est signalé.
      </p>
    </div>
  );
}

function Cumul() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">Exemple · profil de démonstration</p>
      <p className="font-semibold mb-3">CSG déductible</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/50 p-4">
          <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          <p className="mt-1 text-2xl font-extrabold">195 €</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-xs text-muted-foreground">Cumul depuis janvier</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">975 €</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Les montants et les cumuls viennent de ton bulletin, pas d’un exemple générique.
      </p>
    </div>
  );
}

const SLIDES = [Lexique, Controle, Cumul];

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
    <div
      className={CARTE + " p-6"}
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <div className="min-h-[250px]">
        <Slide />
      </div>
      <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
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
