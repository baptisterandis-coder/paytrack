"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { Kpi, KpisPayload } from "@/app/api/kpis/route";

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block">
      <span className="text-xs text-muted-foreground cursor-help">ⓘ</span>
      <div className="absolute left-0 bottom-5 w-48 bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {text}
      </div>
    </div>
  );
}

function KpiTile({ kpi }: { kpi: Kpi }) {
  return (
    <div className={`rounded-lg bg-muted/20 p-2.5 ${kpi.key === "salaire_median" ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1">
        <p className="text-[11px] text-muted-foreground truncate">{kpi.label}</p>
        {kpi.tooltip && <Tooltip text={kpi.tooltip} />}
        {kpi.source === "live" && (
          <span
            title="Donnée mise à jour automatiquement"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-success/80 flex-shrink-0"
          />
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
        <p className={`font-bold text-sm ${kpi.alert ? "text-warning" : "text-foreground"}`}>
          {kpi.value}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight">{kpi.sub}</p>
      </div>
    </div>
  );
}

export function KpiFeed() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [warning, setWarning] = useState<KpisPayload["warning"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((data: KpisPayload) => {
        if (!active) return;
        setKpis(data.kpis ?? []);
        setWarning(data.warning ?? null);
      })
      .catch((e) => console.error("KPI fetch error:", e))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Indicateurs économiques</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-muted/20 p-2.5 space-y-1.5">
              <div className="h-2.5 bg-muted/30 rounded animate-pulse w-16" />
              <div className="h-3.5 bg-muted/20 rounded animate-pulse w-12" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {kpis.map((kpi) => (
              <KpiTile key={kpi.key} kpi={kpi} />
            ))}
          </div>

          {warning && (
            <div
              className={`${warning.positive ? "bg-success/10 border-success/20" : "bg-warning/10 border-warning/20"} border rounded-xl p-2.5 mt-3`}
            >
              <p className={`text-xs font-medium ${warning.positive ? "text-success" : "text-warning"}`}>
                {warning.text}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{warning.sub}</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
