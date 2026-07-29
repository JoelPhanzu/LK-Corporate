"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CODES_LANGUES,
  ETIQUETTES_HREFLANG,
  LANGUES,
  NOMS_LANGUES,
  chemin,
  cheminSansLangue,
  type Langue,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Choix de la langue.
 *
 * Des liens, pas des boutons : changer de langue change d'URL, et un lien reste
 * explorable par les moteurs, ouvrable dans un nouvel onglet et partageable.
 * Un gestionnaire JavaScript perdrait ces trois propriétés.
 *
 * Le chemin courant est conservé : depuis `/fr/services`, le lien anglais mène
 * à `/en/services` et non à l'accueil, ce qui obligerait à refaire le chemin.
 */
export function SelecteurLangue({
  langue,
  titre,
  compact = false,
}: {
  langue: Langue;
  titre: string;
  /**
   * Version réduite de l'en-tête : codes à deux lettres et pas d'intitulé,
   * pour tenir sur la barre de menu sans la faire passer sur deux lignes.
   */
  compact?: boolean;
}) {
  const pathname = usePathname();
  const cheminNu = cheminSansLangue(pathname);

  return (
    <nav aria-label={titre} className="min-w-0">
      {!compact && (
        <p className="text-sm font-semibold text-ink-on-brand">{titre}</p>
      )}

      <ul
        className={cn(
          "inline-flex rounded-brand border border-white/15 p-0.5",
          !compact && "mt-3",
        )}
      >
        {LANGUES.map((valeur) => {
          const actif = valeur === langue;

          return (
            <li key={valeur}>
              <Link
                href={chemin(valeur, cheminNu)}
                hrefLang={ETIQUETTES_HREFLANG[valeur]}
                // `aria-current` plutôt qu'un simple style : sans lui, rien
                // n'indique la langue active à un lecteur d'écran.
                aria-current={actif ? "true" : undefined}
                className={cn(
                  "inline-flex items-center rounded-brand text-xs font-medium transition-colors",
                  compact ? "px-2 py-1" : "px-3 py-1.5",
                  actif
                    ? "bg-white/15 text-ink-on-brand"
                    : "text-ink-on-brand-muted hover:text-ink-on-brand",
                )}
              >
                {compact ? CODES_LANGUES[valeur] : NOMS_LANGUES[valeur]}
                {compact && (
                  <span className="sr-only"> : {NOMS_LANGUES[valeur]}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
