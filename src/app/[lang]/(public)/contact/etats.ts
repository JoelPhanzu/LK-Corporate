/**
 * Type et état initial du formulaire de contact.
 *
 * Volontairement séparés de `actions.ts` : un fichier « use server » ne peut
 * exporter que des fonctions asynchrones, jamais une constante.
 */
export type EtatContact =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string; champs?: Record<string, string> }
  | { statut: "succes" };

export const ETAT_CONTACT_INITIAL: EtatContact = { statut: "inactif" };
