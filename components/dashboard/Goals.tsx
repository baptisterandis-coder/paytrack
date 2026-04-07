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
import { getTopGrossSalaries, getTopYears, getBestMonthPayslip, formatCurrency, formatPeriod, getMonthLong, resolveNetSalary } from "@/utils/salary";

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
  const currentYearPayslips = payslips.filter(p => p.period_year === currentYear);
  const totalGross = currentYearPayslips.reduce((s, p) => s + (p.gross_salary ?? 0), 0);
  const n = new Set(currentYearPayslips.map(p => p.period_month)).size;
  const proportional = annualGoal && n > 0 ? (annualGoal.target_amount / 12) * n : 0;
  const annualProgress = annualGoal && proportional > 0 ? (totalGross / proportional) * 100 : 0;
  const overallProgress = annualGoal ? (totalGross / annualGoal.target_amount) * 100 : 0;
  const bestMonth = getBestMonthPayslip(payslips);
  const bestMonthGross = bestMonth?.gross_salary ?? 0;
  const monthlyProgress = monthlyGoal ? Math.min((bestMonthGross / monthlyGoal.target_amount) * 100, 100) : 0;

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
                {[["Objectif annuel", formatCurrency(annualGoal.target_amount)], [`Attendu (${n} mois)`, formatCurrency(proportional)], ["Actuel", formatCurrency(totalGross)], ["Projection annuelle", n > 0 ? formatCurrency((totalGross / n) * 12) : "—"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-warning transition-all duration-500 flex items-center justify-center" style={{ width: `${Math.min(annualProgress, 100)}%` }}>
                    {annualProgress > 8 && <span className="text-xs font-bold text-warning-foreground">{annualProgress.toFixed(0)}%</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Progression globale : <strong className="text-foreground">{overallProgress.toFixed(0)}%</strong></span>
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
              <div className="flex items-center gap-2"><Target className="w-5 h-5 text-success" /><CardTitle>Objectif Mensuel Brut</CardTitle></div>
              <Button variant="ghost" size="icon" onClick={() => setModal("top-salaries")} className="text-warning hover:text-warning hover:bg-warning/10"><Trophy className="w-4 h-4" /></Button>
            </div>
            <CardDescription>Objectif brut mensuel</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyGoal && !editingMonthly ? (
              <div className="space-y-3">
                {[["Objectif", formatCurrency(monthlyGoal.target_amount)], ["Meilleur mois", formatCurrency(bestMonthGross)]].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span><span className="font-semibold">{v}</span>
                  </div>
                ))}
                {bestMonth && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{getMonthLong(bestMonth.period_month)} {bestMonth.period_year}</span>
                  </div>
                )}
                <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success transition-all duration-500 flex items-center justify-center" style={{ width: `${monthlyProgress}%` }}>
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
              <GoalForm label="Objectif mensuel (€)" placeholder="Ex : 4 500" value={monthlyTarget} onChange={setMonthlyTarget}
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