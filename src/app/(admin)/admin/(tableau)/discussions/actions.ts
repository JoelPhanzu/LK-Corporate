"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/** Envoie une réponse de l'équipe dans un fil de discussion. */
export async function repondre(donnees: FormData) {
  const session = await exigerAdmin();

  const conversationId = chaine(donnees, "conversationId");
  const contenu = chaine(donnees, "contenu");
  if (!conversationId || !contenu) return;

  await prisma.message.create({
    data: {
      conversationId,
      contenu,
      expediteur: "EQUIPE",
      auteurId: session.id,
      // Un message de l'équipe n'a pas à figurer dans son propre compteur
      // de messages non lus.
      luParEquipe: true,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { dernierMessageLe: new Date() },
  });

  revalidatePath(`/admin/discussions/${conversationId}`);
  revalidatePath("/admin/discussions");
  revalidatePath("/admin");
}

/** Marque tous les messages visiteur d'un fil comme lus. */
export async function marquerLu(donnees: FormData) {
  await exigerAdmin();

  const conversationId = chaine(donnees, "conversationId");
  if (!conversationId) return;

  await prisma.message.updateMany({
    where: { conversationId, expediteur: "VISITEUR", luParEquipe: false },
    data: { luParEquipe: true },
  });

  revalidatePath(`/admin/discussions/${conversationId}`);
  revalidatePath("/admin/discussions");
  revalidatePath("/admin");
}

/** Clôt ou rouvre un fil de discussion. */
export async function basculerOuverture(donnees: FormData) {
  await exigerAdmin();

  const conversationId = chaine(donnees, "conversationId");
  if (!conversationId) return;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { ouverte: true },
  });
  if (!conversation) return;

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { ouverte: !conversation.ouverte },
  });

  revalidatePath(`/admin/discussions/${conversationId}`);
  revalidatePath("/admin/discussions");
}
