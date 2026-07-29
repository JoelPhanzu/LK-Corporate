"use client";

import { useEffect, useState } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import {
  CLE_THEME,
  PREFERENCE_PAR_DEFAUT,
  REQUETE_SOMBRE,
  estPreference,
  resoudre,
  type PreferenceTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const ICONES: Record<PreferenceTheme, typeof SunIcon> = {
  clair: SunIcon,
  sombre: MoonIcon,
  appareil: DesktopIcon,
};

/** Libellés traduits, fournis par un composant serveur. */
export type LibellesTheme = {
  titre: string;
  clair: string;
  sombre: string;
  appareil: string;
};

/**
 * Choix du thème : clair, sombre, ou celui de l'appareil.
 *
 * Groupe de boutons radio plutôt qu'une bascule à deux états : « appareil »
 * n'est pas un troisième thème mais l'absence de choix, et une bascule ne
 * permettrait pas d'y revenir une fois qu'on l'a quittée.
 */
export function SelecteurTheme({
  libelles,
  compact = false,
  className,
}: {
  libelles: LibellesTheme;
  /**
   * Version réduite de l'en-tête : icônes seules, l'intitulé passant en
   * étiquette accessible. La place manque sur la barre de menu.
   */
  compact?: boolean;
  className?: string;
}) {
  const options: { valeur: PreferenceTheme; label: string }[] = [
    { valeur: "clair", label: libelles.clair },
    { valeur: "sombre", label: libelles.sombre },
    { valeur: "appareil", label: libelles.appareil },
  ];

  // L'initialiseur paresseux lit la même source que le script de <head>, si
  // bien que l'état de React s'accorde d'emblée au DOM déjà corrigé.
  const [preference, setPreference] = useState<PreferenceTheme>(() => {
    if (typeof window === "undefined") return PREFERENCE_PAR_DEFAUT;
    const enregistree = window.localStorage.getItem(CLE_THEME);
    return estPreference(enregistree) ? enregistree : PREFERENCE_PAR_DEFAUT;
  });

  // Applique la préférence et la conserve. Le script de <head> ne couvre que
  // le chargement initial ; c'est ici que se répercute un changement.
  useEffect(() => {
    const media = window.matchMedia(REQUETE_SOMBRE);

    const appliquer = () => {
      document.documentElement.setAttribute(
        "data-theme",
        resoudre(preference, media.matches),
      );
    };

    appliquer();

    try {
      window.localStorage.setItem(CLE_THEME, preference);
    } catch {
      // Stockage indisponible : le choix ne vaudra que pour cette visite.
    }

    // Sur « appareil », le thème doit suivre l'appareil en direct, y compris
    // quand celui-ci bascule tout seul à la tombée de la nuit.
    if (preference !== "appareil") return;
    media.addEventListener("change", appliquer);
    return () => media.removeEventListener("change", appliquer);
  }, [preference]);

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend
        className={cn(
          "text-sm font-semibold text-ink-on-brand",
          // En version réduite l'intitulé reste annoncé, mais n'occupe plus
          // de place : la barre de menu doit tenir sur une ligne.
          compact && "sr-only",
        )}
      >
        {libelles.titre}
      </legend>

      <div
        className={cn(
          "inline-flex rounded-brand border border-white/15 p-0.5",
          !compact && "mt-3",
        )}
      >
        {options.map(({ valeur, label }) => {
          const actif = preference === valeur;
          const Icone = ICONES[valeur];

          return (
            <label
              key={valeur}
              title={compact ? label : undefined}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-brand",
                "text-xs font-medium transition-colors",
                compact ? "px-2 py-1.5" : "px-2.5 py-1.5",
                // `focus-within` porte l'anneau : le bouton radio lui-même est
                // masqué visuellement mais reste la cible du clavier.
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]",
                actif
                  ? "bg-white/15 text-ink-on-brand"
                  : "text-ink-on-brand-muted hover:text-ink-on-brand",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={valeur}
                checked={actif}
                onChange={() => setPreference(valeur)}
                className="sr-only"
              />
              <Icone size={15} weight={actif ? "fill" : "regular"} aria-hidden />
              <span className={cn(compact && "sr-only")}>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
