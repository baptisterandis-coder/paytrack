"use client";

import { useState, useMemo } from "react";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PodiumModal } from "@/components/ui/PodiumModal";
import { usePayslips } from "@/hooks/usePayslips";
import { ACHIEVEMENT_DEFS, getTopNetSalaries, getTopYears, getLast5YearsProgression, formatCurrency, formatPeriod } from "@/utils/salary";

const ICON_MAP: Record<string, React.ReactNode> = {
  "best-year": <Target className="w-6 h-6" />,
  "salary-record": <Trophy className="w-6 h-6" />,
  "progression": <TrendingUp className="w-6 h-6" />,
  "prime-hunter": <span className="text-xl">💰</span>,
  "milestone-50k": <span className="text-xl">🌟</span>,
  "streak-master": <span className="text-xl">⚡</span>,
};

const COLOR_MAP: Record<string, string> = {
  "best-year": "bg-primary/10 text-primary",
  "salary-record": "bg-warning/10 text-warning",
  "progression": "bg-success/10 text-success",
  "prime-hunter": "bg-primary/10 text-primary",
  "milestone-50k": "bg-muted/30 text-muted-foreground",
  "streak-master": "bg-muted/30 text-muted-foreground",
};

export function AchievementBadges() {
  const { payslips } = usePayslips();
  const [modal, setModal] = useState<"salary-record" | "best-year" | "progression" | null>(null);

  const achievements = useMemo(() => ACHIEVEMENT_DEFS.map(d => ({ ...d, unlocked: d.check(payslips) })), [payslips]);
  const unlocked = achievements.filter(a => a.unlocked).length;

  const salaryRows = useMemo(() => getTopNetSalaries(payslips).map(p => ({
    key: p.id,
    cells: [
      { label: "Net", value: formatCurrency(p.net_after_tax ?? p.net_salary), accent: "text-success" },
      { label: "Brut", value: formatCurrency(p.gross_salary), accent: "text-primary" },
      { label: "Entreprise", value: p.company_name || "—" },
      { label: "Période", value: formatPeriod(p.period_month, p.period_year) },
    ],
  })), [payslips]);

  const yearRows = useMemo(() => getTopYears(payslips).map(y => ({
    key: String(y.year),
    cells: [
      { label: "Année", value: y.year, accent: "text-primary" },
      { label: "Total Net", value: formatCurrency(y.totalNet), accent: "text-success" },
      { label: "Total Brut", value: formatCurrency(y.totalGross), accent: "text-primary" },
      { label: "Entreprises", value: Array.from(y.companies).join(", ") || "—" },
    ],
  })), [payslips]);

  const progressRows = useMemo(() => getLast5YearsProgression(payslips).map(y => ({
    key: String(y.year),
    cells: [
      { label: "Année", value: y.year, accent: "text-primary" },
      { label: "Total Net", value: formatCurrency(y.totalNet), accent: "text-success" },
      { label: "Évolution", value: y.growthRate != null
        ? <span className={y.growthRate >= 0 ? "text-success" : "text-danger"}>{y.growthRate > 0 ? "+" : ""}{y.growthRate.toFixed(1)}%</span>
        : <span className="text-muted-foreground text-xs">1re année</span> },
      { label: "Bulletins", value: `${y.count} mois` },
    ],
  })), [payslips]);

  const handleClick = (id: string) => {
    if (id === "best-year") setModal("best-year");
    else if (id === "salary-record") setModal("salary-record");
    else if (id === "progression") setModal("progression");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Vos Achievements</h3>
        <Badge variant="outline" className="text-primary border-primary/20">{unlocked}/{achievements.length} débloqués</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(a => {
          const clickable = a.unlocked && ["best-year","salary-record","progression"].includes(a.id);
          return (
            <Card key={a.id}
              className={`p-4 border-border/50 transition-all ${a.unlocked ? `${clickable ? "cursor-pointer hover:shadow-glow" : ""}` : "opacity-50"}`}
              onClick={() => a.unlocked && handleClick(a.id)}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${COLOR_MAP[a.id] ?? "bg-muted/20"}`}>{ICON_MAP[a.id]}</div>
                <div className="flex-1 space-y-1">
                  <h4 className={`font-semibold ${a.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</h4>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  {a.unlocked && <Badge variant="success" className="text-xs">Débloqué</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <PodiumModal open={modal === "salary-record"} onOpenChange={v => !v && setModal(null)} title={<><Trophy className="w-5 h-5 text-warning" /> Top 3 Salaires Record</>} rows={salaryRows} />
      <PodiumModal open={modal === "best-year"} onOpenChange={v => !v && setModal(null)} title={<><Target className="w-5 h-5 text-primary" /> Top 3 Années Record</>} rows={yearRows} />
      <PodiumModal open={modal === "progression"} onOpenChange={v => !v && setModal(null)} title={<><TrendingUp className="w-5 h-5 text-success" /> Progression 5 ans</>} rows={progressRows} />
    </div>
  );
}