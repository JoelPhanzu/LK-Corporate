/**
 * Transforme un titre en identifiant d'URL.
 * Les accents sont décomposés puis retirés, afin que « Réfection d'un pont »
 * donne « refection-d-un-pont » et non une URL encodée illisible.
 */
export function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    // Plage des diacritiques combinants, en échappements explicites : les
    // écrire littéralement les rendrait invisibles et fragiles à l'édition.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Rend un slug unique en lui ajoutant un suffixe numéroté si nécessaire.
 * `existe` interroge la table concernée, ce qui rend la fonction réutilisable
 * pour les articles comme pour les réalisations.
 */
export async function slugUnique(
  base: string,
  existe: (slug: string) => Promise<boolean>,
): Promise<string> {
  const racine = base || "article";
  if (!(await existe(racine))) return racine;

  for (let suffixe = 2; suffixe < 100; suffixe++) {
    const candidat = `${racine}-${suffixe}`;
    if (!(await existe(candidat))) return candidat;
  }

  return `${racine}-${Date.now()}`;
}
