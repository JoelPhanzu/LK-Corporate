import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";

/**
 * Indicateur du tableau de bord.
 *
 * Le nombre est en chiffres tabulaires pour que les colonnes restent alignées
 * quelle que soit la valeur. Une valeur `null` signale une donnée non
 * récupérable, distincte d'un vrai zéro.
 */
export function CarteStatistique({
  libelle,
  valeur,
  href,
  Icone,
}: {
  libelle: string;
  valeur: number | null;
  href: string;
  Icone: Icon;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-brand border border-line p-5 transition-colors hover:border-ink-muted"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-ink-muted">
        <Icone size={18} aria-hidden />
        {libelle}
      </span>
      <span className="mt-3 text-3xl font-bold tabular-nums">
        {valeur === null ? (
          <span className="text-lg font-medium text-ink-muted">
            Indisponible
          </span>
        ) : (
          valeur
        )}
      </span>
    </Link>
  );
}
