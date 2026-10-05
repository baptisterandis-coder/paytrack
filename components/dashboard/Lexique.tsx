"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePayslips } from "@/hooks/usePayslips";
import { FAMILLES, LEXIQUE, trouverFiche, type FicheLexique } from "@/utils/lexique";
import { formatCurrency, formatPeriod, resolveNetSalary, type Payslip } from "@/utils/salary";

interface LigneBulletin {
  libelle?: string | null;
  montant_salarial?: number | null;
  montant_patronal?: number | null;
  taux_salarial?: number | null;
}

interface Chiffres {
  mois: number;        // montant sur le dernier bulletin
  cumul: number;       // total sur tous les bulletins détaillés
  nbBulletins: number; // nombre de bulletins pris en compte
  patronalMois?: number;
}

// Associe chaque fiche du lexique aux montants réels de l'utilisateur.
function calculerChiffres(payslips: Payslip[], dernier: Payslip | undefined): Record<string, Chiffres> {
  const res: Record<string, Chiffres> = {};

  const ajouter = (id: string, montant: number, estDernier: boolean, patronal?: number) => {
    if (!montant) return;
    const c = (res[id] ??= { mois: 0, cumul: 0, nbBulletins: 0 });
    c.cumul += montant;
    if (estDernier) {
      c.mois += montant;
      if (patronal) c.patronalMois = (c.patronalMois ?? 0) + patronal;
    }
  };

  const avecDetail = new Set<string>();

  for (const p of payslips) {
    const lignes = (p as unknown as { lignes?: LigneBulletin[] }).lignes;
    const estDernier = !!dernier && p.id === dernier.id;

    // Totaux toujours disponibles
    if (p.gross_salary) ajouter("remuneration-brute", p.gross_salary, estDernier);
    const net = resolveNetSalary(p);
    if (net) ajouter("net-a-payer", net, estDernier);

    if (!Array.isArray(lignes) || lignes.length === 0) continue;
    avecDetail.add(p.id);

    for (const l of lignes) {
      const fiche = trouverFiche(l.libelle ?? "");
      if (!fiche) continue;
      const sal = Math.abs(Number(l.montant_salarial) || 0);
      const pat = Math.abs(Number(l.montant_patronal) || 0);
      if (sal) ajouter(fiche.id, sal, estDernier, pat);
      else if (pat && !sal) {
        // Ligne payée uniquement par l'employeur : on affiche sa part patronale
        const c = (res[fiche.id] ??= { mois: 0, cumul: 0, nbBulletins: 0 });
        if (estDernier) c.patronalMois = (c.patronalMois ?? 0) + pat;
      }
    }
  }

  const nb = avecDetail.size;
  Object.values(res).forEach((c) => (c.nbBulletins = nb));
  return res;
}

function Fiche({
  fiche,
  ouverte,
  onToggle,
  chiffres,
  brut,
}: {
  fiche: FicheLexique;
  ouverte: boolean;
  onToggle: () => void;
  chiffres: Chiffres | undefined;
  brut: number;
}) {
  const part = chiffres?.mois && brut ? (chiffres.mois / brut) * 100 : null;

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
          {chiffres && chiffres.mois > 0 && (
            <span className="text-sm font-bold text-primary whitespace-nowrap">
              {formatCurrency(chiffres.mois)}
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

          {chiffres && (chiffres.mois > 0 || (chiffres.patronalMois ?? 0) > 0) && (
            <div className="bg-primary/10 rounded-xl p-3 space-y-1.5">
              {chiffres.mois > 0 && (
                <p className="text-foreground">
                  Sur ton dernier bulletin :{" "}
                  <strong className="text-primary">{formatCurrency(chiffres.mois)}</strong>
                  {part !== null && part > 0 && part < 200 && (
                    <> , soit {part.toFixed(1).replace(".", ",")}&#8239;% de ton brut</>
                  )}
                </p>
              )}
              {(chiffres.patronalMois ?? 0) > 0 && (
                <p className="text-muted-foreground text-[13px]">
                  Part payée par ton employeur : {formatCurrency(chiffres.patronalMois ?? 0)}
                </p>
              )}
              {chiffres.cumul > chiffres.mois && chiffres.nbBulletins > 1 && (
                <p className="text-foreground/90 pt-1 border-t border-primary/20">
                  Cumul sur tes {chiffres.nbBulletins} derniers bulletins :{" "}
                  <strong className="text-primary">{formatCurrency(chiffres.cumul)}</strong>
                </p>
              )}
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

  const chiffres = useMemo(() => calculerChiffres(payslips, dernier), [payslips, dernier]);

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
              chiffres={chiffres[f.id]}
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
                      chiffres={chiffres[f.id]}
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
