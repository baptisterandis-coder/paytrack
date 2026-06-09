"use client";

import { useState, useMemo, useRef } from "react";
import { FileText, Edit, Trash2, Download, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Upload, FileSpreadsheet, PlusCircle, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditPayslipModal } from "./EditPayslipModal";
import { ManualPayslipModal } from "./ManualPayslipModal";
import { usePayslips } from "@/hooks/usePayslips";
import { formatCurrency, formatPeriod, type Payslip } from "@/utils/salary";
import * as XLSX from "xlsx";

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "completed") return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Traité</Badge>;
  if (status === "error") return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erreur</Badge>;
  return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
};

function AiComment({ comment }: { comment: string }) {
  const [open, setOpen] = useState(false);
  const lines = comment.split("\n").map(l => l.trim()).filter(Boolean);
  const clean = (s: string) => s.replace(/\*\*(.*?)\*\*/g, "$1");

  return (
    <div className="pt-3 border-t border-border/50">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm text-primary hover:underline">
        💡 Insights
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="mt-3 p-4 bg-muted/20 rounded-xl text-sm space-y-0.5">
          {lines.map((line, i) => {
            // Titre de section (texte en **gras**, pas une puce)
            if (/\*\*(.+?)\*\*/.test(line) && !line.startsWith("-")) {
              return <p key={i} className="font-semibold text-foreground mt-3 first:mt-0">{clean(line)}</p>;
            }
            // Élément variable : "- Libellé : montant"
            if (line.startsWith("-") || line.startsWith("•")) {
              const item = clean(line.replace(/^[-•]\s*/, ""));
              const sep = item.lastIndexOf(" : ");
              if (sep !== -1) {
                const label = item.slice(0, sep);
                const value = item.slice(sep + 3);
                const color = /\+/.test(value) ? "text-success" : /[-−]/.test(value) ? "text-danger" : "text-foreground";
                return (
                  <div key={i} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-semibold whitespace-nowrap ${color}`}>{value}</span>
                  </div>
                );
              }
              return <div key={i} className="text-muted-foreground py-1">• {item}</div>;
            }
            // Ligne normale (ex. ligne de résumé)
            return <p key={i} className="text-muted-foreground leading-relaxed">{clean(line)}</p>;
          })}
        </div>
      )}
    </div>
  );
}

const TEMPLATE_HEADERS = ["Mois (1-12)", "Année", "Entreprise", "Salaire Brut (€)", "Salaire Net (€)", "Impôt / PAS (€)"];
const TEMPLATE_EXAMPLE: (string | number)[][] = [
  [1, 2025, "Entreprise Exemple", 3000, 2350, 250],
  [2, 2025, "Entreprise Exemple", 3000, 2350, 250],
  [3, 2025, "Entreprise Exemple", 4500, 3450, 380],
  [4, 2025, "Entreprise Exemple", 3100, 2420, 260],
];

async function resizeImage(file: File, maxDim = 2000, quality = 0.85): Promise<File> {
  try {
    const img = await createImageBitmap(file);
    let width = img.width;
    let height = img.height;
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", quality));
    return blob ? new File([blob], `Scan ${new Date().toLocaleDateString("fr-FR")}.jpg`, { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function PayslipFeed() {
  const { payslips, loading, deletePayslip, downloadPayslip, importFromExcel, uploadPayslip } = usePayslips();
  const [editing, setEditing] = useState<Payslip | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [year, setYear] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const years = useMemo(() => [...new Set(payslips.map(p => p.period_year))].sort((a, b) => b - a), [payslips]);
  const filtered = useMemo(() => year === "all" ? payslips : payslips.filter(p => p.period_year === parseInt(year)), [payslips, year]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bulletin ? Cette action est irréversible.")) return;
    setDeleting(id);
    await deletePayslip(id);
    setDeleting(null);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLE]);
    ws["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bulletins");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paytrack_modele.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseAndImport = async (rows: any[][]) => {
    const dataRows = rows.slice(1).filter(row => row[0] && row[1] && row[3] && row[4]);
    if (dataRows.length === 0) {
      setImportResult("❌ Aucune donnée valide trouvée dans le fichier.");
      return;
    }
    let success = 0;
    let errors = 0;
    for (const row of dataRows) {
      const month = parseInt(row[0]);
      const yr = parseInt(row[1]);
      const company = row[2] ? String(row[2]) : null;
      const gross = parseFloat(row[3]);
      const net = parseFloat(row[4]);
      const tax = row[5] ? parseFloat(row[5]) : null;
      if (month < 1 || month > 12 || yr < 2000 || isNaN(gross) || isNaN(net)) {
        errors++;
        continue;
      }
      try {
        await importFromExcel({ month, year: yr, company, gross, net, tax });
        success++;
      } catch {
        errors++;
      }
    }
    setImportResult(`✅ ${success} bulletin${success > 1 ? "s" : ""} importé${success > 1 ? "s" : ""} avec succès${errors > 0 ? ` · ❌ ${errors} erreur${errors > 1 ? "s" : ""}` : ""}.`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const buffer = await file.arrayBuffer();
      if (file.name.endsWith(".csv")) {
        const text = new TextDecoder("utf-8").decode(buffer);
        const rows = text.split("\n").filter(l => l.trim()).map(l => l.split(",").map(v => v.trim()));
        await parseAndImport(rows);
      } else {
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        await parseAndImport(rows);
      }
    } catch {
      setImportResult("❌ Erreur lors de la lecture du fichier.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setImportResult(null);
    try {
      const img = await resizeImage(file);
      await uploadPayslip(img);
      setImportResult("📸 Bulletin scanné ! Complétez les données via « Saisir les données manuellement » sur la carte.");
    } catch {
      setImportResult("❌ Échec du scan.");
    } finally {
      setScanning(false);
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Vos bulletins</h2>
          <Badge variant="secondary">{filtered.length}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setManualOpen(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Saisie manuelle</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => scanInputRef.current?.click()} disabled={scanning} className="gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{scanning ? "Scan..." : "Scanner"}</span>
          </Button>
          <input ref={scanInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <FileSpreadsheet className="w-4 h-4 text-success" />
            <span className="hidden sm:inline">Modèle Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing} className="gap-2">
            <Upload className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{importing ? "Import..." : "Importer Excel"}</span>
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
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
      </div>

      {importResult && (
        <div className="p-3 bg-muted/20 rounded-xl text-sm text-foreground border border-border/50">
          {importResult}
        </div>
      )}

      {payslips.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Aucun bulletin</h3>
          <p className="text-muted-foreground text-sm mb-4">Ajoutez votre premier bulletin : saisissez-le à la main ou importez un fichier Excel.</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button onClick={() => setManualOpen(true)} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Saisie manuelle
            </Button>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <FileSpreadsheet className="w-4 h-4 text-success" />
              Modèle Excel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <Card key={p.id} className="p-5 hover:shadow-glow transition-all">
              <div className="flex items-start gap-4">
                <button onClick={() => downloadPayslip(p)} className="p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </button>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground capitalize">{formatPeriod(p.period_month, p.period_year)}</h3>
                      {p.company_name && <p className="text-sm text-muted-foreground truncate">{p.company_name}</p>}
                      <p className="text-xs text-muted-foreground/70 truncate" title={p.file_name}>{p.file_name}</p>
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
                  {p.ai_comment && <AiComment comment={p.ai_comment} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <EditPayslipModal payslip={editing} onClose={() => setEditing(null)} />}
      {manualOpen && <ManualPayslipModal onClose={() => setManualOpen(false)} />}
    </div>
  );
}