import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retry?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {retry && <div className="mt-4">{retry}</div>}
    </div>
  );
}
