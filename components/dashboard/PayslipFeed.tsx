"use client";

import { useState, useMemo } from "react";
import { FileText, Edit, Trash2, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditPayslipModal } from "./EditPayslipModal";
import { usePayslips } from "@/hooks/usePayslips";
import { formatCurrency, formatPeriod, type Payslip } from "@/utils/salary";

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "completed") return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Traité</Badge>;
  if (status === "error") return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erreur</Badge>;
  return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
};

export function PayslipFeed() {
  const { payslips, loading, deletePayslip, downloadPayslip } = usePayslips();
  const [editing, setEditing] = useState<Payslip | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [year, setYear] = useState("all");

  const years = useMemo(() => [...new Set(payslips.map(p => p.period_year))].sort((a, b) => b - a), [payslips]);
  const filtered = useMemo(() => year === "all" ? payslips : payslips.filter(p => p.period_year === parseInt(year)), [payslips, year]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bulletin ? Cette action est irréversible.")) return;
    setDeleting(id);
    await deletePayslip(id);
    setDeleting(null);
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />)}
    </div>
  );

  if (payslips.length === 0) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Aucun bulletin</h3>
      <p className="text-muted-foreground text-sm">Uploadez votre premier bulletin pour commencer</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Vos bulletins</h2>
          <Badge variant="secondary">{filtered.length}</Badge>
        </div>
        {years.length > 0 && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Toutes années" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        {filtered.map(p => (
          <Card key={p.id} className="p-5 hover:shadow-glow transition-all">
            <div className="flex items-start gap-4">
              <button onClick={() => downloadPayslip(p)} className="p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </button>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{p.file_name}</h3>
                    <p className="text-sm text-muted-foreground">{formatPeriod(p.period_month, p.period_year)}</p>
                    {p.company_name && <p className="text-xs text-muted-foreground mt-0.5">{p.company_name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={p.processing_status} />
                    <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadPayslip(p)}><Download className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {(p.net_after_tax ?? p.net_salary) && p.gross_salary ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className="font-bold text-success">{formatCurrency(p.net_after_tax ?? p.net_salary)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Brut</p>
                      <p className="font-bold text-primary">{formatCurrency(p.gross_salary)}</p>
                    </div>
                    {p.charges != null && (
                      <div>
                        <p className="text-xs text-muted-foreground">Impôt / PAS</p>
                        <p className="font-bold text-muted-foreground">{formatCurrency(p.charges)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-border/50">
                    <button onClick={() => setEditing(p)} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> Saisir les données manuellement
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && <EditPayslipModal payslip={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}