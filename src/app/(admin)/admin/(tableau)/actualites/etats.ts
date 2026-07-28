/**
 * Type et état initial du formulaire d'article.
 * Séparés de `actions.ts` : un fichier « use server » ne peut exporter que des
 * fonctions asynchrones.
 */
export type EtatArticle =
  | { statut: "inactif" }
  | { statut: "erreur"; message: string; champs?: Record<string, string> };

export const ETAT_ARTICLE_INITIAL: EtatArticle = { statut: "inactif" };
