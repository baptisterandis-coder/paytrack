"use client";

import { useState, useMemo } from "react";
import { Target, TrendingUp, Pencil, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PodiumModal } from "@/components/ui/PodiumModal";
import { useGoals } from "@/hooks/useGoals";
import { usePayslips } from "@/hooks/usePayslips";
import { getTopGrossSalaries, getTopYears, formatCurrency, formatPeriod, resolveNetSalary } from "@/utils/salary";

function GoalForm({ label, placeholder, value, onChange, onSubmit, onCancel, onDelete, editing, btnClass }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void; onCancel?: () => void; onDelete?: () => void;
  editing: boolean; btnClass?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Input type="number" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} min="0" step="100" />
      </div>
      <div className="flex gap-2">
        {editing && onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>}
        <Button type="submit" className={`flex-1 ${btnClass ?? ""}`}>{editing ? "Enregistrer" : "Définir l'objectif"}</Button>
      </div>
      {editing && onDelete && (
        <button type="button" onClick={onDelete} className="text-sm text-danger hover:underline w-full text-center">Supprimer l'objectif</button>
      )}
    </form>
  );
}

export function Goals() {
  const { goals, createOrUpdateGoal, deleteGoal } = useGoals();
  const { payslips } = usePayslips();
  const [annualTarget, setAnnualTarget] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState("");
  const [editingAnnual, setEditingAnnual] = useState(false);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [modal, setModal] = useState<"top-salaries" | "top-years" | null>(null);

  const annualGoal = goals.find(g => g.goal_type === "annual_gross");
  const monthlyGoal = goals.find(g => g.goal_type === "monthly_gross");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const currentYearPayslips = payslips.filter(p => p.period_year === currentYear);
  const totalGross = currentYearPayslips.reduce((s, p) => s + (p.gross_salary ?? 0), 0);
  const bulletinCount = currentYearPayslips.length;

  const avgMonthlyGross = bulletinCount > 0 ? totalGross / bulletinCount : 0;
  const overallProgress = annualGoal ? Math.min((totalGross / annualGoal.target_amount) * 100, 100) : 0;
  const expectedSoFar = annualGoal ? (annualGoal.target_amount / 12) * currentMonth : 0;
  const delta = annualGoal ? totalGross - expectedSoFar : 0;
  const isAhead = delta >= 0;

  const monthlyProgress = monthlyGoal && avgMonthlyGross > 0
    ? Math.min((avgMonthlyGross / monthlyGoal.target_amount) * 100, 100)
    : 0;
  const monthlyDelta = monthlyGoal ? avgMonthlyGross - monthlyGoal.target_amount : 0;
  const isMonthlyAhead = monthlyDelta >= 0;

  const topSalaryRows = useMemo(() => getTopGrossSalaries(payslips).map(p => ({
    key: p.id,
    cells: [
      { label: "Brut", value: formatCurrency(p.gross_salary), accent: "text-primary" },
      { label: "Net", value: formatCurrency(resolveNetSalary(p)), accent: "text-success" },
      { label: "Entreprise", value: p.company_name || "—" },
      { label: "Période", value: formatPeriod(p.period_month, p.period_year) },
    ],
  })), [payslips]);

  const topYearRows = useMemo(() => getTopYears(payslips).map(y => ({
    key: String(y.year),
    cells: [
      { label: "Année", value: y.year, accent: "text-primary" },
      { label: "Total Brut", value: formatCurrency(y.totalGross), accent: "text-primary" },
      { label: "Total Net", value: formatCurrency(y.totalNet), accent: "text-success" },
      { label: "Entreprises", value: Array.from(y.companies).join(", ") || "—" },
    ],
  })), [payslips]);

  const handleAnnual = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(annualTarget);
    if (v > 0) { createOrUpdateGoal("annual_gross", v); setAnnualTarget(""); setEditingAnnual(false); }
  };

  const handleMonthly = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(monthlyTarget);
    if (v > 0) { createOrUpdateGoal("monthly_gross", v); setMonthlyTarget(""); setEditingMonthly(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /><CardTitle>Objectif Annuel Brut</CardTitle></div>
              <Button variant="ghost" size="icon" onClick={() => setModal("top-years")} className="text-warning hover:text-warning hover:bg-warning/10"><Trophy className="w-4 h-4" /></Button>
            </div>
            <CardDescription>Objectif brut pour {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {annualGoal && !editingAnnual ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Objectif annuel</span>
                  <span className="font-semibold">{formatCurrency(annualGoal.target_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actuel ({bulletinCount} bulletins)</span>
                  <span className="font-semibold">{formatCurrency(totalGross)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avance / Retard</span>
                  <span className={`font-semibold ${isAhead ? "text-success" : "text-danger"}`}>
                    {isAhead ? "+" : ""}{formatCurrency(delta)}
                  </span>
                </div>
                <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-warning transition-all duration-500 flex items-center justify-center rounded-full"
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}>
                    {overallProgress > 8 && <span className="text-xs font-bold text-warning-foreground">{overallProgress.toFixed(0)}%</span>}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10"
                    onClick={() => { setAnnualTarget(annualGoal.target_amount.toString()); setEditingAnnual(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <GoalForm label="Objectif annuel (€)" placeholder="Ex : 50 000" value={annualTarget} onChange={setAnnualTarget}
                onSubmit={handleAnnual} editing={editingAnnual} btnClass="bg-gradient-primary shadow-primary"
                onCancel={() => { setAnnualTarget(""); setEditingAnnual(false); }}
                onDelete={() => { if (annualGoal) { deleteGoal(annualGoal.id); setEditingAnnual(false); } }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Target className="w-5 h-5 text-success" /><CardTitle>Objectif Mensuel Moyen</CardTitle></div>
              <Button variant="ghost" size="icon" onClick={() => setModal("top-salaries")} className="text-warning hover:text-warning hover:bg-warning/10"><Trophy className="w-4 h-4" /></Button>
            </div>
            <CardDescription>Moyenne brute sur les {bulletinCount} bulletins {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyGoal && !editingMonthly ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Objectif mensuel</span>
                  <span className="font-semibold">{formatCurrency(monthlyGoal.target_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Moyenne actuelle</span>
                  <span className="font-semibold">{bulletinCount > 0 ? formatCurrency(avgMonthlyGross) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avance / Retard</span>
                  <span className={`font-semibold ${isMonthlyAhead ? "text-success" : "text-danger"}`}>
                    {isMonthlyAhead ? "+" : ""}{formatCurrency(monthlyDelta)}
                  </span>
                </div>
                <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success transition-all duration-500 flex items-center justify-center rounded-full"
                    style={{ width: `${monthlyProgress}%` }}>
                    {monthlyProgress > 10 && <span className="text-xs font-bold text-success-foreground">{monthlyProgress.toFixed(0)}%</span>}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10"
                    onClick={() => { setMonthlyTarget(monthlyGoal.target_amount.toString()); setEditingMonthly(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <GoalForm label="Objectif mensuel moyen (€)" placeholder="Ex : 7 000" value={monthlyTarget} onChange={setMonthlyTarget}
                onSubmit={handleMonthly} editing={editingMonthly} btnClass="bg-gradient-success shadow-success"
                onCancel={() => { setMonthlyTarget(""); setEditingMonthly(false); }}
                onDelete={() => { if (monthlyGoal) { deleteGoal(monthlyGoal.id); setEditingMonthly(false); } }} />
            )}
          </CardContent>
        </Card>
      </div>

      <PodiumModal open={modal === "top-salaries"} onOpenChange={v => !v && setModal(null)} title={<><Trophy className="w-5 h-5 text-warning" /> Top 3 Salaires Bruts</>} rows={topSalaryRows} emptyMessage="Aucun bulletin avec données complètes." />
      <PodiumModal open={modal === "top-years"} onOpenChange={v => !v && setModal(null)} title={<><Target className="w-5 h-5 text-primary" /> Top 3 Années Record</>} rows={topYearRows} emptyMessage="Aucun bulletin avec données complètes." />
    </div>
  );
}