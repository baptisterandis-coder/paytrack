"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayslips } from "@/hooks/usePayslips";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export function ManualPayslipModal({ onClose }: { onClose: () => void }) {
  const { addManualPayslip } = usePayslips();
  const now = new Date();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    period_month: (now.getMonth() + 1).toString(),
    period_year: now.getFullYear().toString(),
    company_name: "",
    gross_salary: "",
    net_salary: "",
    charges: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const gross = parseFloat(form.gross_salary);
    const net = parseFloat(form.net_salary);
    if (isNaN(gross) || isNaN(net)) {
      setError("Le salaire brut et le salaire net sont obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await addManualPayslip({
        month: parseInt(form.period_month),
        year: parseInt(form.period_year),
        company: form.company_name || null,
        gross,
        net,
        tax: form.charges ? parseFloat(form.charges) : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Saisie manuelle d'un bulletin</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input type="number" value={form.period_year} onChange={set("period_year")} min="2000" max="2099" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Entreprise</Label>
            <Input value={form.company_name} onChange={set("company_name")} placeholder="Nom de l'entreprise (optionnel)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Salaire Brut (€)</Label>
              <Input type="number" step="0.01" value={form.gross_salary} onChange={set("gross_salary")} placeholder="4500" required />
            </div>
            <div className="space-y-1.5">
              <Label>Salaire Net (€)</Label>
              <Input type="number" step="0.01" value={form.net_salary} onChange={set("net_salary")} placeholder="3500" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Impôt / PAS (€)</Label>
            <Input type="number" step="0.01" value={form.charges} onChange={set("charges")} placeholder="250 (optionnel)" />
          </div>
          {error && <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Enregistrement…" : "Ajouter le bulletin"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
