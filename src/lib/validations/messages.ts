/**
 * Messages d'erreur des formulaires publics.
 *
 * Le type est décrit ici plutôt qu'importé du dictionnaire : `lib/dictionnaire`
 * est `server-only`, or `validations/devis` est aussi importé par un composant
 * client, qui y lit les contraintes de pièces jointes. Décrire la forme
 * attendue garde ces schémas utilisables des deux côtés ; le contrôle que les
 * dictionnaires la respectent se fait à la compilation, au point d'appel.
 */
export type MessagesValidation = {
  champsACorriger: string;
  nomRequis: string;
  nomLong: string;
  emailRequis: string;
  emailInvalide: string;
  telephoneLong: string;
  sujetRequis: string;
  sujetLong: string;
  messageCourt: string;
  messageLong: string;
  domaineRequis: string;
  descriptionCourte: string;
  descriptionLongue: string;
  contactRequis: string;
  jetonInvalide: string;
  messageVide: string;
  messageTropLong: string;
  conversationIntrouvable: string;
  filEchec: string;
  contactEchec: string;
  devisEchec: string;
  piecesEchec: string;
};
