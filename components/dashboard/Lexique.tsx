"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePayslips } from "@/hooks/usePayslips";
import { FAMILLES, LEXIQUE, type FicheLexique } from "@/utils/lexique";
import { formatCurrency, formatPeriod, resolveNetSalary } from "@/utils/salary";

// Valeurs tirées du dernier bulletin, affichées dans les fiches concernées.
function montantPour(
  id: string,
  p: { gross_salary?: number | null; net_salary?: number | null; net_after_tax?: number | null; charges?: number | null } | undefined
): { montant: number; libelle: string } | null {
  if (!p) return null;
  const brut = p.gross_salary ?? 0;
  const net = resolveNetSalary(p);
  const impot = p.charges ?? 0;
  switch (id) {
    case "remuneration-brute":
      return brut ? { montant: brut, libelle: "ta rémunération brute" } : null;
    case "net-a-payer":
      return net ? { montant: net, libelle: "ton net à payer" } : null;
    case "pas":
      return impot ? { montant: impot, libelle: "ton impôt prélevé" } : null;
    default:
      return null;
  }
}

function Fiche({
  fiche,
  ouverte,
  onToggle,
  chiffre,
  brut,
}: {
  fiche: FicheLexique;
  ouverte: boolean;
  onToggle: () => void;
  chiffre: { montant: number; libelle: string } | null;
  brut: number;
}) {
  const part = chiffre && brut ? (chiffre.montant / brut) * 100 : null;

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 py-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{fiche.titre}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{fiche.resume}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {chiffre && (
            <span className="text-sm font-bold text-primary whitespace-nowrap">
              {formatCurrency(chiffre.montant)}
            </span>
          )}
          {ouverte ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {ouverte && (
        <div className="pb-5 space-y-3 text-sm leading-relaxed">
          <p className="text-foreground/90">{fiche.explication}</p>

          {chiffre && (
            <div className="bg-primary/10 rounded-xl p-3">
              <p className="text-foreground">
                Sur ton dernier bulletin, {chiffre.libelle} s'élève à{" "}
                <strong className="text-primary">{formatCurrency(chiffre.montant)}</strong>
                {part !== null && part > 0 && part < 200 && (
                  <> , soit {part.toFixed(1).replace(".", ",")} % de ton brut</>
                )}
                .
              </p>
            </div>
          )}

          {fiche.aQuoiCaSert && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">À quoi ça sert</p>
              <p className="text-foreground/90">{fiche.aQuoiCaSert}</p>
            </div>
          )}

          {fiche.bonASavoir && (
            <div className="bg-secondary/60 rounded-xl p-3">
              <p className="text-xs text-primary uppercase tracking-wide mb-1 font-semibold">Bon à savoir</p>
              <p className="text-foreground/90">{fiche.bonASavoir}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Lexique() {
  const { payslips, loading } = usePayslips();
  const [recherche, setRecherche] = useState("");
  const [ouverte, setOuverte] = useState<string | null>(null);

  // Le bulletin le plus récent sert de référence pour les montants.
  const dernier = useMemo(() => {
    const valides = payslips.filter((p) => p.period_year && p.period_month);
    if (valides.length === 0) return undefined;
    return [...valides].sort((a, b) =>
      a.period_year !== b.period_year ? b.period_year - a.period_year : b.period_month - a.period_month
    )[0];
  }, [payslips]);

  const fiches = useMemo(() => {
    const q = recherche
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (!q) return LEXIQUE;
    return LEXIQUE.filter((f) =>
      (f.titre + " " + f.resume + " " + f.explication + " " + f.motsCles.join(" "))
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(q)
    );
  }, [recherche]);

  const brut = dernier?.gross_salary ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Comprendre ma fiche de paie</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Chaque ligne de ton bulletin expliquée simplement
          {dernier && (
            <> · montants d'après ton bulletin de {formatPeriod(dernier.period_month, dernier.period_year)}</>
          )}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une ligne : CSG, retraite, mutuelle..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : fiches.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucune ligne ne correspond à « {recherche} ». Essaie un autre mot, par exemple « retraite » ou « impôt ».
          </p>
        </Card>
      ) : recherche ? (
        <Card className="px-5">
          {fiches.map((f) => (
            <Fiche
              key={f.id}
              fiche={f}
              ouverte={ouverte === f.id}
              onToggle={() => setOuverte(ouverte === f.id ? null : f.id)}
              chiffre={montantPour(f.id, dernier)}
              brut={brut}
            />
          ))}
        </Card>
      ) : (
        <div className="space-y-5">
          {FAMILLES.map((famille) => {
            const dedans = fiches.filter((f) => f.famille === famille.id);
            if (dedans.length === 0) return null;
            return (
              <div key={famille.id}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span>{famille.emoji}</span>
                  <h3 className="font-semibold text-foreground">{famille.titre}</h3>
                  <span className="text-xs text-muted-foreground">· {famille.description}</span>
                </div>
                <Card className="px-5">
                  {dedans.map((f) => (
                    <Fiche
                      key={f.id}
                      fiche={f}
                      ouverte={ouverte === f.id}
                      onToggle={() => setOuverte(ouverte === f.id ? null : f.id)}
                      chiffre={montantPour(f.id, dernier)}
                      brut={brut}
                    />
                  ))}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground px-1 leading-relaxed">
        Ces explications sont données à titre informatif et ne remplacent pas ton service paie.
        Les libellés varient d'un employeur à l'autre : certaines lignes de ton bulletin peuvent ne pas apparaître ici.
      </p>
    </div>
  );
}
