/**
 * Types du chat visiteur.
 * Séparés de `actions.ts` : un fichier « use server » ne peut exporter que des
 * fonctions asynchrones.
 */

export type MessageChat = {
  id: string;
  contenu: string;
  /** true quand le message vient de LK-CORPORATE, false quand il vient du visiteur. */
  deLEquipe: boolean;
  /** Date ISO : les objets Date ne traversent pas proprement la frontière serveur. */
  creeLe: string;
};

export type EtatChat =
  | { statut: "ok"; jeton: string; messages: MessageChat[] }
  | { statut: "erreur"; message: string };

/** Clé de stockage local du jeton de conversation. */
export const CLE_JETON = "lk-chat-jeton";
