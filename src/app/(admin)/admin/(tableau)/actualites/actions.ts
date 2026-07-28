"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugifier, slugUnique } from "@/lib/slug";
import { deposerImage } from "@/lib/upload";
import { schemaArticle } from "@/lib/validations/article";
import type { EtatArticle } from "./etats";

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/** Rafraîchit les vues publiques et privées touchées par un article. */
function revaliderArticle(slug?: string) {
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  if (slug) revalidatePath(`/actualites/${slug}`);
}

/**
 * Crée ou met à jour un article selon la présence d'un identifiant.
 *
 * Le slug est figé à la création : le modifier ensuite casserait les liens
 * déjà partagés et l'indexation acquise par l'article.
 */
export async function enregistrerArticle(
  _precedent: EtatArticle,
  donnees: FormData,
): Promise<EtatArticle> {
  const session = await exigerAdmin();

  const id = chaine(donnees, "id");
  const resultat = schemaArticle.safeParse({
    titre: chaine(donnees, "titre"),
    chapo: chaine(donnees, "chapo"),
    contenu: chaine(donnees, "contenu"),
  });

  if (!resultat.success) {
    const champs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const cle = probleme.path[0];
      if (typeof cle === "string" && !champs[cle]) champs[cle] = probleme.message;
    }
    return { statut: "erreur", message: "Certains champs doivent être corrigés.", champs };
  }

  const fichier = donnees.get("image");
  let imageChemin: string | null = null;

  try {
    imageChemin = await deposerImage(
      fichier instanceof File ? fichier : null,
      "articles",
    );
  } catch (erreur) {
    console.error("Dépôt de l'image impossible", erreur);
    return {
      statut: "erreur",
      message:
        erreur instanceof Error
          ? erreur.message
          : "L'image n'a pas pu être envoyée.",
    };
  }

  let slug: string;

  try {
    if (id) {
      const article = await prisma.article.update({
        where: { id },
        data: {
          ...resultat.data,
          // Une image absente du formulaire signifie « ne pas changer »,
          // et non « supprimer l'illustration existante ».
          ...(imageChemin ? { imageChemin } : {}),
        },
        select: { slug: true },
      });
      slug = article.slug;
    } else {
      slug = await slugUnique(
        slugifier(resultat.data.titre),
        async (candidat) =>
          (await prisma.article.count({ where: { slug: candidat } })) > 0,
      );

      await prisma.article.create({
        data: {
          ...resultat.data,
          slug,
          imageChemin,
          auteurId: session.id,
        },
      });
    }
  } catch (erreur) {
    console.error("Enregistrement de l'article impossible", erreur);
    return {
      statut: "erreur",
      message: "L'article n'a pas pu être enregistré. Réessayez dans un instant.",
    };
  }

  revaliderArticle(slug);
  // Hors du try : redirect() lève une exception de contrôle de flux.
  redirect("/admin/actualites");
}

/**
 * Publie ou dépublie un article.
 * `publieLe` n'est renseigné qu'à la première publication, pour que la date
 * affichée reste celle de la parution d'origine.
 */
export async function basculerPublication(donnees: FormData) {
  await exigerAdmin();

  const id = chaine(donnees, "id");
  if (!id) return;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { publie: true, publieLe: true, slug: true },
  });
  if (!article) return;

  const publier = !article.publie;

  await prisma.article.update({
    where: { id },
    data: {
      publie: publier,
      publieLe: publier ? (article.publieLe ?? new Date()) : article.publieLe,
    },
  });

  revaliderArticle(article.slug);
}

export async function supprimerArticle(donnees: FormData) {
  await exigerAdmin();

  const id = chaine(donnees, "id");
  if (!id) return;

  const article = await prisma.article.delete({
    where: { id },
    select: { slug: true },
  });

  revaliderArticle(article.slug);
}
