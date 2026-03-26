import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalysisSummaryCardProps = {
  title: string;
  metrics: { label: string; value: string }[];
  status?: "positive" | "negative" | "neutral";
  className?: string;
};

const statusColors = {
  positive: "border-l-emerald-500",
  negative: "border-l-red-500",
  neutral: "border-l-muted-foreground",
};

export function AnalysisSummaryCard({ title, metrics, status, className }: AnalysisSummaryCardProps) {
  return (
    <Card className={cn(status && `border-l-4 ${statusColors[status]}`, className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
