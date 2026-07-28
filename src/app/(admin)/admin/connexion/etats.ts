/**
 * Type et état initial du formulaire de connexion.
 *
 * Volontairement séparés de `actions.ts` : un fichier « use server » ne peut
 * exporter que des fonctions asynchrones, jamais une constante.
 */
export type EtatConnexion =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string };

export const ETAT_CONNEXION_INITIAL: EtatConnexion = { statut: "inactif" };
