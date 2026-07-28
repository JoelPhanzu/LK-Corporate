"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { schemaJeton, schemaMessage } from "@/lib/validations/chat";
import type { EtatChat, MessageChat } from "./etats";

/**
 * Le fil d'un visiteur est protégé par son jeton, pas par un compte.
 *
 * Le jeton est un UUID tiré côté serveur, stocké par le navigateur du
 * visiteur, et jamais déductible d'une donnée publique. C'est le même modèle
 * que la référence de suivi de commande : pas de mot de passe à retenir, mais
 * un secret suffisamment long pour ne pas être deviné.
 */

function serialiser(messages: {
  id: string;
  contenu: string;
  expediteur: "VISITEUR" | "EQUIPE";
  creeLe: Date;
}[]): MessageChat[] {
  return messages.map((message) => ({
    id: message.id,
    contenu: message.contenu,
    deLEquipe: message.expediteur === "EQUIPE",
    creeLe: message.creeLe.toISOString(),
  }));
}

/**
 * Ouvre un fil si nécessaire et y ajoute un message du visiteur.
 * Retourne le jeton, que le client conserve pour retrouver sa conversation.
 */
export async function envoyerMessageVisiteur(
  jetonExistant: string | null,
  texte: string,
  identite?: { nom: string; email: string },
): Promise<EtatChat> {
  const contenu = schemaMessage.safeParse(texte);
  if (!contenu.success) {
    return { statut: "erreur", message: contenu.error.issues[0].message };
  }

  try {
    let jeton = jetonExistant;

    if (jeton) {
      const valide = schemaJeton.safeParse(jeton);
      if (!valide.success) jeton = null;
    }

    let conversation = jeton
      ? await prisma.conversation.findUnique({
          where: { jetonVisiteur: jeton },
          select: { id: true },
        })
      : null;

    if (!conversation) {
      jeton = randomUUID();
      conversation = await prisma.conversation.create({
        data: {
          jetonVisiteur: jeton,
          visiteurNom: identite?.nom || null,
          visiteurEmail: identite?.email || null,
        },
        select: { id: true },
      });
    } else if (identite?.nom) {
      // Le visiteur peut se présenter après coup.
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          visiteurNom: identite.nom,
          visiteurEmail: identite.email || null,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        contenu: contenu.data,
        expediteur: "VISITEUR",
        luParEquipe: false,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { dernierMessageLe: new Date(), ouverte: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { creeLe: "asc" },
      take: 200,
      select: { id: true, contenu: true, expediteur: true, creeLe: true },
    });

    // Fait apparaître la pastille « non lus » du tableau de bord sans attendre.
    revalidatePath("/admin/discussions");
    revalidatePath("/admin");

    return { statut: "ok", jeton: jeton!, messages: serialiser(messages) };
  } catch (erreur) {
    console.error("Envoi du message visiteur impossible", erreur);
    return {
      statut: "erreur",
      message: "Votre message n'a pas pu être envoyé. Réessayez dans un instant.",
    };
  }
}

/** Recharge le fil d'un visiteur à partir de son jeton. */
export async function chargerFil(jeton: string): Promise<EtatChat> {
  const valide = schemaJeton.safeParse(jeton);
  if (!valide.success) {
    return { statut: "erreur", message: "Conversation introuvable." };
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { jetonVisiteur: valide.data },
      select: {
        id: true,
        messages: {
          orderBy: { creeLe: "asc" },
          take: 200,
          select: { id: true, contenu: true, expediteur: true, creeLe: true },
        },
      },
    });

    if (!conversation) {
      return { statut: "erreur", message: "Conversation introuvable." };
    }

    return {
      statut: "ok",
      jeton: valide.data,
      messages: serialiser(conversation.messages),
    };
  } catch (erreur) {
    console.error("Chargement du fil impossible", erreur);
    return {
      statut: "erreur",
      message: "La discussion n'a pas pu être chargée.",
    };
  }
}
