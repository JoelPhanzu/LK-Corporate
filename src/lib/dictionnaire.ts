import "server-only";
import type { Langue } from "@/lib/i18n";
import fr from "@/dictionnaires/fr.json";
import en from "@/dictionnaires/en.json";

/**
 * Chargement des traductions de l'interface publique.
 *
 * `server-only` empêche qu'un composant client importe ce module : les deux
 * dictionnaires partiraient alors dans le bundle du navigateur, dont l'un
 * inutile. Les composants client reçoivent les libellés dont ils ont besoin
 * en props, depuis un composant serveur.
 *
 * Le français fait référence : le type du dictionnaire en est déduit, si bien
 * qu'une clé ajoutée en français et oubliée en anglais casse la compilation
 * plutôt que de passer en production.
 */

export type Dictionnaire = typeof fr;

// Contrôle de complétude à la compilation. Sans cette ligne, `en.json`
// pourrait diverger de `fr.json` sans que rien ne le signale.
const anglais: Dictionnaire = en;

const DICTIONNAIRES: Record<Langue, Dictionnaire> = {
  fr,
  en: anglais,
};

export function getDictionnaire(langue: Langue): Dictionnaire {
  return DICTIONNAIRES[langue];
}
