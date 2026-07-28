"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugifier, slugUnique } from "@/lib/slug";
import { deposerImage, deposerImages } from "@/lib/upload";
import { schemaRealisation } from "@/lib/validations/realisation";
import type { EtatRealisation } from "./etats";

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

function fichier(donnees: FormData, cle: string): File | null {
  const valeur = donnees.get(cle);
  return valeur instanceof File && valeur.size > 0 ? valeur : null;
}

function revaliderRealisation(slug?: string) {
  revalidatePath("/admin/realisations");
  revalidatePath("/realisations");
  revalidatePath("/");
  if (slug) revalidatePath(`/realisations/${slug}`);
}

/**
 * Crée ou met à jour une réalisation selon la présence d'un identifiant.
 * Comme pour les articles, le slug est figé à la création afin de ne pas
 * casser les liens déjà partagés.
 */
export async function enregistrerRealisation(
  _precedent: EtatRealisation,
  donnees: FormData,
): Promise<EtatRealisation> {
  await exigerAdmin();

  const id = chaine(donnees, "id");
  const resultat = schemaRealisation.safeParse({
    titre: chaine(donnees, "titre"),
    description: chaine(donnees, "description"),
    localisation: chaine(donnees, "localisation"),
    domaineSlug: chaine(donnees, "domaineSlug"),
    ordre: chaine(donnees, "ordre") || 0,
  });

  if (!resultat.success) {
    const champs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const cle = probleme.path[0];
      if (typeof cle === "string" && !champs[cle]) champs[cle] = probleme.message;
    }
    return {
      statut: "erreur",
      message: "Certains champs doivent être corrigés.",
      champs,
    };
  }

  let photoAvantChemin: string | null = null;
  let photoApresChemin: string | null = null;
  let photosChemins: string[] = [];

  try {
    photoAvantChemin = await deposerImage(fichier(donnees, "photoAvant"), "realisations");
    photoApresChemin = await deposerImage(fichier(donnees, "photoApres"), "realisations");
    photosChemins = await deposerImages(
      donnees
        .getAll("photos")
        .filter((p): p is File => p instanceof File && p.size > 0),
      "realisations",
    );
  } catch (erreur) {
    console.error("Dépôt des visuels impossible", erreur);
    return {
      statut: "erreur",
      message:
        erreur instanceof Error
          ? erreur.message
          : "Les visuels n'ont pas pu être envoyés.",
    };
  }

  const valeurs = {
    titre: resultat.data.titre,
    description: resultat.data.description,
    localisation: resultat.data.localisation || null,
    domaineSlug: resultat.data.domaineSlug,
    ordre: resultat.data.ordre,
  };

  let slug: string;

  try {
    if (id) {
      const realisation = await prisma.realisation.update({
        where: { id },
        data: {
          ...valeurs,
          // Un champ laissé vide signifie « conserver le visuel actuel ».
          ...(photoAvantChemin ? { photoAvantChemin } : {}),
          ...(photoApresChemin ? { photoApresChemin } : {}),
          // Les visuels complémentaires s'ajoutent à ceux déjà présents.
          ...(photosChemins.length ? { photosChemins: { push: photosChemins } } : {}),
        },
        select: { slug: true },
      });
      slug = realisation.slug;
    } else {
      slug = await slugUnique(
        slugifier(valeurs.titre),
        async (candidat) =>
          (await prisma.realisation.count({ where: { slug: candidat } })) > 0,
      );

      await prisma.realisation.create({
        data: {
          ...valeurs,
          slug,
          photoAvantChemin,
          photoApresChemin,
          photosChemins,
        },
      });
    }
  } catch (erreur) {
    console.error("Enregistrement de la réalisation impossible", erreur);
    return {
      statut: "erreur",
      message:
        "La réalisation n'a pas pu être enregistrée. Réessayez dans un instant.",
    };
  }

  revaliderRealisation(slug);
  // Hors du try : redirect() lève une exception de contrôle de flux.
  redirect("/admin/realisations");
}

export async function basculerPublicationRealisation(donnees: FormData) {
  await exigerAdmin();

  const id = chaine(donnees, "id");
  if (!id) return;

  const realisation = await prisma.realisation.findUnique({
    where: { id },
    select: { publie: true, slug: true },
  });
  if (!realisation) return;

  await prisma.realisation.update({
    where: { id },
    data: { publie: !realisation.publie },
  });

  revaliderRealisation(realisation.slug);
}

export async function supprimerRealisation(donnees: FormData) {
  await exigerAdmin();

  const id = chaine(donnees, "id");
  if (!id) return;

  const realisation = await prisma.realisation.delete({
    where: { id },
    select: { slug: true },
  });

  revaliderRealisation(realisation.slug);
}
