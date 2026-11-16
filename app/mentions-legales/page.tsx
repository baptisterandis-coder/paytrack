import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Mentions légales | paytrak",
  description: "Mentions légales du site paytrak.fr.",
};

const H2 = "text-xl font-semibold text-foreground mt-10 mb-3";
const P = "text-muted-foreground leading-relaxed";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Retour &agrave; l&rsquo;accueil">
            <Logo className="h-7" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Mentions l&eacute;gales</h1>
        <p className={P + " mt-3"}>Derni&egrave;re mise &agrave; jour : 16 novembre 2026</p>

        <h2 className={H2}>&Eacute;diteur du site</h2>
        <p className={P}>
          Le site paytrak.fr est &eacute;dit&eacute; par Baptiste RANDIS, entrepreneur individuel.
          <br />
          SIREN : 890&nbsp;181&nbsp;258 &middot; SIRET : 890&nbsp;181&nbsp;258&nbsp;00033
          <br />
          Code APE : 62.01Z (programmation informatique)
          <br />
          Localisation : 59263 Houplin-Ancoisne, France
          <br />
          Contact : <a className="text-primary hover:underline" href="mailto:contact@paytrak.fr">contact@paytrak.fr</a>
        </p>

        <h2 className={H2}>Directeur de la publication</h2>
        <p className={P}>Baptiste RANDIS.</p>

        <h2 className={H2}>H&eacute;bergement</h2>
        <p className={P}>
          Le site est h&eacute;berg&eacute; par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis (vercel.com).
        </p>
        <p className={P + " mt-3"}>
          Les comptes utilisateurs, les donn&eacute;es et les bulletins de paie d&eacute;pos&eacute;s sont stock&eacute;s chez Supabase, sur des serveurs situ&eacute;s en Europe (Su&egrave;de) (supabase.com).
        </p>

        <h2 className={H2}>Propri&eacute;t&eacute; intellectuelle</h2>
        <p className={P}>
          La marque paytrak, le logo, les textes, les visuels et l&rsquo;ensemble des contenus du site sont la propri&eacute;t&eacute; de l&rsquo;&eacute;diteur. Toute reproduction, m&ecirc;me partielle, sans autorisation &eacute;crite pr&eacute;alable est interdite.
        </p>

        <h2 className={H2}>Nature du service</h2>
        <p className={P}>
          paytrak est un outil de suivi et de lecture de bulletins de paie. Les informations affich&eacute;es sont fournies &agrave; titre indicatif et ne remplacent pas ton bulletin de paie officiel, ni l&rsquo;avis d&rsquo;un professionnel du droit social ou de la comptabilit&eacute;.
        </p>

        <h2 className={H2}>Donn&eacute;es personnelles</h2>
        <p className={P}>
          Pour toute question sur tes donn&eacute;es ou pour exercer tes droits (acc&egrave;s, rectification, suppression), &eacute;cris &agrave; <a className="text-primary hover:underline" href="mailto:contact@paytrak.fr">contact@paytrak.fr</a>.
        </p>
      </main>
    </div>
  );
}
