"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatCircleIcon,
  FileTextIcon,
  ImagesIcon,
  ListIcon,
  NewspaperIcon,
  SlidersIcon,
  SquaresFourIcon,
  TruckIcon,
  UserGearIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const RUBRIQUES = [
  { href: "/admin", label: "Tableau de bord", Icone: SquaresFourIcon, exact: true },
  { href: "/admin/demandes", label: "Devis et commandes", Icone: FileTextIcon },
  { href: "/admin/logistique", label: "Logistique", Icone: TruckIcon },
  { href: "/admin/discussions", label: "Discussions", Icone: ChatCircleIcon },
  { href: "/admin/leads", label: "Visiteurs", Icone: UsersIcon },
  { href: "/admin/actualites", label: "Actualités", Icone: NewspaperIcon },
  { href: "/admin/realisations", label: "Réalisations", Icone: ImagesIcon },
  { href: "/admin/contenu", label: "Contenu du site", Icone: SlidersIcon },
  { href: "/admin/utilisateurs", label: "Utilisateurs", Icone: UserGearIcon },
];

function Liens({ onNaviguer }: { onNaviguer?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {RUBRIQUES.map(({ href, label, Icone, exact }) => {
        const actif = exact ? pathname === href : pathname.startsWith(href);

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNaviguer}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-medium transition-colors",
                actif
                  ? "bg-accent text-accent-ink"
                  : "text-ink-on-brand-muted hover:bg-white/10 hover:text-ink-on-brand",
              )}
            >
              <Icone size={20} weight={actif ? "fill" : "regular"} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavigationAdmin() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      {/* Barre mobile */}
      <div className="flex items-center justify-between border-b border-white/10 bg-surface-brand px-4 py-3 lg:hidden">
        <Logo surMarque />
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-controls="navigation-admin"
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-brand text-ink-on-brand hover:bg-white/10"
        >
          {ouvert ? (
            <XIcon size={22} weight="bold" />
          ) : (
            <ListIcon size={22} weight="bold" />
          )}
        </button>
      </div>

      {ouvert && (
        <nav
          id="navigation-admin"
          aria-label="Navigation de l'administration"
          className="border-b border-white/10 bg-surface-brand-deep p-4 lg:hidden"
        >
          <Liens onNaviguer={() => setOuvert(false)} />
        </nav>
      )}

      {/* Colonne latérale, à partir de 1024px */}
      <nav
        aria-label="Navigation de l'administration"
        className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface-brand p-4 lg:flex"
      >
        <div className="px-3 py-3">
          <Logo surMarque />
        </div>
        <div className="mt-4">
          <Liens />
        </div>
      </nav>
    </>
  );
}
