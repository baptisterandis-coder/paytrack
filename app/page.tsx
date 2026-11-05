import type { Metadata } from "next";
import Link from "next/link";
import { Lock, MapPin, Sparkles, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { RedirectionAppInstallee } from "@/components/RedirectionAppInstallee";
import { CarrouselComprends } from "@/components/CarrouselComprends";

export const metadata: Metadata = {
  title: "paytrak — Comprends. Suis. Progresse.",
  description:
    "Ta fiche de paie enfin lisible, ton vrai gain une fois l'inflation déduite, tes records à battre.",
};

const BOUTON_PRINCIPAL =
  "bg-gradient-primary shadow-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity";
const CARTE = "bg-gradient-card border border-border/50 rounded-2xl shadow-card";
const SECTION = "max-w-6xl mx-auto px-5 py-10 md:py-14";
const GRILLE = "grid md:grid-cols-2 gap-6 md:gap-10 items-center";

const LIGNES_EXEMPLES = ["CSG déductible", "Retraite complémentaire", "Prévoyance", "Net social"];
const TROPHEES = ["Premier 5K", "24 mois sans trou", "100 000 € cumulés"];

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

function Etiquette({ numero, verbe }: { numero: string; verbe: string }) {
  return (
    <p className="text-sm font-bold tracking-widest uppercase text-primary mb-3">{numero + " · " + verbe}</p>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
const espace = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RedirectionAppInstallee connecte={!!user} />
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" aria-label="paytrak, accueil">
            <Logo className="h-10 sm:h-11" />
          </Link>
          <Link href={espace} className={BOUTON_PRINCIPAL + " text-sm px-5 py-2.5"}>
            {user ? "Mon espace" : "Connexion"}
          </Link>
        </div>
      </header>

      <main>
        <section className="relative bg-[radial-gradient(ellipse_at_top,rgba(240,96,30,0.14),transparent_65%)]">
          <div className="max-w-3xl mx-auto px-5 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="block">Comprends.</span>
              <span className="block">Suis.</span>
              <span className="block text-primary">Progresse.</span>
            </h1>
            <p className="mt-8 text-xl sm:text-2xl font-semibold text-foreground leading-snug">
              {"Ta fiche de paie mérite mieux qu’un PDF oublié dans un dossier."}
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {"paytrak la lit, l’explique, la range, et transforme ta carrière en courbe de progression, avec des trophées à débloquer et des records à battre."}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={espace} className={BOUTON_PRINCIPAL + " px-8 py-3.5"}>
                Voir ma progression
              </Link>
              <a
                href="#formules"
                className="border border-border text-foreground font-medium rounded-xl px-8 py-3.5 hover:bg-secondary/60 transition-colors"
              >
                {"Commencer gratuitement"}
              </a>
            </div>
          </div>
        </section>

        <section id="fonctionnement" className={SECTION}>
          <div className={GRILLE}>
            <div>
              <Etiquette numero="01" verbe="Comprends" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{"Ta fiche de paie n’aura plus aucun secret pour toi."}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {
                  "Avec paytrak, tu as un contrôleur à chaque bulletin. Chaque ligne est expliquée avec tes montants et tes cumuls, chaque écart avec le mois précédent est relevé, et tout ce qui mérite d’être vérifié est signalé."
                }
              </p>
            </div>
            <CarrouselComprends />
          </div>
        </section>

        <section className={SECTION}>
          <div className={GRILLE}>
            <div>
              <Etiquette numero="02" verbe="Suis" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{"Toute ta carrière en une seule courbe"}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {
                  "Chaque bulletin que tu déposes est rangé dans ton espace privé, en Europe, et vient prolonger ta courbe. Plus besoin de fouiller tes mails : tout ton historique est là, téléchargeable quand tu veux."
                }
              </p>
            </div>
            <div className={CARTE + " p-6"}>
              <p className="text-xs text-muted-foreground mb-4">{"Exemple · profil de démonstration"}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{"Bulletins rangés"}</span>
                  <span className="font-semibold">{"68"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{"Premier bulletin"}</span>
                  <span className="font-semibold">{"2021"}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-baseline justify-between">
                <span className="font-medium">{"Ton net depuis 2021"}</span>
                <span className="text-4xl font-extrabold text-primary">{"+67 %"}</span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                {
                  "Ta courbe se met à jour à chaque nouveau bulletin, avec la comparaison au mois précédent."
                }
              </p>
            </div>
          </div>
        </section>

        <section className={SECTION}>
          <div className={GRILLE}>
            <div>
              <Etiquette numero="03" verbe="Progresse" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{"Chaque palier se célèbre"}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {
                  "Fixe-toi un objectif annuel ou mensuel, suis ton avance, et débloque des trophées au fil de ta carrière."
                }
              </p>
            </div>
            <div className={CARTE + " p-6"}>
              <p className="text-xs text-muted-foreground mb-4">{"Exemple · profil de démonstration"}</p>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>{"Objectif annuel 2026"}</span>
                  <span className="font-semibold">{"70 %"}</span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[70%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{"45 500 € sur 65 000 € bruts"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TROPHEES.map((trophee) => (
                  <span
                    key={trophee}
                    className="text-xs rounded-full px-3 py-1.5 bg-primary/20 text-primary inline-flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {trophee}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="formules" className={SECTION}>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{"Choisis ton niveau"}</h2>
            <p className="mt-3 text-muted-foreground">{"Commence gratuitement. L’abonnement arrive bientôt."}</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className={CARTE + " p-6 border-primary/60 flex flex-col"}>
              <p className="text-xs font-semibold tracking-widest text-primary">{"GRATUIT"}</p>
              <h3 className="mt-2 text-2xl font-bold">{"Découverte"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{"La version limitée pour démarrer."}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                <li>{"Tes bulletins rangés au même endroit"}</li>
                <li>{"Lecture et explication de tes lignes"}</li>
                <li>{"Courbe de progression"}</li>
                <li>{"Objectifs et trophées"}</li>
              </ul>
              <Link href={espace} className={BOUTON_PRINCIPAL + " mt-6 px-6 py-3 text-center"}>
                {"Commencer gratuitement"}
              </Link>
            </div>
            <div className={CARTE + " p-6 flex flex-col"}>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground">{"BIENTÔT"}</p>
              <h3 className="mt-2 text-2xl font-bold">{"Premium"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{"Au mois ou à l’année, au choix."}</p>
              <p className="mt-4 text-sm text-muted-foreground flex-1">{"Toute la puissance de paytrak, sans limite. Tarifs et détails à venir."}</p>
            </div>
          </div>
        </section>

        <section id="donnees" className="bg-secondary/30 border-y border-border/40">
          <div className="max-w-3xl mx-auto px-5 py-10">
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

        <section className="max-w-3xl mx-auto px-5 py-12 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold">{"Ta carrière mérite mieux qu'un dossier de PDF"}</h2>
          <div className="mt-8">
            <Link href={espace} className={BOUTON_PRINCIPAL + " inline-block px-8 py-3.5"}>
              Voir ma progression
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
