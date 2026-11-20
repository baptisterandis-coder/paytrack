import Link from "next/link";
import { ChevronDown } from "lucide-react";

const QUESTIONS: { q: string; r: string }[] = [
  {
    q: "Mes bulletins de paie sont-ils en sécurité ?",
    r: "Tes bulletins sont stockés dans ton espace privé, accessible uniquement avec ton compte. Les échanges sont chiffrés et les données sont hébergées dans l’Union européenne. Nous ne vendons pas tes données.",
  },
  {
    q: "Comment fonctionne l’analyse de mon bulletin ?",
    r: "Quand tu déposes un PDF, son texte est lu directement dans ton navigateur, puis envoyé à un service d’analyse pour en extraire les montants (brut, net, impôt, cotisations). Tu peux toujours corriger ou compléter les valeurs à la main.",
  },
  {
    q: "Mon numéro de sécurité sociale est-il transmis ?",
    r: "Non. Il est masqué dans ton navigateur avant tout envoi pour analyse. Nous n’en avons pas besoin.",
  },
  {
    q: "Qui voit mes données de paie ?",
    r: "Toi seul. Ton employeur n’y a pas accès et paytrak n’est relié à aucun système d’entreprise. Seuls nos prestataires techniques (hébergement, analyse) traitent les données pour faire fonctionner le service.",
  },
  {
    q: "Que sont les « lignes sensibles », et suis-je obligé de les partager ?",
    r: "Certaines lignes d’un bulletin peuvent révéler une appartenance syndicale ou un arrêt maladie. Par défaut, paytrak les ignore. Tu peux les autoriser dans ton profil, et retirer ton accord quand tu veux : les lignes déjà conservées sont alors effacées.",
  },
  {
    q: "Puis-je déposer une photo ou un scan de mon bulletin ?",
    r: "L’analyse automatique fonctionne avec le PDF d’origine fourni par ton employeur. Pour une photo ou un scan, tu peux saisir les montants à la main.",
  },
  {
    q: "Comment supprimer mon compte et mes données ?",
    r: "Dans ton profil, bouton « Supprimer mon compte ». Ton compte est fermé tout de suite, tu peux annuler pendant 30 jours, puis tout est effacé définitivement : profil, bulletins, PDF et objectifs.",
  },
  {
    q: "Quelles données paytrak conserve-t-il ?",
    r: "Ton adresse e-mail, ton profil si tu le renseignes, tes bulletins et les informations qui en sont extraites. Le détail est dans la politique de confidentialité.",
  },
];

// Accueil : les 4 premières questions + lien. Page /faq : toutes les questions (tout).
export function Faq({ tout = false }: { tout?: boolean }) {
  const liste = tout ? QUESTIONS : QUESTIONS.slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: liste.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.r },
    })),
  };

  return (
    <section id="faq" className={tout ? "" : "max-w-3xl mx-auto px-5 py-8 md:py-10"}>
      {!tout && <h2 className="text-3xl font-bold tracking-tight text-center">Questions fréquentes</h2>}
      <div className={(tout ? "" : "mt-6 ") + "space-y-2"}>
        {liste.map((x) => (
          <details key={x.q} className="group rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-foreground">
              {x.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-[15px] leading-normal text-muted-foreground">{x.r}</p>
          </details>
        ))}
      </div>
      {!tout && (
        <p className="mt-5 text-center">
          <Link href="/faq" className="text-sm text-primary hover:underline">Toutes les questions</Link>
        </p>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
