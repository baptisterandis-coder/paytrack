import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Politique de confidentialité | paytrak",
  description: "Comment paytrak traite tes bulletins de paie et tes données personnelles.",
};

const H2 = "text-xl font-semibold text-foreground mt-10 mb-3";
const P = "text-muted-foreground leading-relaxed";
const UL = "list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed";

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Retour à l’accueil">
            <Logo className="h-7" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Politique de confidentialité</h1>
        <p className={P + " mt-3"}>Dernière mise à jour : 19 novembre 2026</p>

        <h2 className={H2}>Qui est responsable de tes données ?</h2>
        <p className={P}>
          Baptiste RANDIS, entrepreneur individuel, éditeur de paytrak.fr, est responsable du traitement.
          Contact pour toute question ou demande : contact@paytrak.fr.
        </p>

        <h2 className={H2}>Les données que nous traitons</h2>
        <ul className={UL}>
          <li>Ton compte : adresse e-mail et identifiants de connexion.</li>
          <li>Ton profil, si tu le renseignes : nom, date de naissance, poste, entreprise, région, secteur, statut, type de contrat.</li>
          <li>Tes bulletins de paie : le fichier PDF que tu déposes et les informations qui en sont extraites (période, salaire brut et net, cotisations, impôt, primes et lignes du bulletin).</li>
        </ul>

        <h2 className={H2}>Pourquoi et sur quelle base</h2>
        <p className={P}>
          Ces données servent uniquement à te fournir le service : suivre tes bulletins, calculer tes cumuls,
          tes objectifs et tes trophées, et t’afficher des analyses. La base légale est l’exécution du service
          que tu as demandé. Nous ne vendons pas tes données et ne les utilisons pas pour de la publicité.
        </p>

        <h2 className={H2}>Ton numéro de sécurité sociale (NIR)</h2>
        <p className={P}>
          Nous n’avons pas besoin de ton numéro de sécurité sociale. Lorsque tu déposes un PDF, son texte est lu
          directement dans ton navigateur et le numéro est masqué avant tout envoi à notre service d’analyse.
          Le fichier PDF d’origine, que tu peux retrouver dans ton espace, reste tel que ton employeur te l’a remis.
        </p>

        <h2 className={H2}>Lignes sensibles : ton consentement</h2>
        <p className={P}>
          Certaines lignes d’un bulletin peuvent révéler une appartenance syndicale ou un arrêt maladie. Ces
          informations relèvent de catégories particulières de données. Par défaut, paytrak les ignore : elles sont
          retirées du texte avant analyse. Si tu coches la case dédiée, tu autorises paytrak à les lire et à les
          conserver. Tu peux retirer ton consentement à tout moment dans ton profil : les lignes déjà conservées
          sont alors effacées. Refuser ne t’empêche pas d’utiliser paytrak.
        </p>

        <h2 className={H2}>Qui reçoit tes données (sous-traitants)</h2>
        <ul className={UL}>
          <li>Supabase : base de données, authentification et stockage des fichiers, hébergés dans l’Union européenne.</li>
          <li>Vercel : hébergement du site (États-Unis, avec clauses contractuelles types).</li>
          <li>Anthropic : analyse du texte du bulletin (numéro de sécurité sociale masqué) pour en extraire les montants. Anthropic ne conserve pas par défaut le contenu envoyé via son API et ne l’utilise pas pour entraîner ses modèles sans autorisation.</li>
        </ul>

        <h2 className={H2}>Durée de conservation</h2>
        <p className={P}>
          Tes données sont conservées tant que ton compte est actif. Si tu supprimes ton compte, elles sont
          effacées dans un délai de 30 jours.
        </p>

        <h2 className={H2}>Tes droits</h2>
        <p className={P}>
          Tu peux demander l’accès à tes données, leur rectification, leur effacement, leur portabilité, la
          limitation ou l’opposition à leur traitement, et retirer ton consentement à tout moment. Écris à
          contact@paytrak.fr : nous répondons dans un délai d’un mois. Si tu estimes que tes droits ne sont pas
          respectés, tu peux saisir la CNIL (cnil.fr).
        </p>

        <h2 className={H2}>Sécurité</h2>
        <p className={P}>
          Les échanges sont chiffrés (HTTPS), l’accès à tes données est réservé à ton compte et en cas de
          violation de données présentant un risque, nous préviendrons la CNIL dans les 72 heures et t’informerons
          si nécessaire.
        </p>
      </main>
    </div>
  );
}
