"use client";

import { useState, useMemo } from "react";
import { Euro, FileText, TrendingUp, Users, Upload, Target, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalaryChart } from "@/components/dashboard/SalaryChart";
import { CareerChart } from "@/components/dashboard/CareerChart";
import { PayslipFeed } from "@/components/dashboard/PayslipFeed";
import { Goals } from "@/components/dashboard/Goals";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { TrophyGallery } from "@/components/dashboard/TrophyGallery";
import { UploadPayslip } from "@/components/dashboard/UploadPayslip";
import { ProfileModal } from "@/components/dashboard/ProfileModal";
import { usePayslips } from "@/hooks/usePayslips";
import { useGoals } from "@/hooks/useGoals";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency, resolveNetSalary, generateMonthlyData } from "@/utils/salary";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const { payslips, loading } = usePayslips();
  const { goals } = useGoals();
  const { profile, getAge } = useProfile();
  const currentYear = new Date().getFullYear();
  const age = getAge();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const stats = useMemo(() => {
    const cy = payslips.filter(p => p.period_year === currentYear);
    const currentMonths = new Set(cy.map(p => p.period_month));
    const py = payslips.filter(p =>
      p.period_year === currentYear - 1 && currentMonths.has(p.period_month)
    );
    const totalNet = cy.reduce((s, p) => s + resolveNetSalary(p), 0);
    const totalNetN1 = py.reduce((s, p) => s + resolveNetSalary(p), 0);
    const totalGross = cy.reduce((s, p) => s + (p.gross_salary ?? 0), 0);
    const totalGrossN1 = py.reduce((s, p) => s + (p.gross_salary ?? 0), 0);
    const totalTax = cy.reduce((s, p) => s + (p.tax_amount ?? p.charges ?? 0), 0);
    const totalTaxN1 = py.reduce((s, p) => s + (p.tax_amount ?? p.charges ?? 0), 0);
    return {
      totalNet, totalNetN1,
      netChange: totalNetN1 > 0 ? ((totalNet - totalNetN1) / totalNetN1) * 100 : 0,
      totalGross, totalGrossN1,
      grossChange: totalGrossN1 > 0 ? ((totalGross - totalGrossN1) / totalGrossN1) * 100 : 0,
      totalTax, totalTaxN1,
      taxChange: totalTaxN1 > 0 ? ((totalTax - totalTaxN1) / totalTaxN1) * 100 : 0,
      monthlyData: generateMonthlyData(payslips),
    };
  }, [payslips, currentYear]);

  const annualGoal = goals.find(g => g.goal_type === "annual_gross");
  const progress = annualGoal ? (stats.totalGross / annualGoal.target_amount) * 100 : 0;

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              PayTrack
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Tableau de bord {currentYear}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-foreground leading-tight">
                  {profile?.full_name ? profile.full_name.split(" ")[0] : "Mon profil"}
                  {age !== null && <span className="text-muted-foreground font-normal"> · {age} ans</span>}
                </div>
                {(profile?.job_title || profile?.contract_type) && (
                  <div className="text-xs text-muted-foreground leading-tight">
                    {[profile.job_title, profile.contract_type].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </button>
            <UploadPayslip />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="payslips">Bulletins</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="trophies">Trophées</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={`Cumul net ${currentYear}`}
                value={loading ? "…" : formatCurrency(stats.totalNet)}
                change={!loading && stats.totalNetN1 > 0 ? {
                  value: `${stats.netChange > 0 ? "+" : ""}${stats.netChange.toFixed(1)}%`,
                  isPositive: stats.netChange >= 0
                } : undefined}
                icon={<Euro className="w-6 h-6" />}
                gradient="success"
              />
              <StatCard
                title={`Cumul brut ${currentYear}`}
                value={loading ? "…" : formatCurrency(stats.totalGross)}
                change={!loading && stats.totalGrossN1 > 0 ? {
                  value: `${stats.grossChange > 0 ? "+" : ""}${stats.grossChange.toFixed(1)}%`,
                  isPositive: stats.grossChange >= 0
                } : undefined}
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="primary"
              />
              <StatCard
                title={`Impôt ${currentYear}`}
                value={loading ? "…" : formatCurrency(stats.totalTax)}
                change={!loading && stats.totalTaxN1 > 0 ? {
                  value: `${stats.taxChange > 0 ? "+" : ""}${stats.taxChange.toFixed(1)}%`,
                  isPositive: stats.taxChange >= 0
                } : undefined}
                icon={<Users className="w-6 h-6" />}
                gradient="warning"
              />
              <StatCard
                title="Bulletins"
                value={loading ? "…" : payslips.length.toString()}
                icon={<FileText className="w-6 h-6" />}
                gradient="accent"
                onClick={() => setTab("payslips")}
              />
            </div>

            <CareerChart payslips={payslips} birthDate={profile?.birth_date ?? null} />

            <SalaryChart data={stats.monthlyData} />

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setTab("payslips")}
                  className="flex items-center gap-3 p-4 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors text-left">
                  <Upload className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tous les bulletins</p>
                    <p className="text-sm text-muted-foreground">{payslips.length} enregistré{payslips.length > 1 ? "s" : ""}</p>
                  </div>
                </button>
                <button onClick={() => setTab("achievements")}
                  className="flex items-center gap-3 p-4 border border-success/20 rounded-xl hover:bg-success/5 transition-colors text-left">
                  <TrendingUp className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-medium">Mes Achievements</p>
                    <p className="text-sm text-muted-foreground">Voir mes badges</p>
                  </div>
                </button>
                <button onClick={() => setTab("goals")}
                  className="flex flex-col p-4 border border-warning/20 rounded-xl hover:bg-warning/5 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-warning flex-shrink-0" />
                    <div>
                      <p className="font-medium">Objectif Annuel Brut</p>
                      <p className="text-sm text-muted-foreground">Progression {currentYear}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-warning transition-all duration-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-muted-foreground">{formatCurrency(stats.totalGross)}{annualGoal ? ` / ${formatCurrency(annualGoal.target_amount)}` : ""}</span>
                    <span className="font-bold text-primary">{progress.toFixed(0)}%</span>
                  </div>
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payslips"><PayslipFeed /></TabsContent>
          <TabsContent value="goals"><Goals /></TabsContent>
          <TabsContent value="achievements"><AchievementBadges /></TabsContent>
          <TabsContent value="trophies"><TrophyGallery /></TabsContent>
        </Tabs>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}