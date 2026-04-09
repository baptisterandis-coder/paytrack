"use client";

import { useState, useMemo } from "react";
import { Trophy, Lock, Calendar, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayslips } from "@/hooks/usePayslips";
import { detectConsecutiveMonths, getMonthShort, getMonthLong, formatCurrency, type Payslip } from "@/utils/salary";

const MONTHLY_TROPHY_DEFS = [
  { id: "2k",  title: "Premier 2K",  label: "2K",  color: "bg-primary/10 text-primary",  threshold: 2000  },
  { id: "5k",  title: "Premier 5K",  label: "5K",  color: "bg-warning/10 text-warning",  threshold: 5000  },
  { id: "10k", title: "Premier 10K", label: "10K", color: "bg-success/10 text-success",  threshold: 10000 },
  { id: "15k", title: "Premier 15K", label: "15K", color: "bg-accent/10 text-accent",    threshold: 15000 },
];

const CUMUL_TROPHY_DEFS = [
  { id: "cumul-50k",  title: "Cumul 50K",   label: "50K",  color: "bg-primary/10 text-primary",  threshold: 50000   },
  { id: "cumul-100k", title: "Cumul 100K",  label: "100K", color: "bg-warning/10 text-warning",  threshold: 100000  },
  { id: "cumul-250k", title: "Cumul 250K",  label: "250K", color: "bg-success/10 text-success",  threshold: 250000  },
  { id: "cumul-500k", title: "Cumul 500K",  label: "500K", color: "bg-accent/10 text-accent",    threshold: 500000  },
  { id: "cumul-1m",   title: "Cumul 1M€",   label: "1M",   color: "bg-warning/10 text-warning",  threshold: 1000000 },
];

type Filter = "all" | "unlocked" | "locked";

function useTrophies(payslips: Payslip[]) {
  return useMemo(() => {
    // Trier par date chronologique
    const sorted = [...payslips]
      .filter(p => p.gross_salary && p.period_year && p.period_month)
      .sort((a, b) => a.period_year !== b.period_year ? a.period_year - b.period_year : a.period_month - b.period_month);

    const consecutive = detectConsecutiveMonths(payslips, 12);

    // Trophées mensuel brut
    const monthlyMilestones = MONTHLY_TROPHY_DEFS.map(def => {
      const match = sorted.find(p => (p.gross_salary ?? 0) >= def.threshold) ?? null;
      return {
        ...def,
        category: "monthly" as const,
        payslip: match,
        unlocked: !!match,
        displayValue: match ? formatCurrency(match.gross_salary) : null,
        displaySub: match ? `${getMonthShort(match.period_month)} ${match.period_year}` : "En attente",
        consecutive: null as typeof consecutive | null,
        cumulInfo: null as { amount: number; month: number; year: number } | null,
      };
    });

    // Trophées cumulés — on calcule le cumul progressif
    const cumulMilestones = CUMUL_TROPHY_DEFS.map(def => {
      let cumul = 0;
      let unlockPayslip: Payslip | null = null;

      for (const p of sorted) {
        cumul += p.gross_salary ?? 0;
        if (cumul >= def.threshold && !unlockPayslip) {
          unlockPayslip = p;
          break;
        }
      }

      const totalCumul = sorted.reduce((s, p) => s + (p.gross_salary ?? 0), 0);

      return {
        ...def,
        category: "cumul" as const,
        payslip: unlockPayslip,
        unlocked: !!unlockPayslip,
        displayValue: unlockPayslip ? formatCurrency(def.threshold) : null,
        displaySub: unlockPayslip
          ? `Atteint en ${getMonthShort(unlockPayslip.period_month)} ${unlockPayslip.period_year}`
          : `${formatCurrency(totalCumul)} / ${formatCurrency(def.threshold)}`,
        consecutive: null as typeof consecutive | null,
        cumulInfo: unlockPayslip ? { amount: def.threshold, month: unlockPayslip.period_month, year: unlockPayslip.period_year } : null,
      };
    });

    // Trophée streak
    const streakTrophy = {
      id: "12m", title: "12 Mois", label: "12M", color: "bg-primary/10 text-primary", threshold: 0,
      category: "streak" as const,
      payslip: null as Payslip | null,
      unlocked: consecutive.hasConsecutive,
      displayValue: consecutive.hasConsecutive ? `${consecutive.streak} mois` : null,
      displaySub: consecutive.hasConsecutive && consecutive.startPayslip && consecutive.endPayslip
        ? `${getMonthShort(consecutive.startPayslip.period_month)} ${consecutive.startPayslip.period_year} – ${getMonthShort(consecutive.endPayslip.period_month)} ${consecutive.endPayslip.period_year}`
        : "En attente",
      consecutive,
      cumulInfo: null as null,
    };

    return {
      monthlyMilestones,
      cumulMilestones,
      streakTrophy,
      consecutive,
      allTrophies: [...monthlyMilestones, ...cumulMilestones, streakTrophy],
    };
  }, [payslips]);
}

