import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import type { ReactNode } from "react";

export interface PodiumRow {
  key: string;
  cells: { label: string; value: ReactNode; accent?: string }[];
}

const PODIUM_STYLES = [
  { icon: <Trophy className="w-5 h-5" />, bg: "bg-warning/10 text-warning", label: "1er" },
  { icon: <Medal className="w-5 h-5" />, bg: "bg-muted/30 text-muted-foreground", label: "2ème" },
  { icon: <Medal className="w-5 h-5" />, bg: "bg-accent/10 text-accent", label: "3ème" },
];

export function PodiumModal({ open, onOpenChange, title, rows, emptyMessage }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  title: ReactNode; rows: PodiumRow[]; emptyMessage?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{emptyMessage ?? "Aucune donnée disponible."}</p>
            </div>
          ) : rows.map((row, i) => {
            const pod = PODIUM_STYLES[i] ?? PODIUM_STYLES[2];
            return (
              <Card key={row.key} className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-full flex-shrink-0 ${pod.bg}`}>{pod.icon}</div>
                  <div className="w-10 flex-shrink-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rang</p>
                    <p className="font-semibold text-sm">{pod.label}</p>
                  </div>
                  <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {row.cells.map(cell => (
                      <div key={cell.label}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{cell.label}</p>
                        <p className={`font-bold text-sm ${cell.accent ?? "text-foreground"}`}>{cell.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}