"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayslips } from "@/hooks/usePayslips";
import type { Payslip } from "@/utils/salary";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export function EditPayslipModal({ payslip, onClose }: { payslip: Payslip; onClose: () => void }) {
  const { updatePayslip } = usePayslips();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    file_name: payslip.file_name,
    period_month: payslip.period_month.toString(),
    period_year: payslip.period_year.toString(),
    company_name: payslip.company_name ?? "",
    gross_salary: payslip.gross_salary?.toString() ?? "",
    net_salary: payslip.net_salary?.toString() ?? "",
    charges: payslip.charges?.toString() ?? "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updatePayslip(payslip.id, {
      file_name: form.file_name,
      period_month: parseInt(form.period_month),
      period_year: parseInt(form.period_year),
      company_name: form.company_name || null,
      gross_salary: parseFloat(form.gross_salary) || null,
      net_salary: parseFloat(form.net_salary) || null,
      net_after_tax: parseFloat(form.net_salary) || null,
      charges: parseFloat(form.charges) || null,
    });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Éditer le bulletin</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titre du bulletin</Label>
            <Input value={form.file_name} onChange={set("file_name")} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mois</Label>
              <select value={form.period_month} onChange={set("period_month")}
                className="w-full h-10 rounded-xl border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Année</Label>
              <Input type="number" value={form.period_year} onChange={set("period_year")} min="2000" max="2099" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Entreprise</Label>
            <Input value={form.company_name} onChange={set("company_name")} placeholder="Nom de l'entreprise" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Salaire Brut (€)</Label>
              <Input type="number" step="0.01" value={form.gross_salary} onChange={set("gross_salary")} placeholder="4500" />
            </div>
            <div className="space-y-1.5">
              <Label>Salaire Net (€)</Label>
              <Input type="number" step="0.01" value={form.net_salary} onChange={set("net_salary")} placeholder="3500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Impôt / PAS (€)</Label>
            <Input type="number" step="0.01" value={form.charges} onChange={set("charges")} placeholder="250" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Sauvegarde…" : "Sauvegarder"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}