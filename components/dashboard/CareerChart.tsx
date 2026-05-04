"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
        Total brut : {payload[0].value.toLocaleString("fr-FR")} €
      </p>
    </div>
  );
};

export function CareerChart({ payslips, birthDate }: CareerChartProps) {
  const data = useMemo(() => {
    if (!birthDate || payslips.length === 0) return [];

    const birth = new Date(birthDate);
    const byAge = new Map<number, number>();

    payslips.forEach(p => {
      if (!p.gross_salary || !p.period_year || !p.period_month) return;
      const bulletinDate = new Date(p.period_year, p.period_month - 1, 15);
      let age = bulletinDate.getFullYear() - birth.getFullYear();
      const m = bulletinDate.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && bulletinDate.getDate() < birth.getDate())) age--;
      if (age < 16 || age > 70) return;
      byAge.set(age, (byAge.get(age) ?? 0) + p.gross_salary);
    });

    return Array.from(byAge.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([age, total]) => ({ age, brut: Math.round(total) }));
  }, [payslips, birthDate]);

  const maxBrut = Math.max(...data.map(d => d.brut));

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
        <p className="text-sm text-muted-foreground">Total brut cumulé à chaque âge</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <Bar dataKey="brut" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.brut === maxBrut ? "hsl(45 93% 58%)" : "hsl(217 91% 60%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        🏆 Meilleure année à <strong className="text-foreground">{data.find(d => d.brut === maxBrut)?.age} ans</strong> — {maxBrut.toLocaleString("fr-FR")} € de brut total
      </p>
    </div>
  );
}