"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Lien vers l’espace connecté ou vers la connexion.
// Le serveur donne une première réponse, puis le navigateur confirme la session (et la renouvelle si besoin).
export function LienEspace({
  className,
  connecteServeur,
  texte,
  texteConnecte,
  children,
}: {
  className?: string;
  connecteServeur: boolean;
  texte?: string;
  texteConnecte?: string;
  children?: React.ReactNode;
}) {
  const [connecte, setConnecte] = useState(connecteServeur);

  useEffect(() => {
    let actif = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (actif) setConnecte(!!data.session);
      })
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, []);

  return (
    <Link href={connecte ? "/dashboard" : "/auth"} className={className}>
      {children ?? (connecte ? texteConnecte ?? texte : texte)}
    </Link>
  );
}
