"use server";

import { prisma } from "@/lib/prisma";
import { getDictionnaire } from "@/lib/dictionnaire";
import { LANGUE_PAR_DEFAUT, estLangue } from "@/lib/i18n";
import { schemaContact } from "@/lib/validations/contact";
import type { EtatContact } from "./etats";

function texte(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur : "";
}

/**
 * Enregistre un message du formulaire de contact.
 *
 * Comme toute Server Action, cette fonction est joignable par POST direct :
 * la validation est intégralement rejouée ici.
 */
export async function envoyerContact(
  _precedent: EtatContact,
  donnees: FormData,
): Promise<EtatContact> {
  // Piège à robots : réponse neutre pour ne pas révéler le filtrage.
  if (texte(donnees, "site_web").trim() !== "") {
    return { statut: "succes" };
  }

  // La langue voyage dans le formulaire : une Server Action ne connaît pas
  // l'URL d'où elle est appelée, et c'est elle qui décide de la langue des
  // messages d'erreur renvoyés au visiteur.
  const brut = texte(donnees, "langue");
  const m = getDictionnaire(estLangue(brut) ? brut : LANGUE_PAR_DEFAUT)
    .validation;

  const resultat = schemaContact(m).safeParse({
    nom: texte(donnees, "nom"),
    email: texte(donnees, "email"),
    telephone: texte(donnees, "telephone"),
    sujet: texte(donnees, "sujet"),
    message: texte(donnees, "message"),
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
      message: m.champsACorriger,
      champs,
    };
  }

  try {
    await prisma.messageContact.create({
      data: {
        nom: resultat.data.nom,
        email: resultat.data.email,
        telephone: resultat.data.telephone || null,
        sujet: resultat.data.sujet,
        message: resultat.data.message,
      },
    });
    return { statut: "succes" };
  } catch (erreur) {
    console.error("Enregistrement du message de contact impossible", erreur);
    return {
      statut: "erreur",
      message:
        m.contactEchec,
    };
  }
}
