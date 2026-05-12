"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface KpiData {
  smic: string;
  smicSub: string;
  inflation: string;
  inflationSub: string;
  chomage: string;
  chomageSub: string;
  salaireMedian: string;
  livretA: string;
  livretASub: string;
  inflationAlert: boolean;
}

const FALLBACK: KpiData = {
  smic: "1 801,80 €",
  smicSub: "depuis jan. 2025",
  inflation: "+2,2%",
  inflationSub: "sur un an — avril 2026",
  chomage: "7,9%",
  chomageSub: "T4 2025 — INSEE",
  salaireMedian: "2 400 €",
  livretA: "1,5%",
  livretASub: "depuis fév. 2026",
  inflationAlert: true,
};

const CACHE_KEY = "paytrack_kpi_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

function getCache(): KpiData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data: KpiData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

async function fetchInseeValue(serieId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.insee.fr/series/BDM/V1/data/SERIES_BDM/${serieId}?lastNObservations=1`,
      { headers: { "Accept": "application/json" } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const obs = data?.GenericData?.DataSet?.Series?.Obs;
    if (!obs) return null;
    const last = Array.isArray(obs) ? obs[obs.length - 1] : obs;
    return last?.ObsValue?.["@value"] ?? null;
  } catch {
    return null;
  }
}

async function fetchKpis(): Promise<KpiData> {
  const cached = getCache();
  if (cached) return cached;

  const [inflationRaw, chomageRaw] = await Promise.all([
    fetchInseeValue("001759970"), // IPC glissement annuel
    fetchInseeValue("001688370"), // Taux de chômage BIT France
  ]);

  const inflation = inflationRaw
    ? `+${parseFloat(inflationRaw).toFixed(1)}%`
    : FALLBACK.inflation;

  const chomage = chomageRaw
    ? `${parseFloat(chomageRaw).toFixed(1)}%`
    : FALLBACK.chomage;

  // Calcul alerte inflation > Livret A
  const inflationValue = inflationRaw ? parseFloat(inflationRaw) : 2.2;
  const livretAValue = 1.5;
  const inflationAlert = inflationValue > livretAValue;

  const result: KpiData = {
    ...FALLBACK,
    inflation,
    inflationSub: inflationRaw ? "sur un an — INSEE" : FALLBACK.inflationSub,
    chomage,
    chomageSub: chomageRaw ? "BIT — INSEE" : FALLBACK.chomageSub,
    inflationAlert,
  };

  setCache(result);
  return result;
}

interface TooltipProps {
  text: string;
}

function Tooltip({ text }: TooltipProps) {
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
  const [kpis, setKpis] = useState<KpiData>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKpis()
      .then(setKpis)
      .finally(() => setLoading(false));
  }, []);

  const kpiList = [
    {
      label: "SMIC brut mensuel",
      value: kpis.smic,
      sub: kpis.smicSub,
      alert: false,
    },
    {
      label: "Inflation",
      value: kpis.inflation,
      sub: kpis.inflationSub,
      alert: kpis.inflationAlert,
    },
    {
      label: "Chômage",
      value: kpis.chomage,
      sub: kpis.chomageSub,
      alert: false,
    },
    {
      label: "Salaire médian",
      value: kpis.salaireMedian,
      sub: "net/mois",
      alert: false,
      tooltip: "50% des salariés français gagnent moins que ce montant",
    },
    {
      label: "Livret A",
      value: kpis.livretA,
      sub: kpis.livretASub,
      alert: kpis.inflationAlert,
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
        Indicateurs économiques
      </p>
      <div className="space-y-2">
        {kpiList.map((kpi, i) => (
          <Card key={i} className="p-3">
            {loading ? (
              <div className="space-y-1">
                <div className="h-3 bg-muted/30 rounded animate-pulse w-24" />
                <div className="h-5 bg-muted/20 rounded animate-pulse w-16" />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  {kpi.tooltip && <Tooltip text={kpi.tooltip} />}
                </div>
                <p className={`font-bold text-base ${kpi.alert ? "text-warning" : "text-foreground"}`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {!loading && kpis.inflationAlert && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mt-2">
          <p className="text-xs text-warning font-medium">
            ⚠️ Inflation ({kpis.inflation}) &gt; Livret A ({kpis.livretA})
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ton épargne perd de la valeur en ce moment.
          </p>
        </div>
      )}
    </div>
  );
}