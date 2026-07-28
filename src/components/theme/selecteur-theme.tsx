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

const OPTIONS: {
  valeur: PreferenceTheme;
  label: string;
  Icone: typeof SunIcon;
}[] = [
  { valeur: "clair", label: "Clair", Icone: SunIcon },
  { valeur: "sombre", label: "Sombre", Icone: MoonIcon },
  { valeur: "appareil", label: "Appareil", Icone: DesktopIcon },
];

/**
 * Choix du thème : clair, sombre, ou celui de l'appareil.
 *
 * Groupe de boutons radio plutôt qu'une bascule à deux états : « appareil »
 * n'est pas un troisième thème mais l'absence de choix, et une bascule ne
 * permettrait pas d'y revenir une fois qu'on l'a quittée.
 */
export function SelecteurTheme({ className }: { className?: string }) {
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
      <legend className="text-sm font-semibold text-ink-on-brand">Thème</legend>

      <div className="mt-3 inline-flex rounded-brand border border-white/15 p-0.5">
        {OPTIONS.map(({ valeur, label, Icone }) => {
          const actif = preference === valeur;

          return (
            <label
              key={valeur}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-brand px-2.5 py-1.5",
                "text-xs font-medium transition-colors",
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
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
