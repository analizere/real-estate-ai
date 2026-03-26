import { cn } from "@/lib/utils";

type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main className={cn("px-4 py-8 md:px-6 lg:px-8 max-w-7xl mx-auto", className)}>
      {children}
    </main>
  );
}
