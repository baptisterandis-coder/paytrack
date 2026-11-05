"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Dans l’appli installée (PWA), un utilisateur connecté arrive directement sur son tableau de bord.
// Sur le site, la page d’accueil reste visible pour tout le monde.
export function RedirectionAppInstallee({ connecte }: { connecte: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!connecte) return;
    const installee =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installee) router.replace("/dashboard");
  }, [connecte, router]);

  return null;
}
