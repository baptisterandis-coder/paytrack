"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MonthlyChartData } from "@/utils/salary";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-xl p-3 shadow-card">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name} : {entry.value.toLocaleString("fr-FR")} €
        </p>
      ))}
    </div>
  );
};

export function SalaryChart({ data }: { data: MonthlyChartData[] }) {
  const cy = new Date().getFullYear();
  const hasData = data.some(d => d.brut > 0 || d.brutN1 > 0);

  const displayData = hasData ? data : [
    { month: "Jan", brut: 4200, net: 3200, brutN1: 4000, netN1: 3100 },
    { month: "Fév", brut: 4350, net: 3300, brutN1: 4150, netN1: 3200 },
    { month: "Mar", brut: 4300, net: 3250, brutN1: 4200, netN1: 3150 },
    { month: "Avr", brut: 4500, net: 3400, brutN1: 4400, netN1: 3300 },
    { month: "Mai", brut: 4550, net: 3450, brutN1: 4450, netN1: 3350 },
    { month: "Jun", brut: 4600, net: 3500, brutN1: 4500, netN1: 3400 },
    { month: "Jul", brut: 0, net: 0, brutN1: 4600, netN1: 3500 },
    { month: "Aoû", brut: 0, net: 0, brutN1: 4550, netN1: 3450 },
    { month: "Sep", brut: 0, net: 0, brutN1: 4700, netN1: 3600 },
    { month: "Oct", brut: 0, net: 0, brutN1: 4750, netN1: 3650 },
    { month: "Nov", brut: 0, net: 0, brutN1: 4800, netN1: 3700 },
    { month: "Déc", brut: 0, net: 0, brutN1: 4900, netN1: 3800 },
  ];

  return (
    <div className="bg-gradient-card rounded-2xl p-6 border border-border/50 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Évolution Salariale {cy}</h3>
          <p className="text-sm text-muted-foreground">Comparaison avec {cy - 1}</p>
        </div>
        {!hasData && <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">Données d'exemple</span>}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9%)" />
          <XAxis dataKey="month" stroke="hsl(240 5% 64.9%)" fontSize={12} tickLine={false} />
          <YAxis stroke="hsl(240 5% 64.9%)" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" iconSize={8} />
          <Bar dataKey="brutN1" fill="hsl(190 85% 50%)" name={`Brut ${cy - 1}`} radius={[3, 3, 0, 0]} />
          <Bar dataKey="brut" fill="hsl(217 91% 60%)" name={`Brut ${cy}`} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}