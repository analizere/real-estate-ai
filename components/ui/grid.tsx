import { cn } from "@/lib/utils";

type GridProps = {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
};

const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

export function Grid({ cols = 1, children, className }: GridProps) {
  return (
    <div className={cn("grid gap-4", colsMap[cols], className)}>
      {children}
    </div>
  );
}
