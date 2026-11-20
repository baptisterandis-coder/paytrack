import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Faq } from "@/components/Faq";

export const metadata: Metadata = {
  title: "Questions fréquentes | paytrak",
  description: "Sécurité des bulletins de paie, numéro de sécurité sociale, lignes sensibles, suppression du compte : les réponses à vos questions sur paytrak.",
  alternates: { canonical: "/faq" },
};

export default function PageFaq() {
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Questions fréquentes</h1>
        <p className="text-muted-foreground leading-relaxed mt-3 mb-8">
          Tout ce qu’il faut savoir sur la sécurité de tes bulletins de paie. Pour le détail juridique, consulte la{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
        </p>
        <Faq tout />
      </main>
    </div>
  );
}
