import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Euro, Lock, MapPin, BookOpen, Sparkles, Trophy, TrendingUp, Upload, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "paytrak — Ta carrière, bulletin après bulletin",
  description:
    "Suis l'évolution de ton salaire, compare-la à l'inflation et comprends chaque ligne de ta fiche de paie.",
};

const ETAPES = [
  {
    icon: Upload,
    titre: "Ajoute tes fiches de paie",
    texte:
      "Glisse tes bulletins en PDF. paytrak lit le brut, le net, l'impôt et chaque ligne de cotisation, sans rien à saisir. L'analyse prend environ 25 secondes par bulletin.",
  },
  {
    icon: TrendingUp,
    titre: "Suis ta progression",
    texte:
      "Évolution mois par mois, comparaison avec l'année précédente, croissance annuelle moyenne, objectifs à atteindre et trophées à débloquer.",
  },
  {
    icon: BookOpen,
    titre: "Comprends ta paie",
    texte:
      "Chaque ligne de ton bulletin expliquée en français simple, avec tes montants réels et leur cumul sur l'ensemble de tes bulletins.",
  },
];

const ATOUTS = [
  {
    icon: Wallet,
    titre: "Ton pouvoir d'achat réel",
    texte:
      "Ton salaire a-t-il progressé plus vite que les prix ? paytrak compare ton évolution à l'inflation officielle (Eurostat).",
  },
  {
    icon: Sparkles,
    titre: "Un commentaire à chaque bulletin",
    texte: "À chaque nouveau bulletin, un résumé des écarts avec le mois précédent : brut, net et impôt.",
  },
  {
    icon: Trophy,
    titre: "Objectifs et trophées",
    texte: "Fixe-toi un objectif annuel ou mensuel, et débloque des trophées au fil de ta carrière.",
  },
  {
    icon: Euro,
    titre: "Les repères du moment",
    texte: "SMIC, inflation, chômage, Livret A et salaire médian, toujours sous les yeux.",
  },
];

const GARANTIES = [
  {
    icon: MapPin,
    texte: "Tes bulletins sont stockés dans un espace privé, hébergé dans l'Union européenne (Suède).",
  },
  {
    icon: Lock,
    texte: "Chaque compte ne voit que ses propres données : l'accès est cloisonné par utilisateur.",
  },
  {
    icon: Sparkles,
    texte: "Pour lire un bulletin, paytrak l'envoie à une IA (Claude, d'Anthropic) au moment où tu l'ajoutes.",
  },
];

const BOUTON_PRINCIPAL =
  "bg-gradient-primary shadow-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Un utilisateur déjà connecté (y compris depuis l'appli installée) va directement à son tableau de bord.
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" aria-label="paytrak, accueil">
            <Logo className="h-9" />
          </Link>
          <Link href="/auth" className={BOUTON_PRINCIPAL + " text-sm px-5 py-2.5"}>
            Connexion
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative max-w-3xl mx-auto px-5 pt-20 pb-24 text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              {"Ta carrière, bulletin après bulletin"}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {
                "paytrak suit l'évolution de ton salaire, te montre ce que tu gagnes vraiment une fois l'inflation déduite, et t'explique chaque ligne de ta fiche de paie."
              }
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className={BOUTON_PRINCIPAL + " px-8 py-3.5"}>
                Se connecter
              </Link>
              <a
                href="#fonctionnement"
                className="border border-border text-foreground font-medium rounded-xl px-8 py-3.5 hover:bg-secondary/60 transition-colors"
              >
                {"Voir comment ça marche"}
              </a>
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-center">{"Comment ça marche"}</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ETAPES.map((etape, i) => (
              <div key={etape.titre} className="bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <etape.icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">{"Étape " + (i + 1)}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{etape.titre}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{etape.texte}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-center">{"Ce que tu y trouves"}</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {ATOUTS.map((atout) => (
              <div key={atout.titre} className="bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <atout.icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{atout.titre}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{atout.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="donnees" className="bg-secondary/30 border-y border-border/40">
          <div className="max-w-3xl mx-auto px-5 py-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-center">{"Tes fiches de paie sont sensibles"}</h2>
            <p className="mt-4 text-center text-muted-foreground">{"Voici ce que l'on peut affirmer, et rien de plus."}</p>
            <ul className="mt-10 space-y-4">
              {GARANTIES.map((g) => (
                <li key={g.texte} className="flex gap-4 items-start">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <g.icon className="w-5 h-5" />
                  </span>
                  <p className="text-foreground/90 leading-relaxed pt-2">{g.texte}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold">{"Prêt à voir ta carrière en courbes ?"}</h2>
          <div className="mt-8">
            <Link href="/auth" className={BOUTON_PRINCIPAL + " inline-block px-8 py-3.5"}>
              Se connecter
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-5 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <Logo className="h-7" />
          <span>{"© 2026 paytrak"}</span>
        </div>
      </footer>
    </div>
  );
}
