import { prisma } from "@/lib/prisma";
import { CONTACT, RESEAUX } from "@/lib/site";

/** Clé unique sous laquelle les coordonnées sont stockées dans ContenuSite. */
export const CLE_COORDONNEES = "coordonnees";

export type Coordonnees = {
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  pays: string;
  reseaux: { nom: string; url: string }[];
};

/** Valeurs de repli, issues des constantes du code. */
const REPLI: Coordonnees = {
  telephone: CONTACT.telephone,
  email: CONTACT.email,
  adresse: CONTACT.adresse,
  ville: CONTACT.ville,
  pays: CONTACT.pays,
  reseaux: [...RESEAUX],
};

function normaliser(valeur: unknown): Coordonnees {
  if (typeof valeur !== "object" || valeur === null) return REPLI;
  const brut = valeur as Record<string, unknown>;

  const texte = (cle: keyof Coordonnees) =>
    typeof brut[cle] === "string" ? (brut[cle] as string) : REPLI[cle as never];

  const reseaux = Array.isArray(brut.reseaux)
    ? brut.reseaux.filter(
        (r): r is { nom: string; url: string } =>
          typeof r === "object" &&
          r !== null &&
          typeof (r as { nom?: unknown }).nom === "string" &&
          typeof (r as { url?: unknown }).url === "string",
      )
    : REPLI.reseaux;

  return {
    telephone: texte("telephone") as string,
    email: texte("email") as string,
    adresse: texte("adresse") as string,
    ville: texte("ville") as string,
    pays: texte("pays") as string,
    reseaux,
  };
}

/**
 * Coordonnées affichées sur le site public.
 *
 * Lues depuis la base pour que l'équipe puisse les modifier sans développeur.
 * En cas d'absence d'enregistrement ou de base injoignable, on retombe sur les
 * constantes du code : une page de contact dégradée vaut mieux qu'une page en
 * erreur.
 */
export async function getCoordonnees(): Promise<Coordonnees> {
  try {
    const enregistrement = await prisma.contenuSite.findUnique({
      where: { cle: CLE_COORDONNEES },
      select: { valeur: true },
    });
    if (!enregistrement) return REPLI;
    return normaliser(enregistrement.valeur);
  } catch (erreur) {
    console.error("Lecture des coordonnées impossible", erreur);
    return REPLI;
  }
}
