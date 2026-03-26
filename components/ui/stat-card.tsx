import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
};

const trendConfig = {
  up: { icon: ArrowUp, color: "text-emerald-600" },
  down: { icon: ArrowDown, color: "text-red-600" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

export function StatCard({ label, value, trend, trendValue, className }: StatCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <Card className={cn(className)}>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-semibold">{value}</span>
          {trendInfo && trendValue && (
            <span className={cn("flex items-center gap-0.5 text-sm", trendInfo.color)}>
              <trendInfo.icon className="h-3.5 w-3.5" />
              {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
