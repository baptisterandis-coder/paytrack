import { NextResponse } from "next/server";

// Les indicateurs sont mis en cache et régénérés automatiquement une fois
// par jour (les valeurs live sont donc toujours à jour sans intervention).
export const revalidate = 86400;

export interface Kpi {
  key: string;
  label: string;
  value: string;
  sub: string;
  alert: boolean;
  tooltip?: string;
  source: "live" | "manuel";
}

export interface KpisPayload {
  kpis: Kpi[];
  warning: { text: string; sub: string; positive: boolean } | null;
  updatedAt: string;
}

const HOURS_PER_MONTH = 151.67; // base légale 35 h/semaine

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

const pct = (n: number, withSign = false) =>
  `${withSign && n > 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;

const monthYear = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(d);

// --- SMIC : API OpenFisca (officiel, valeurs datées par décret) -------------
async function fetchSmic(): Promise<{ monthly: number; since: Date } | null> {
  try {
    const res = await fetch(
      "https://api.fr.openfisca.org/latest/parameter/marche_travail.salaire_minimum.smic.smic_b_horaire",
      { next: { revalidate } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const values: Record<string, number> = json?.values ?? {};
    const today = new Date();
    const applicable = Object.keys(values)
      .filter((d) => new Date(d) <= today)
      .sort();
    const latest = applicable[applicable.length - 1];
    if (!latest) return null;
    const hourly = values[latest];
    if (typeof hourly !== "number" || hourly <= 0) return null;
    return { monthly: hourly * HOURS_PER_MONTH, since: new Date(latest) };
  } catch {
    return null;
  }
}

// --- Eurostat (SDMX-JSON) : dernière valeur d'une série temporelle ----------
async function fetchEurostatLatest(
  dataset: string,
  params: Record<string, string>
): Promise<{ value: number; period: Date } | null> {
  try {
    const qs = new URLSearchParams({ format: "JSON", lang: "EN", geo: "FR", ...params });
    const res = await fetch(
      `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${qs}`,
      { next: { revalidate } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const index: Record<string, number> = json?.dimension?.time?.category?.index ?? {};
    const values: Record<string, number> = json?.value ?? {};
    let bestPeriod: string | null = null;
    let bestIdx = -1;
    for (const [period, i] of Object.entries(index)) {
      if (typeof i === "number" && i > bestIdx && values[String(i)] != null) {
        bestIdx = i;
        bestPeriod = period;
      }
    }
    if (bestPeriod == null) return null;
    const value = values[String(bestIdx)];
    if (typeof value !== "number") return null;
    return { value, period: new Date(`${bestPeriod}-01`) };
  } catch {
    return null;
  }
}

export async function GET() {
  // Valeurs maintenues côté serveur (changent rarement, à dates connues).
  // Livret A : fixé par arrêté, révisé le 1er février et le 1er août.
  // Ajouter une ligne à chaque révision : le taux en vigueur est choisi automatiquement.
  const LIVRET_A_HISTORY: { since: string; rate: number }[] = [
    { since: "2025-08-01", rate: 1.7 },
    { since: "2026-02-01", rate: 1.5 },
    { since: "2026-08-01", rate: 1.7 },
  ];
  const livretACurrent = LIVRET_A_HISTORY
    .filter((r) => new Date(r.since) <= new Date())
    .sort((a, b) => a.since.localeCompare(b.since))
    .pop() ?? LIVRET_A_HISTORY[LIVRET_A_HISTORY.length - 1];
  const LIVRET_A = livretACurrent.rate;
  const livretASince = `depuis ${monthYear(new Date(livretACurrent.since))}`;

  const [smic, inflation, chomage] = await Promise.all([
    fetchSmic(),
    fetchEurostatLatest("prc_hicp_minr", { coicop18: "TOTAL", unit: "RCH_A" })
      .then((r) => r ?? fetchEurostatLatest("prc_hicp_manr", { coicop: "CP00" })),
    fetchEurostatLatest("une_rt_m", { sex: "T", age: "TOTAL", unit: "PC_ACT", s_adj: "SA" }),
  ]);

  // Plausibilité : si une source renvoie une valeur aberrante, on retombe
  // sur une valeur maintenue plutôt que d'afficher n'importe quoi.
  const inflationVal =
    inflation && inflation.value > -5 && inflation.value < 30 ? inflation.value : 2.0;
  const inflationLive = !!(inflation && inflation.value > -5 && inflation.value < 30);
  const chomageVal =
    chomage && chomage.value > 0 && chomage.value < 30 ? chomage.value : 7.9;
  const chomageLive = !!(chomage && chomage.value > 0 && chomage.value < 30);

  const kpis: Kpi[] = [
    {
      key: "smic",
      label: "SMIC brut mensuel",
      value: smic ? eur(smic.monthly) : "1 823,07 €",
      sub: smic ? `depuis ${monthYear(smic.since)}` : "depuis janv. 2026",
      alert: false,
      source: smic ? "live" : "manuel",
    },
    {
      key: "inflation",
      label: "Inflation",
      value: pct(inflationVal, true),
      sub: inflationLive && inflation ? `sur un an — ${monthYear(inflation.period)}` : "sur un an",
      alert: inflationVal > LIVRET_A,
      source: inflationLive ? "live" : "manuel",
    },
    {
      key: "chomage",
      label: "Chômage",
      value: pct(chomageVal),
      sub: chomageLive && chomage ? `${monthYear(chomage.period)} — Eurostat` : "France — Eurostat",
      alert: false,
      source: chomageLive ? "live" : "manuel",
    },
    {
      key: "livret_a",
      label: "Livret A",
      value: pct(LIVRET_A),
      sub: livretASince,
      alert: LIVRET_A < inflationVal,
      source: "manuel",
    },
    {
      key: "salaire_median",
      label: "Salaire médian",
      value: "2 400 €",
      sub: "net/mois — INSEE",
      alert: false,
      tooltip: "50% des salariés français gagnent moins que ce montant",
      source: "manuel",
    },
  ];

  const warning =
    inflationVal > LIVRET_A
      ? {
          text: `⚠️ Inflation (${pct(inflationVal, true)}) > Livret A (${pct(LIVRET_A)})`,
          sub: "Ton épargne perd de la valeur en ce moment.",
          positive: false,
        }
      : {
          text: `✅ Livret A (${pct(LIVRET_A)}) ≥ inflation (${pct(inflationVal, true)})`,
          sub: "Ton épargne conserve son pouvoir d'achat.",
          positive: true,
        };

  const payload: KpisPayload = { kpis, warning, updatedAt: new Date().toISOString() };
  return NextResponse.json(payload);
}
