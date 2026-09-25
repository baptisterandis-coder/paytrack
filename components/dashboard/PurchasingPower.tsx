"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { formatCurrency, getMonthShort, resolveNetSalary, type Payslip } from "@/utils/salary";

type Basis = "net" | "brut";

const periodKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;
const signedPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;
const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

export function PurchasingPower({ payslips }: { payslips: Payslip[] }) {
  const [index, setIndex] = useState<Record<string, number>>({});
  const [latest, setLatest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [basis, setBasis] = useState<Basis>("net");
  const [fromYearChoice, setFromYearChoice] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/inflation")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setIndex(d.index ?? {});
        setLatest(d.latest ?? null);
      })
      .catch((e) => console.error("Inflation fetch error:", e))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const amount = (p: Payslip) => (basis === "net" ? resolveNetSalary(p) : p.gross_salary ?? 0);

    // Bulletins exploitables, triés chronologiquement
    const valid = payslips
      .filter((p) => p.period_year && p.period_month && amount(p) > 0)
      .sort((a, b) => periodKey(a.period_year, a.period_month).localeCompare(periodKey(b.period_year, b.period_month)));

    // Période récente : les 12 derniers bulletins
    const recent = valid.slice(-12);
    if (recent.length < 6 || !latest) return null;
    const lastKey: string = latest;
    const recentStartYear = recent[0].period_year;

    // Années de référence possibles : entièrement avant la période récente
    const years = Array.from(new Set(valid.map((p) => p.period_year)))
      .filter((y) => y < recentStartYear)
      .sort((a, b) => a - b);
    if (years.length === 0) return { years, result: null };

    const fromYear = fromYearChoice && years.includes(fromYearChoice) ? fromYearChoice : years[0];
    const base = valid.filter((p) => p.period_year === fromYear);

    // Indice des prix du mois du bulletin (dernier indice connu pour les mois pas encore publiés)
    const idx = (p: Payslip) => index[periodKey(p.period_year, p.period_month)] ?? index[lastKey];

    const A = avg(base.map(amount));
    const B = avg(recent.map(amount));
    const IA = avg(base.map(idx));
    const IB = avg(recent.map(idx));
    if (!A || !B || !IA || !IB) return { years, result: null };

    const nominal = (B / A - 1) * 100;
    const inflation = (IB / IA - 1) * 100;
    const real = ((B / A) / (IB / IA) - 1) * 100;
    const gainPerMonth = B - A * (IB / IA);

    const first = recent[0];
    const last = recent[recent.length - 1];

    return {
      years,
      result: {
        fromYear,
        A, B, nominal, inflation, real, gainPerMonth,
        recentLabel: `${getMonthShort(first.period_month)} ${first.period_year} – ${getMonthShort(last.period_month)} ${last.period_year}`,
      },
    };
  }, [payslips, basis, index, latest, fromYearChoice]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <div className="h-3 bg-muted/30 rounded animate-pulse w-32" />
          <div className="h-8 bg-muted/20 rounded animate-pulse w-24" />
          <div className="h-3 bg-muted/20 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!data || !data.result) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Ton pouvoir d'achat réel</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Il faut au moins une année de bulletins avant tes 12 derniers mois pour mesurer l'évolution de ton pouvoir d'achat.
        </p>
      </Card>
    );
  }

  const r = data.result;
  const positive = r.real >= 0;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <Wallet className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Ton pouvoir d'achat réel</h3>
        <div className="ml-auto flex rounded-lg bg-muted/30 p-0.5 text-[11px]">
          {(["net", "brut"] as Basis[]).map((b) => (
            <button
              key={b}
              onClick={() => setBasis(b)}
              className={`px-2 py-0.5 rounded-md transition-colors ${basis === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {b === "net" ? "Net" : "Brut"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span>Depuis</span>
        <select
          value={r.fromYear}
          onChange={(e) => setFromYearChoice(Number(e.target.value))}
          className="bg-secondary border border-border/50 rounded-md px-2 py-0.5 text-xs text-foreground"
        >
          {data.years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className={`rounded-xl p-3 mb-3 ${positive ? "bg-success/10" : "bg-danger/10"}`}>
        <p className={`text-2xl font-bold ${positive ? "text-success" : "text-danger"}`}>{signedPct(r.real)}</p>
        <p className="text-xs text-muted-foreground">
          {positive ? "de gain réel, inflation déduite" : "de perte réelle, inflation déduite"}
        </p>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ton salaire {basis}</span>
          <span className="font-semibold">{signedPct(r.nominal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Inflation (prix)</span>
          <span className="font-semibold">{signedPct(r.inflation)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-border/30">
          <span className="text-muted-foreground">Soit, en euros constants</span>
          <span className={`font-semibold ${positive ? "text-success" : "text-danger"}`}>
            {r.gainPerMonth > 0 ? "+" : ""}{formatCurrency(r.gainPerMonth)}/mois
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Moyenne mensuelle {r.fromYear} ({formatCurrency(r.A)}) vs tes 12 derniers bulletins, {r.recentLabel} ({formatCurrency(r.B)}). Primes incluses. Inflation : Eurostat (IPCH France).
      </p>
    </Card>
  );
}
