import { cn } from "@/lib/utils";

/** Gouttière et largeur maximale communes à toutes les sections du site. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-8", className)}>
      {children}
    </div>
  );
}
