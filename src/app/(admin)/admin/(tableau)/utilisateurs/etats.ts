/**
 * Type et état initial du formulaire de création de compte.
 * Séparés de `actions.ts` : un fichier « use server » ne peut exporter que des
 * fonctions asynchrones.
 */
export type EtatUtilisateur =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string }
  | { statut: "succes"; message: string };

export const ETAT_UTILISATEUR_INITIAL: EtatUtilisateur = { statut: "inactif" };
