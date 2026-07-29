/**
 * Type et état initial du formulaire de devis.
 *
 * Volontairement séparés de `actions.ts` : un fichier « use server » ne peut
 * exporter que des fonctions asynchrones, jamais une constante.
 */
export type EtatDevis =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string; champs?: Record<string, string> }
  | { statut: "succes"; reference: string };

export const ETAT_DEVIS_INITIAL: EtatDevis = { statut: "inactif" };
