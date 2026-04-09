"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { User, Briefcase, Calendar, Building } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const CONTRACT_TYPES = ["CDI", "CDD", "Freelance", "Autre"];

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile, saveProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    job_title: "",
    company: "",
    contract_type: "CDI",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        birth_date: profile.birth_date ?? "",
        job_title: profile.job_title ?? "",
        company: profile.company ?? "",
        contract_type: profile.contract_type ?? "CDI",
      });
    }
  }, [profile]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveProfile(form);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> Mon Profil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Nom complet
            </Label>
            <Input value={form.full_name} onChange={set("full_name")} placeholder="Baptiste Randis" />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Date de naissance
            </Label>
            <Input type="date" value={form.birth_date} onChange={set("birth_date")} />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" /> Poste / Métier
            </Label>
            <Input value={form.job_title} onChange={set("job_title")} placeholder="Directeur Commercial" />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" /> Entreprise actuelle
            </Label>
            <Input value={form.company} onChange={set("company")} placeholder="Nom de l'entreprise" />
          </div>

          <div className="space-y-1.5">
            <Label>Type de contrat</Label>
            <select value={form.contract_type} onChange={set("contract_type")}
              className="w-full h-10 rounded-xl border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Sauvegarde…" : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}