"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const JOURS = 30;

// Suppression du compte : le compte est ferme tout de suite, les donnees sont effacees
// definitivement apres 30 jours (purge automatique). Pendant ce delai, on peut annuler.
export default function SuppressionCompte() {
  const { profile, saveProfile } = useProfile();
  const [confirme, setConfirme] = useState(false);
  const [busy, setBusy] = useState(false);

  const demande = profile?.deletion_requested_at ? new Date(profile.deletion_requested_at) : null;
  const dateFin = demande ? new Date(demande.getTime() + JOURS * 86400000) : null;

  const supprimer = async () => {
    setBusy(true);
    await saveProfile({ deletion_requested_at: new Date().toISOString() });
    await createClient().auth.signOut();
    window.location.href = "/";
  };

  const annuler = async () => {
    setBusy(true);
    await saveProfile({ deletion_requested_at: null });
    setBusy(false);
  };

  if (demande && dateFin) {
    return (
      <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Suppression de ton compte prévue</p>
        <p>
          Tes données seront effacées définitivement le {dateFin.toLocaleDateString("fr-FR")}. Tu peux encore annuler.
        </p>
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={annuler}>
          Annuler la suppression
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-2">
      <p className="font-medium text-foreground">Supprimer mon compte</p>
      {!confirme ? (
        <>
          <p>Ton compte est fermé immédiatement et toutes tes données (profil, bulletins, PDF, objectifs) sont effacées définitivement après {JOURS} jours.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirme(true)}>
            Supprimer mon compte
          </Button>
        </>
      ) : (
        <>
          <p className="text-foreground">Confirmer ? Tu seras déconnecté. Tu pourras annuler en te reconnectant dans les {JOURS} jours.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setConfirme(false)}>
              Non, garder mon compte
            </Button>
            <Button type="button" size="sm" disabled={busy} onClick={supprimer}>
              {busy ? "Suppression…" : "Oui, supprimer"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
