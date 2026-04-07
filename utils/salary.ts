export interface Payslip {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  period_month: number;
  period_year: number;
  gross_salary?: number | null;
  net_salary?: number | null;
  net_after_tax?: number | null;
  charges?: number | null;
  tax_amount?: number | null;
  company_name?: string | null;
  employee_name?: string | null;
  processed: boolean;
  processing_status: string;
  processing_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  goal_type: "annual_gross" | "monthly_gross";
  target_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyChartData {
  month: string;
  brut: number;
  net: number;
  brutN1: number;
  netN1: number;
}

export interface YearlyTotal {
  year: number;
  totalNet: number;
  totalGross: number;
  count: number;
  companies: Set<string>;
}

export interface YearlyTotalWithGrowth extends YearlyTotal {
  growthRate: number | null;
}

export interface ConsecutiveResult {
  hasConsecutive: boolean;
  streak: number;
  startPayslip: Payslip | null;
  endPayslip: Payslip | null;
  payslipsList: Payslip[];
}

export const MONTH_NAMES_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
export const MONTH_NAMES_LONG = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export const getMonthShort = (m: number) => MONTH_NAMES_SHORT[m - 1] ?? "";
export const getMonthLong = (m: number) => MONTH_NAMES_LONG[m - 1] ?? "";

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${Math.round(amount).toLocaleString("fr-FR")} €`;
}

export function formatPeriod(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
}

export function resolveNetSalary(p: Payslip): number {
  return p.net_after_tax ?? p.net_salary ?? 0;
}

export function buildYearlyTotals(payslips: Payslip[]): Record<number, YearlyTotal> {
  return payslips
    .filter(p => p.period_year && resolveNetSalary(p) > 0)
    .reduce<Record<number, YearlyTotal>>((acc, p) => {
      const y = p.period_year;
      if (!acc[y]) acc[y] = { year: y, totalNet: 0, totalGross: 0, count: 0, companies: new Set() };
      acc[y].totalNet += resolveNetSalary(p);
      acc[y].totalGross += p.gross_salary ?? 0;
      acc[y].count += 1;
      if (p.company_name) acc[y].companies.add(p.company_name);
      return acc;
    }, {});
}

export const getTopYears = (ps: Payslip[], n = 3) => Object.values(buildYearlyTotals(ps)).sort((a, b) => b.totalGross - a.totalGross).slice(0, n);
export const getTopNetSalaries = (ps: Payslip[], n = 3) => [...ps].filter(p => resolveNetSalary(p) > 0).sort((a, b) => resolveNetSalary(b) - resolveNetSalary(a)).slice(0, n);
export const getTopGrossSalaries = (ps: Payslip[], n = 3) => [...ps].filter(p => p.gross_salary).sort((a, b) => (b.gross_salary ?? 0) - (a.gross_salary ?? 0)).slice(0, n);
export const getBestMonthPayslip = (ps: Payslip[]) => ps.reduce<Payslip | null>((best, cur) => (!cur.gross_salary ? best : (!best || (best.gross_salary ?? 0) < cur.gross_salary ? cur : best)), null);

export function getLast5YearsProgression(payslips: Payslip[]): YearlyTotalWithGrowth[] {
  const sorted = Object.values(buildYearlyTotals(payslips)).sort((a, b) => b.year - a.year).slice(0, 5).sort((a, b) => a.year - b.year);
  return sorted.map((y, i, arr) => ({
    ...y,
    growthRate: i > 0 && arr[i-1].totalNet > 0 ? ((y.totalNet - arr[i-1].totalNet) / arr[i-1].totalNet) * 100 : null,
  }));
}

export function detectConsecutiveMonths(payslips: Payslip[], minMonths = 12): ConsecutiveResult {
  const sorted = [...payslips].filter(p => p.period_year && p.period_month)
    .sort((a, b) => a.period_year !== b.period_year ? a.period_year - b.period_year : a.period_month - b.period_month);
  if (sorted.length < minMonths) return { hasConsecutive: false, streak: sorted.length, startPayslip: null, endPayslip: null, payslipsList: [] };
  let maxStreak = 1, cur = 1, streakStart = 0, maxStart = 0, maxEnd = 0;
  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i - 1], c = sorted[i];
    let em = p.period_month + 1, ey = p.period_year;
    if (em > 12) { em = 1; ey++; }
    if (c.period_month === em && c.period_year === ey) {
      cur++;
      if (cur > maxStreak) { maxStreak = cur; maxStart = streakStart; maxEnd = i; }
    } else { cur = 1; streakStart = i; }
  }
  const ok = maxStreak >= minMonths;
  return { hasConsecutive: ok, streak: maxStreak, startPayslip: ok ? sorted[maxStart] : null, endPayslip: ok ? sorted[maxEnd] : null, payslipsList: ok ? sorted.slice(maxStart, maxEnd + 1) : [] };
}

export function generateMonthlyData(payslips: Payslip[]): MonthlyChartData[] {
  const cy = new Date().getFullYear(), py = cy - 1;
  type E = { net: number; brut: number; count: number };
  const mc = new Map<number, E>(), mp = new Map<number, E>();
  payslips.forEach(p => {
    const net = resolveNetSalary(p);
    if (!net || !p.gross_salary) return;
    const m = p.period_year === cy ? mc : p.period_year === py ? mp : null;
    if (!m) return;
    const e = m.get(p.period_month) ?? { net: 0, brut: 0, count: 0 };
    m.set(p.period_month, { net: e.net + net, brut: e.brut + p.gross_salary, count: e.count + 1 });
  });
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1, c = mc.get(month), prev = mp.get(month);
    return { month: MONTH_NAMES_SHORT[i], brut: c ? Math.round(c.brut/c.count) : 0, net: c ? Math.round(c.net/c.count) : 0, brutN1: prev ? Math.round(prev.brut/prev.count) : 0, netN1: prev ? Math.round(prev.net/prev.count) : 0 };
  });
}

export interface AchievementDef {
  id: string; title: string; description: string;
  check: (ps: Payslip[]) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "best-year", title: "Année Record 📊", description: "Vos meilleures années de revenus", check: ps => Object.keys(buildYearlyTotals(ps)).length >= 1 },
  { id: "salary-record", title: "Salaire Record 🏆", description: "Votre meilleur salaire net", check: ps => ps.some(p => resolveNetSalary(p) > 0) },
  { id: "progression", title: "En Progression 📈", description: "Évolution des revenus sur 5 ans", check: ps => Object.keys(buildYearlyTotals(ps)).length >= 2 },
  { id: "prime-hunter", title: "Prime Hunter 💰", description: "Plus de 1 000 € de primes cette année", check: ps => ps.filter(p => p.period_year === new Date().getFullYear()).reduce((s, p) => s + (p.charges ?? 0), 0) > 1000 },
  { id: "milestone-50k", title: "Milestone 50K 🌟", description: "Atteindre 50 000 € brut annuel", check: ps => Object.values(buildYearlyTotals(ps)).some(t => t.totalGross >= 50000) },
  { id: "streak-master", title: "Streak Master ⚡", description: "12 mois de bulletins consécutifs", check: ps => detectConsecutiveMonths(ps, 12).hasConsecutive },
];