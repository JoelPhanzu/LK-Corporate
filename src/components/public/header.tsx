"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NAV_PUBLIC } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Composant client dans son ensemble : il lui faut `usePathname` pour l'état
 * actif et un état local pour le menu mobile. Il reste léger et sans animation
 * coûteuse, le coût d'hydratation est donc négligeable.
 *
 * « Accueil » est absent de la navigation desktop : le logo assure ce rôle, et
 * cela permet aux cinq entrées restantes de tenir sur une seule ligne dès
 * 1024px. Le menu mobile, lui, liste bien toutes les entrées.
 */
export function Header() {
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

  const estActif = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-surface-brand border-b border-white/10">
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Logo surMarque />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_PUBLIC.filter((item) => item.href !== "/").map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
            <LienBouton href="/devis" className="hidden sm:inline-flex">
              Demander un devis
            </LienBouton>

            <button
              type="button"
              onClick={() => setOuvert((v) => !v)}
              aria-expanded={ouvert}
              aria-controls="menu-mobile"
              aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-brand text-ink-on-brand hover:bg-white/10 transition-colors"
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
          className="lg:hidden border-t border-white/10 bg-surface-brand-deep"
        >
          <Container>
            <nav aria-label="Navigation principale mobile" className="py-4">
              <ul className="flex flex-col">
                {NAV_PUBLIC.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
              <LienBouton
                href="/devis"
                onClick={fermer}
                className="mt-5 w-full sm:hidden"
              >
                Demander un devis
              </LienBouton>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
