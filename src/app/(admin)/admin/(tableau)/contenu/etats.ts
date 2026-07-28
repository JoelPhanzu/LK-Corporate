/**
 * Type et état initial du formulaire de contenu du site.
 * Séparés de `actions.ts` : un fichier « use server » ne peut exporter que des
 * fonctions asynchrones.
 */
export type EtatContenu =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string }
  | { statut: "succes"; message: string };

export const ETAT_CONTENU_INITIAL: EtatContenu = { statut: "inactif" };
