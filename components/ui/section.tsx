import { cn } from "@/lib/utils";

type SectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
