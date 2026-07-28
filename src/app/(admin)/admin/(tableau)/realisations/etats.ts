/**
 * Type et état initial du formulaire de réalisation.
 * Séparés de `actions.ts` : un fichier « use server » ne peut exporter que des
 * fonctions asynchrones.
 */
export type EtatRealisation =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string; champs?: Record<string, string> };

export const ETAT_REALISATION_INITIAL: EtatRealisation = { statut: "inactif" };
