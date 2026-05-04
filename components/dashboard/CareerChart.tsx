"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import type { Payslip } from "@/utils/salary";

interface CareerChartProps {
  payslips: Payslip[];
  birthDate: string | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-xl p-3 shadow-card">
      <p className="font-medium text-foreground mb-1">{label} ans</p>
      <p className="text-sm text-primary">
        Brut moyen : {payload[0].value.toLocaleString("fr-FR")} €/mois
      </p>
    </div>
  );
};

export function CareerChart({ payslips, birthDate }: CareerChartProps) {
  const data = useMemo(() => {
    if (!birthDate || payslips.length === 0) return [];

    const birth = new Date(birthDate);

    // Calculer l'âge exact pour chaque bulletin
    const byAge = new Map<number, { total: number; count: number }>();

    payslips.forEach(p => {
      if (!p.gross_salary || !p.period_year || !p.period_month) return;

      // Date approximative du bulletin (milieu du mois)
      const bulletinDate = new Date(p.period_year, p.period_month - 1, 15);

      // Calcul de l'âge exact à la date du bulletin
      let age = bulletinDate.getFullYear() - birth.getFullYear();
      const m = bulletinDate.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && bulletinDate.getDate() < birth.getDate())) age--;

      if (age < 16 || age > 70) return; // Sanity check

      const existing = byAge.get(age) ?? { total: 0, count: 0 };
      byAge.set(age, { total: existing.total + p.gross_salary, count: existing.count + 1 });
    });

    return Array.from(byAge.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([age, { total, count }]) => ({
        age,
        brut: Math.round(total / count),
      }));
  }, [payslips, birthDate]);

  const maxPoint = data.reduce<{ age: number; brut: number } | null>((max, d) => !max || d.brut > max.brut ? d : max, null);

  if (data.length === 0) {
    return (
      <div className="bg-gradient-card rounded-2xl p-6 border border-border/50 shadow-card">
        <h3 className="text-xl font-semibold text-foreground mb-2">Courbe de Carrière</h3>
        <p className="text-sm text-muted-foreground">
          {!birthDate ? "Renseigne ta date de naissance dans ton profil pour voir ta courbe de carrière." : "Uploade des bulletins pour voir ta courbe de carrière."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-card rounded-2xl p-6 border border-border/50 shadow-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground">Courbe de Carrière</h3>
        <p className="text-sm text-muted-foreground">Salaire brut moyen à chaque âge</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
          <XAxis
            dataKey="age"
            stroke="hsl(240 5% 64.9%)"
            fontSize={12}
            tickLine={false}
            tickFormatter={v => `${v} ans`}
          />
          <YAxis
            stroke="hsl(240 5% 64.9%)"
            fontSize={12}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="brut"
            stroke="hsl(217 91% 60%)"
            strokeWidth={2.5}
            dot={{ fill: "hsl(217 91% 60%)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "hsl(217 91% 60%)" }}
          />
          {maxPoint && (
            <ReferenceDot
              x={maxPoint.age}
              y={maxPoint.brut}
              r={6}
              fill="hsl(45 93% 58%)"
              stroke="none"
              label={{ value: "🏆", position: "top", fontSize: 16 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {maxPoint && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          🏆 Meilleure année à <strong className="text-foreground">{maxPoint.age} ans</strong> — {maxPoint.brut.toLocaleString("fr-FR")} €/mois en moyenne
        </p>
      )}
    </div>
  );
}