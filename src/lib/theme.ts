/**
 * Préférence de thème de l'utilisateur.
 *
 * Trois valeurs possibles, mais seulement deux thèmes : « appareil » n'est pas
 * un thème, c'est l'absence de choix, résolue à l'exécution d'après la
 * préférence système. Le CSS ne voit donc jamais que `clair` ou `sombre`.
 */

export const PREFERENCES_THEME = ["appareil", "clair", "sombre"] as const;

export type PreferenceTheme = (typeof PREFERENCES_THEME)[number];
export type ThemeResolu = "clair" | "sombre";

export const CLE_THEME = "lk-theme";
export const PREFERENCE_PAR_DEFAUT: PreferenceTheme = "appareil";

export const REQUETE_SOMBRE = "(prefers-color-scheme: dark)";

export function estPreference(valeur: unknown): valeur is PreferenceTheme {
  return PREFERENCES_THEME.includes(valeur as PreferenceTheme);
}

export function resoudre(
  preference: PreferenceTheme,
  systemeSombre: boolean,
): ThemeResolu {
  if (preference === "appareil") return systemeSombre ? "sombre" : "clair";
  return preference;
}

/**
 * Script exécuté pendant l'analyse du HTML, avant la première peinture.
 *
 * Il pose `data-theme` sur <html> à partir de la préférence enregistrée. Sans
 * lui, la page s'afficherait d'abord en clair puis basculerait une fois React
 * hydraté : un `useEffect` s'exécute après la peinture, trop tard.
 *
 * Le `try/catch` couvre les navigations où `localStorage` est inaccessible
 * (navigation privée verrouillée, cookies tiers bloqués). L'attribut reste
 * alors absent, et globals.css retombe sur la préférence système via sa
 * media query.
 */
export const SCRIPT_THEME = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  CLE_THEME,
)})||${JSON.stringify(PREFERENCE_PAR_DEFAUT)};var s=window.matchMedia(${JSON.stringify(
  REQUETE_SOMBRE,
)}).matches;document.documentElement.setAttribute("data-theme",p==="appareil"?(s?"sombre":"clair"):p)}catch(e){}})()`;
