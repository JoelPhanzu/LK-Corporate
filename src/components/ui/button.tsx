import Link from "next/link";
import { cn } from "@/lib/utils";

type Variante = "primaire" | "secondaire" | "surMarque";

/**
 * Contraste vérifié pour chaque variante :
 * - primaire   : blanc sur aplat rouge de marque, 5.7:1 (AA)
 * - secondaire : encre principale sur surface claire, 14:1
 * - surMarque  : blanc sur bleu marine, 14:1
 * Le rouge n'est jamais utilisé comme couleur de texte sur un aplat marine
 * (2.5:1) : c'est le rôle de `accent-on-brand`, le rose du logo.
 */
const VARIANTES: Record<Variante, string> = {
  primaire: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondaire:
    "border border-line-strong text-ink hover:border-ink hover:bg-surface-sunken",
  surMarque:
    "border border-white/40 text-ink-on-brand hover:border-white hover:bg-white/10",
};

const BASE = [
  "inline-flex items-center justify-center gap-2",
  "h-11 px-5 rounded-brand",
  "text-sm font-semibold tracking-wide",
  // Empêche un libellé de CTA de passer sur deux lignes.
  "whitespace-nowrap",
  "transition-colors duration-200",
  // Retour tactile : le bouton s'enfonce légèrement au clic.
  "active:translate-y-px",
].join(" ");

type Commun = {
  variante?: Variante;
  className?: string;
  children: React.ReactNode;
};

type BoutonProps = Commun &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Bouton({
  variante = "primaire",
  className,
  children,
  ...props
}: BoutonProps) {
  return (
    <button
      className={cn(BASE, VARIANTES[variante], "disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}

type LienBoutonProps = Commun & {
  href: string;
  /** Permet par exemple de refermer le menu mobile au moment de la navigation. */
  onClick?: () => void;
};

export function LienBouton({
  variante = "primaire",
  className,
  href,
  onClick,
  children,
}: LienBoutonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(BASE, VARIANTES[variante], className)}
    >
      {children}
    </Link>
  );
}