export function TrophyGallery() {
  const { payslips, downloadPayslip } = usePayslips();
  const { monthlyMilestones, cumulMilestones, streakTrophy, consecutive, allTrophies } = useTrophies(payslips);
  const [selected, setSelected] = useState<typeof allTrophies[0] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const getFiltered = (list: typeof allTrophies) =>
    list.filter(t => filter === "all" || (filter === "unlocked" ? t.unlocked : !t.unlocked));

  const unlockedCount = allTrophies.filter(t => t.unlocked).length;

  const TrophyCard = ({ t }: { t: typeof allTrophies[0] }) => (
    <Card
      className={`relative overflow-hidden transition-all ${t.unlocked ? "hover:shadow-glow cursor-pointer" : "opacity-60"}`}
      onClick={() => t.unlocked && setSelected(t)}>
      <div className="p-6 space-y-4 text-center">
        <div className={`w-16 h-16 rounded-full ${t.color} flex items-center justify-center mx-auto relative`}>
          <span className="text-lg font-bold">{t.label}</span>
          {!t.unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full backdrop-blur-sm">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold">{t.title}</h4>
          <p className="text-xl font-bold text-primary mt-1">{t.displayValue ?? "🔒"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.displaySub}</p>
        </div>
        <Badge className={t.unlocked ? "bg-warning/10 text-warning border-warning/20" : "bg-muted/30 text-muted-foreground"}>
          {t.unlocked ? "🏆 Débloqué" : "Bloqué"}
        </Badge>
      </div>
      {t.unlocked && <div className="absolute top-2 right-2 w-10 h-10 bg-warning/20 rounded-full blur-xl pointer-events-none" />}
    </Card>
  );

  return (
    <div className="space-y-10">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" /> Galerie des Trophées
          <Badge variant="secondary">{unlockedCount}/{allTrophies.length}</Badge>
        </h3>
        <div className="flex gap-2">
          {(["all","unlocked","locked"] as Filter[]).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {{ all: "Tous", unlocked: "Débloqués", locked: "Bloqués" }[f]}
              <Badge variant="secondary" className="ml-1 text-xs">
                {f === "all" ? allTrophies.length : allTrophies.filter(t => f === "unlocked" ? t.unlocked : !t.unlocked).length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Section Salaire mensuel */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide text-sm">
          💰 Salaire mensuel brut
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {getFiltered(monthlyMilestones).map(t => <TrophyCard key={t.id} t={t} />)}
        </div>
      </div>

      {/* Section Cumul carrière */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide text-sm">
          📈 Cumul carrière brut
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {getFiltered(cumulMilestones).map(t => <TrophyCard key={t.id} t={t} />)}
        </div>
      </div>

      {/* Section Streak */}
      {(filter === "all" || (filter === "unlocked" && streakTrophy.unlocked) || (filter === "locked" && !streakTrophy.unlocked)) && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            ⚡ Régularité
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <TrophyCard t={streakTrophy} />
          </div>
        </div>
      )}

      {/* Modal détail */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={`font-bold text-xl ${selected?.color?.split(" ")[1]}`}>{selected?.label}</span>
              {selected?.title}
            </DialogTitle>
          </DialogHeader>

          {selected?.category === "cumul" && selected.cumulInfo ? (
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-card border-border/50 text-center space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Palier atteint</p>
                <p className="text-4xl font-bold text-warning">{formatCurrency(selected.cumulInfo.amount)}</p>
                <p className="text-muted-foreground">de cumul brut</p>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase">Mois de franchissement</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {getMonthLong(selected.cumulInfo.month)} {selected.cumulInfo.year}
                  </p>
                </div>
                <Badge className="bg-warning/10 text-warning border-warning/20 w-full justify-center py-2">
                  🏆 Trophée "{selected.title}" débloqué
                </Badge>
              </Card>
            </div>

          ) : selected?.id === "12m" ? (
            consecutive.hasConsecutive && consecutive.startPayslip && consecutive.endPayslip ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-accent">{consecutive.streak}</p>
                  <p className="text-muted-foreground">mois consécutifs</p>
                  <p className="text-sm mt-2">{getMonthLong(consecutive.startPayslip.period_month)} {consecutive.startPayslip.period_year} → {getMonthLong(consecutive.endPayslip.period_month)} {consecutive.endPayslip.period_year}</p>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {[...consecutive.payslipsList].reverse().map(p => (
                    <div key={p.id} className="grid grid-cols-3 gap-2 text-sm p-3 bg-muted/20 rounded-xl">
                      <span className="font-medium">{getMonthShort(p.period_month)} {p.period_year}</span>
                      <span className="text-primary font-bold">{formatCurrency(p.gross_salary)}</span>
                      <span className="text-success font-bold">{formatCurrency(p.net_salary ?? p.net_after_tax)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Séquence actuelle : {consecutive.streak} mois</p>
              </div>
            )

          ) : selected?.payslip ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl">
                <div><p className="text-xs text-muted-foreground uppercase">Période</p><p className="font-bold text-lg">{getMonthLong(selected.payslip.period_month)} {selected.payslip.period_year}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase">Entreprise</p><p className="font-semibold">{selected.payslip.company_name || "—"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-xl"><p className="text-xs text-muted-foreground">Brut</p><p className="font-bold text-primary">{formatCurrency(selected.payslip.gross_salary)}</p></div>
                <div className="text-center p-3 bg-muted/20 rounded-xl"><p className="text-xs text-muted-foreground">Net</p><p className="font-bold text-success">{formatCurrency(selected.payslip.net_salary ?? selected.payslip.net_after_tax)}</p></div>
                <div className="text-center p-3 bg-muted/20 rounded-xl"><p className="text-xs text-muted-foreground">Charges</p><p className="font-bold text-muted-foreground">{formatCurrency(selected.payslip.charges)}</p></div>
              </div>
              <Button className="w-full" onClick={() => downloadPayslip(selected.payslip!)}>
                <FileText className="w-4 h-4" /> Télécharger le bulletin
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}