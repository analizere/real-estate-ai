import { cn } from "@/lib/utils";

type ContainerProps = {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
};

const sizeMap = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-7xl",
};

export function Container({ size = "md", children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto", sizeMap[size], className)}>
      {children}
    </div>
  );
}
