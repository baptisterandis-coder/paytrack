"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Dans l’appli installée (PWA), un utilisateur connecté arrive directement sur son tableau de bord.
// Sur le site, la page d’accueil reste visible pour tout le monde.
export function RedirectionAppInstallee(_props: { connecte?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const installee =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!installee) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  return null;
}
