"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererReference } from "@/lib/reference";
import { BUCKET_PIECES, creerClientAdmin } from "@/lib/supabase/admin";
import { PIECE_JOINTE, schemaDevisComplet } from "@/lib/validations/devis";
import type { EtatDevis } from "./etats";

/** Normalise une valeur de FormData en chaîne exploitable. */
function texte(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur : "";
}

/**
 * Enregistre une demande de devis ou de commande.
 *
 * Une Server Action est joignable par POST direct, hors interface : toutes les
 * validations ci-dessous sont donc rejouées côté serveur, sans jamais faire
 * confiance à ce que le navigateur a déjà contrôlé.
 */
export async function envoyerDevis(
  _precedent: EtatDevis,
  donnees: FormData,
): Promise<EtatDevis> {
  // Piège à robots : ce champ est masqué et doit rester vide. On répond un
  // succès neutre pour ne pas renseigner l'émetteur sur le filtrage.
  if (texte(donnees, "site_web").trim() !== "") {
    return { statut: "succes", reference: "LK-000000" };
  }

  const resultat = schemaDevisComplet.safeParse({
    nom: texte(donnees, "nom"),
    email: texte(donnees, "email"),
    telephone: texte(donnees, "telephone"),
    entreprise: texte(donnees, "entreprise"),
    domaineSlug: texte(donnees, "domaineSlug"),
    description: texte(donnees, "description"),
    budget: texte(donnees, "budget"),
    delaiSouhaite: texte(donnees, "delaiSouhaite"),
    adresseLivraison: texte(donnees, "adresseLivraison"),
  });

  if (!resultat.success) {
    const champs: Record<string, string> = {};
    for (const probleme of resultat.error.issues) {
      const cle = probleme.path[0];
      if (typeof cle === "string" && !champs[cle]) {
        champs[cle] = probleme.message;
      }
    }
    return {
      statut: "erreur",
      message: "Certains champs doivent être corrigés.",
      champs,
    };
  }

  const valeurs = resultat.data;

  // ------------------------------------------------------ pièces jointes
  const fichiers = donnees
    .getAll("pieces")
    .filter((piece): piece is File => piece instanceof File && piece.size > 0);

  if (fichiers.length > PIECE_JOINTE.nombreMax) {
    return {
      statut: "erreur",
      message: `Vous pouvez joindre ${PIECE_JOINTE.nombreMax} fichiers au maximum.`,
    };
  }

  for (const fichier of fichiers) {
    if (fichier.size > PIECE_JOINTE.tailleMaxOctets) {
      return {
        statut: "erreur",
        message: `« ${fichier.name} » dépasse 10 Mo.`,
      };
    }
    if (
      !PIECE_JOINTE.typesAcceptes.includes(
        fichier.type as (typeof PIECE_JOINTE.typesAcceptes)[number],
      )
    ) {
      return {
        statut: "erreur",
        message: `« ${fichier.name} » n'est pas dans un format accepté (JPG, PNG, WebP ou PDF).`,
      };
    }
  }

  // Les fichiers partent AVANT l'écriture en base : en cas d'échec du dépôt,
  // aucune demande incomplète n'est créée. À l'inverse, un échec en base ne
  // laisse que des fichiers orphelins, sans conséquence fonctionnelle.
  const piecesDeposees: {
    chemin: string;
    nomFichier: string;
    contentType: string;
    tailleOctets: number;
  }[] = [];

  if (fichiers.length > 0) {
    try {
      const supabase = creerClientAdmin();
      const dossier = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      for (const fichier of fichiers) {
        const chemin = `${dossier}/${fichier.name}`;
        const { error } = await supabase.storage
          .from(BUCKET_PIECES)
          .upload(chemin, fichier, { contentType: fichier.type, upsert: false });

        if (error) throw error;

        piecesDeposees.push({
          chemin,
          nomFichier: fichier.name,
          contentType: fichier.type,
          tailleOctets: fichier.size,
        });
      }
    } catch (erreur) {
      console.error("Dépôt des pièces jointes impossible", erreur);
      return {
        statut: "erreur",
        message:
          "Vos fichiers n'ont pas pu être envoyés. Réessayez, ou envoyez la demande sans pièce jointe.",
      };
    }
  }

  // ------------------------------------------------------ écriture en base
  // La référence est tirée au hasard : en cas de collision sur la contrainte
  // d'unicité, on retente plutôt que de laisser échouer la demande.
  for (let tentative = 0; tentative < 5; tentative++) {
    try {
      const reference = genererReference();

      await prisma.demande.create({
        data: {
          reference,
          domaineSlug: valeurs.domaineSlug,
          description: valeurs.description,
          budget: valeurs.budget || null,
          delaiSouhaite: valeurs.delaiSouhaite || null,
          adresseLivraison: valeurs.adresseLivraison || null,
          lead: {
            create: {
              nom: valeurs.nom,
              email: valeurs.email || null,
              telephone: valeurs.telephone || null,
              entreprise: valeurs.entreprise || null,
            },
          },
          // Créée dès le départ pour que le visiteur voie « Reçue » sur la
          // page de suivi sans attendre une action de l'équipe.
          livraison: {
            create: {
              etapes: {
                create: {
                  statut: "RECUE",
                  commentaire: "Demande reçue par LK-CORPORATE.",
                },
              },
            },
          },
          pieces: piecesDeposees.length
            ? { createMany: { data: piecesDeposees } }
            : undefined,
        },
      });

      return { statut: "succes", reference };
    } catch (erreur) {
      const collision =
        erreur instanceof Prisma.PrismaClientKnownRequestError &&
        erreur.code === "P2002";
      if (collision) continue;

      console.error("Enregistrement de la demande impossible", erreur);
      return {
        statut: "erreur",
        message:
          "Votre demande n'a pas pu être enregistrée. Réessayez dans un instant.",
      };
    }
  }

  return {
    statut: "erreur",
    message:
      "Votre demande n'a pas pu être enregistrée. Réessayez dans un instant.",
  };
}
