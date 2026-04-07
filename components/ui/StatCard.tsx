import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: { value: string; isPositive: boolean };
  icon: React.ReactNode;
  gradient?: "primary" | "success" | "warning" | "accent";
  onClick?: () => void;
}

const iconBgs = {
  primary: "bg-primary/20 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  accent: "bg-accent/20 text-accent",
};

export function StatCard({ title, value, change, icon, gradient = "primary", onClick }: StatCardProps) {
  return (
    <Card
      className={cn("p-6 transition-all hover:shadow-glow", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <div className={cn("flex items-center gap-1 text-sm", change.isPositive ? "text-success" : "text-danger")}>
              {change.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change.value}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgs[gradient])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}