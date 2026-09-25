import { NextResponse } from "next/server";

// Indice des prix à la consommation harmonisé (IPCH) France, mensuel, base 2025 = 100.
// Source officielle Eurostat, mise en cache et régénérée automatiquement une fois par jour.
export const revalidate = 86400;

export interface InflationPayload {
  index: Record<string, number>; // "2026-08" -> 103.76
  latest: string | null;         // dernier mois publié
}

export async function GET() {
  const empty: InflationPayload = { index: {}, latest: null };
  try {
    const qs = new URLSearchParams({
      format: "JSON",
      lang: "EN",
      geo: "FR",
      coicop18: "TOTAL",
      unit: "I25",
      sinceTimePeriod: "2015-01",
    });
    const res = await fetch(
      `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_minr?${qs}`,
      { next: { revalidate } }
    );
    if (!res.ok) return NextResponse.json(empty);
    const json = await res.json();
    const timeIdx: Record<string, number> = json?.dimension?.time?.category?.index ?? {};
    const values: Record<string, number> = json?.value ?? {};

    const index: Record<string, number> = {};
    let latest: string | null = null;
    for (const [period, i] of Object.entries(timeIdx)) {
      const v = values[String(i)];
      if (typeof v === "number" && v > 0) {
        index[period] = v;
        if (!latest || period > latest) latest = period;
      }
    }
    const payload: InflationPayload = { index, latest };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(empty);
  }
}
