<StatCard
  title={`Impôt ${currentYear}`}
  value={loading ? "…" : formatCurrency(stats.totalTax)}
  change={!loading && stats.totalTaxN1 > 0 ? {
    value: `${stats.taxChange > 0 ? "+" : ""}${stats.taxChange.toFixed(1)}%`,
    isPositive: true,
    neutral: true
  } : undefined}
  icon={<Users className="w-6 h-6" />}
  gradient="warning"
/>