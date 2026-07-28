"use server";

import { revalidatePath } from "next/cache";
import type { StatutDemande, StatutLivraison } from "@/generated/prisma/enums";
import { exigerAdmin } from "@/lib/auth";
import { STATUTS_DEMANDE, STATUTS_LIVRAISON } from "@/lib/libelles";
import { prisma } from "@/lib/prisma";

/**
 * Chaque action rejoue `exigerAdmin()`.
 *
 * La garde du layout ne protège que l'affichage : une Server Action reste
 * joignable par requête POST directe, sans passer par l'interface.
 */

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

export async function changerStatutDemande(donnees: FormData) {
  await exigerAdmin();

  const id = chaine(donnees, "demandeId");
  const statut = chaine(donnees, "statut") as StatutDemande;

  if (!id || !STATUTS_DEMANDE.includes(statut)) {
    throw new Error("Statut de demande invalide.");
  }

  await prisma.demande.update({ where: { id }, data: { statut } });

  revalidatePath(`/admin/demandes/${id}`);
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
}

export async function ajouterNote(donnees: FormData) {
  const session = await exigerAdmin();

  const id = chaine(donnees, "demandeId");
  const contenu = chaine(donnees, "contenu");

  if (!id || contenu.length === 0) return;

  await prisma.noteInterne.create({
    data: { demandeId: id, contenu, auteurId: session.id },
  });

  revalidatePath(`/admin/demandes/${id}`);
}

/**
 * Met à jour le suivi logistique.
 *
 * Le changement est écrit à deux endroits : le statut courant de la livraison,
 * et une étape horodatée dans l'historique. C'est cet historique qui alimente
 * la frise consultée par le client sur /suivi.
 */
export async function changerStatutLivraison(donnees: FormData) {
  const session = await exigerAdmin();

  const demandeId = chaine(donnees, "demandeId");
  const statut = chaine(donnees, "statut") as StatutLivraison;
  const commentaire = chaine(donnees, "commentaire");

  if (!demandeId || !STATUTS_LIVRAISON.includes(statut)) {
    throw new Error("Statut de livraison invalide.");
  }

  const livraison = await prisma.livraison.upsert({
    where: { demandeId },
    create: { demandeId, statut },
    update: {
      statut,
      dateLivree: statut === "LIVREE" ? new Date() : null,
    },
    select: { id: true },
  });

  await prisma.etapeLivraison.create({
    data: {
      livraisonId: livraison.id,
      statut,
      commentaire: commentaire || null,
      auteurId: session.id,
    },
  });

  revalidatePath(`/admin/demandes/${demandeId}`);
  revalidatePath("/admin/logistique");
  revalidatePath("/admin");
}
