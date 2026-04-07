"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { usePayslips } from "@/hooks/usePayslips";

export function UploadPayslip() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadPayslip } = usePayslips();

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    const valid = Array.from(selected).filter(f => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024);
    setFiles(prev => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress({ current: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadPayslip(files[i]);
        setProgress({ current: i + 1, total: files.length });
      }
      setDone(true);
      setTimeout(() => { setOpen(false); setFiles([]); setDone(false); }, 1500);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => { setFiles([]); setDone(false); setProgress({ current: 0, total: 0 }); };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="w-4 h-4" />
        Ajouter un bulletin
      </Button>

      <Dialog open={open} onOpenChange={v => { if (!uploading) { setOpen(v); if (!v) reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle><FileText className="w-5 h-5" /> Ajouter un bulletin de paie</DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-14 h-14 text-success mx-auto mb-3" />
              <p className="font-semibold text-foreground">Bulletins ajoutés !</p>
              <p className="text-sm text-muted-foreground mt-1">Les données seront à saisir manuellement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Glissez vos fichiers ici ou <span className="text-primary">parcourir</span></p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10 MB</p>
                <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </div>

              {files.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{files.length} fichier(s)</span>
                    <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Tout supprimer</button>
                  </div>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-xl p-3">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Upload en cours…</span>
                    <span>{progress.current}/{progress.total}</span>
                  </div>
                  <Progress value={(progress.current / progress.total) * 100} />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading} className="flex-1">Annuler</Button>
                <Button onClick={handleUpload} disabled={!files.length || uploading} className="flex-1">
                  {uploading ? "Upload…" : `Uploader (${files.length})`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}