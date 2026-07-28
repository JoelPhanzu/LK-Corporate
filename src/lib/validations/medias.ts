/**
 * Contraintes des visuels éditoriaux.
 *
 * Placées dans un module neutre (ni « server-only » ni « use client ») car
 * elles servent des deux côtés : le formulaire s'en sert pour l'attribut
 * `accept` et le texte d'aide, le serveur pour la validation qui fait foi.
 */
export const IMAGE = {
  tailleMaxOctets: 5 * 1024 * 1024,
  typesAcceptes: ["image/jpeg", "image/png", "image/webp"] as const,
};
