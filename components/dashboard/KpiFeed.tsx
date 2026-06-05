"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
        Indicateurs économiques
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-3 space-y-1.5">
              <div className="h-3 bg-muted/30 rounded animate-pulse w-24" />
              <div className="h-4 bg-muted/20 rounded animate-pulse w-16" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {kpis.map((kpi) => (
              <Card key={kpi.key} className="p-3">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  {kpi.tooltip && <Tooltip text={kpi.tooltip} />}
                  {kpi.source === "live" && (
                    <span
                      title="Donnée mise à jour automatiquement"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-success/80"
                    />
                  )}
                </div>
                <p className={`font-bold text-base ${kpi.alert ? "text-warning" : "text-foreground"}`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </Card>
            ))}
          </div>

          {warning && (
            <div
              className={`${warning.positive ? "bg-success/10 border-success/20" : "bg-warning/10 border-warning/20"} border rounded-xl p-3 mt-2`}
            >
              <p className={`text-xs font-medium ${warning.positive ? "text-success" : "text-warning"}`}>
                {warning.text}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{warning.sub}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
