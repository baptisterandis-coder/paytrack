"use client";

import { Card } from "@/components/ui/card";

const KPIS = [
  {
    label: "SMIC brut mensuel",
    value: "1 823,03 €",
    sub: "depuis jan. 2026",
    alert: false,
  },
  {
    label: "Inflation",
    value: "+2,2%",
    sub: "sur un an — avril 2026",
    alert: true,
  },
  {
    label: "Chômage",
    value: "7,9%",
    sub: "T4 2025 — INSEE",
    alert: false,
  },
  {
    label: "Salaire médian",
    value: "2 400 €",
    sub: "net/mois",
    alert: false,
    tooltip: "50% des salariés français gagnent moins que ce montant",
  },
  {
    label: "Livret A",
    value: "1,5%",
    sub: "depuis fév. 2026",
    alert: true,
  },
];

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block">
      <span className="text-xs text-muted-foreground cursor-help">ⓘ</span>
      <div className="absolute left-0 bottom-5 w-48 bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {text}
      </div>
    </div>
  );
}

export function KpiFeed() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
        Indicateurs économiques
      </p>
      <div className="space-y-2">
        {KPIS.map((kpi, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              {kpi.tooltip && <Tooltip text={kpi.tooltip} />}
            </div>
            <p className={`font-bold text-base ${kpi.alert ? "text-warning" : "text-foreground"}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </Card>
        ))}
      </div>
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mt-2">
        <p className="text-xs text-warning font-medium">⚠️ Inflation (+2,2%) &gt; Livret A (1,5%)</p>
        <p className="text-xs text-muted-foreground mt-0.5">Ton épargne perd de la valeur en ce moment.</p>
      </div>
    </div>
  );
}