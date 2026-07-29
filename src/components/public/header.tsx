"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { SelecteurLangue } from "@/components/preferences/selecteur-langue";
import {
  SelecteurTheme,
  type LibellesTheme,
} from "@/components/theme/selecteur-theme";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { chemin, type Langue } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Composant client dans son ensemble : il lui faut `usePathname` pour l'état
 * actif et un état local pour le menu mobile. Il reste léger et sans animation
 * coûteuse, le coût d'hydratation est donc négligeable.
 *
 * Les libellés arrivent en props : le dictionnaire est `server-only`, l'importer
 * ici embarquerait les deux langues dans le bundle du navigateur.
 *
 * « Accueil » est absent de la navigation desktop : le logo assure ce rôle, et
 * cela permet aux cinq entrées restantes de tenir sur une seule ligne dès
 * 1024px. Le menu mobile, lui, liste bien toutes les entrées.
 */
export type EntreeNav = { href: string; label: string };

export function Header({
  langue,
  entrees,
  libelles,
  preferences,
}: {
  langue: Langue;
  entrees: EntreeNav[];
  libelles: {
    principale: string;
    principaleMobile: string;
    ouvrirMenu: string;
    fermerMenu: string;
    devis: string;
  };
  preferences: {
    langue: string;
    theme: LibellesTheme;
  };
}) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);

  // La fermeture après navigation est déclenchée par le clic sur le lien, et
  // non par un effet observant l'URL : passer par un effet provoquerait un
  // rendu en cascade à chaque changement de page.
  const fermer = () => setOuvert(false);

  // Échap referme le panneau, et le corps ne défile pas derrière lui.
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  // La comparaison porte sur le chemin préfixé : `/fr/services` et
  // `/en/services` sont deux pages distinctes.
  const estActif = (href: string) => {
    const complet = chemin(langue, href);
    return href === "/" ? pathname === complet : pathname.startsWith(complet);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-brand border-b border-white/10">
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Logo surMarque langue={langue} />

          <nav aria-label={libelles.principale} className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {entrees
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={chemin(langue, item.href)}
                      aria-current={estActif(item.href) ? "page" : undefined}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        estActif(item.href)
                          ? "text-accent-on-brand"
                          : "text-ink-on-brand-muted hover:text-ink-on-brand",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/* Raccourcis de préférences. Ils n'apparaissent qu'à partir de
                `xl` : avec eux, le verrou, cinq entrées de menu et le bouton
                d'appel ne tiennent plus sur une ligne à 1024px. En dessous,
                c'est le panneau mobile qui les porte, d'où le même seuil sur
                la navigation et sur le bouton d'ouverture. */}
            <div className="hidden items-center gap-2 xl:flex">
              <SelecteurLangue
                langue={langue}
                titre={preferences.langue}
                compact
              />
              <SelecteurTheme libelles={preferences.theme} compact />
            </div>

            <LienBouton
              href={chemin(langue, "/devis")}
              className="hidden sm:inline-flex"
            >
              {libelles.devis}
            </LienBouton>

            <button
              type="button"
              onClick={() => setOuvert((v) => !v)}
              aria-expanded={ouvert}
              aria-controls="menu-mobile"
              aria-label={ouvert ? libelles.fermerMenu : libelles.ouvrirMenu}
              className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-brand text-ink-on-brand hover:bg-white/10 transition-colors"
            >
              {ouvert ? (
                <XIcon size={24} weight="bold" />
              ) : (
                <ListIcon size={24} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {ouvert && (
        <div
          id="menu-mobile"
          className="xl:hidden border-t border-white/10 bg-surface-brand-deep"
        >
          <Container>
            <nav aria-label={libelles.principaleMobile} className="py-4">
              <ul className="flex flex-col">
                {entrees.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={chemin(langue, item.href)}
                      onClick={fermer}
                      aria-current={estActif(item.href) ? "page" : undefined}
                      className={cn(
                        "block py-3 text-base font-medium border-b border-white/10",
                        estActif(item.href)
                          ? "text-accent-on-brand"
                          : "text-ink-on-brand",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Raccourcis juste sous la liste du menu, avant l'appel à
                  l'action : ils relèvent du réglage, pas de la navigation. */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
                <SelecteurLangue
                  langue={langue}
                  titre={preferences.langue}
                  compact
                />
                <SelecteurTheme libelles={preferences.theme} compact />
              </div>

              <LienBouton
                href={chemin(langue, "/devis")}
                onClick={fermer}
                className="mt-5 w-full sm:hidden"
              >
                {libelles.devis}
              </LienBouton>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
