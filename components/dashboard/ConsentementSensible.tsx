"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { retirerLignesSensibles } from "@/lib/lignesSensibles";

// Consentement explicite pour les lignes de bulletin pouvant reveler une appartenance
// syndicale ou un arret maladie. Refuse par defaut : ces lignes sont alors ignorees.
export default function ConsentementSensible() {
  const { profile, saveProfile } = useProfile();
  const [busy, setBusy] = useState(false);
  const actif = !!profile?.sensitive_consent;

  const changer = async (valeur: boolean) => {
    setBusy(true);
    try {
      await saveProfile({ sensitive_consent: valeur, sensitive_consent_at: new Date().toISOString() });
      if (!valeur) {
        // Retrait : on efface les lignes sensibles deja conservees.
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("payslips").select("id, lignes").eq("user_id", user.id);
          for (const p of data ?? []) {
            if (!Array.isArray(p.lignes)) continue;
            const gardees = p.lignes.filter((l: unknown) => retirerLignesSensibles(JSON.stringify(l)) !== "");
            if (gardees.length !== p.lignes.length) {
              await supabase.from("payslips").update({ lignes: gardees }).eq("id", p.id);
            }
          }
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground cursor-pointer">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        checked={actif}
        disabled={busy}
        onChange={(e) => changer(e.target.checked)}
      />
      <span>
        <span className="block font-medium text-foreground">Lignes sensibles de mon bulletin</span>
        J’accepte que paytrak lise et conserve les lignes de mon bulletin qui peuvent révéler une appartenance syndicale ou un arrêt maladie. Sans cette autorisation, ces lignes sont ignorées. Je peux changer d’avis à tout moment : le retrait efface les lignes déjà conservées.
      </span>
    </label>
  );
}
