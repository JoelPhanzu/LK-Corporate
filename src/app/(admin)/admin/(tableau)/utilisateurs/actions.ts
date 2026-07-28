"use server";

import { revalidatePath } from "next/cache";
import type { RoleAdmin } from "@/generated/prisma/enums";
import { exigerAdmin, peutGererUtilisateurs } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creerClientAdmin } from "@/lib/supabase/admin";
import type { EtatUtilisateur } from "./etats";

const ROLES: RoleAdmin[] = ["PROPRIETAIRE", "ADMIN", "AGENT"];

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/** Vérifie la session ET le droit de gestion des comptes. */
async function exigerGestionnaire() {
  const session = await exigerAdmin();
  if (!peutGererUtilisateurs(session)) {
    throw new Error("Votre rôle ne permet pas de gérer les comptes.");
  }
  return session;
}

/**
 * Crée un compte d'équipe.
 *
 * Deux enregistrements sont nécessaires et créés ensemble : l'utilisateur
 * Supabase Auth (email et mot de passe) et le profil applicatif portant le même
 * identifiant. L'un sans l'autre donne un compte qui s'authentifie mais reste
 * refusé à l'entrée de l'admin.
 */
export async function creerUtilisateur(
  _precedent: EtatUtilisateur,
  donnees: FormData,
): Promise<EtatUtilisateur> {
  await exigerGestionnaire();

  const email = chaine(donnees, "email").toLowerCase();
  const nom = chaine(donnees, "nom");
  const motDePasse = chaine(donnees, "motDePasse");
  const role = chaine(donnees, "role") as RoleAdmin;

  if (!email || !nom) {
    return { statut: "erreur", message: "Le nom et l'email sont obligatoires." };
  }
  if (motDePasse.length < 12) {
    return {
      statut: "erreur",
      message:
        "Le mot de passe doit faire au moins 12 caractères : ce compte donne accès aux données clients.",
    };
  }
  if (!ROLES.includes(role)) {
    return { statut: "erreur", message: "Rôle invalide." };
  }

  try {
    const supabase = creerClientAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
    });

    if (error || !data.user) {
      return {
        statut: "erreur",
        message:
          error?.message ??
          "Le compte d'authentification n'a pas pu être créé.",
      };
    }

    await prisma.utilisateurAdmin.create({
      data: { id: data.user.id, email, nom, role, actif: true },
    });
  } catch (erreur) {
    console.error("Création du compte impossible", erreur);
    return {
      statut: "erreur",
      message: "Le compte n'a pas pu être créé. Réessayez dans un instant.",
    };
  }

  revalidatePath("/admin/utilisateurs");
  return { statut: "succes", message: `Compte créé pour ${nom}.` };
}

/**
 * Active ou désactive un compte.
 * Se désactiver soi-même est refusé : cela reviendrait à se verrouiller dehors
 * sans possibilité de revenir en arrière depuis l'interface.
 */
export async function basculerActif(donnees: FormData) {
  const session = await exigerGestionnaire();

  const id = chaine(donnees, "id");
  if (!id) return;

  if (id === session.id) {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }

  const utilisateur = await prisma.utilisateurAdmin.findUnique({
    where: { id },
    select: { actif: true },
  });
  if (!utilisateur) return;

  await prisma.utilisateurAdmin.update({
    where: { id },
    data: { actif: !utilisateur.actif },
  });

  revalidatePath("/admin/utilisateurs");
}

/** Change le rôle d'un collaborateur. Modifier le sien est refusé. */
export async function changerRole(donnees: FormData) {
  const session = await exigerGestionnaire();

  const id = chaine(donnees, "id");
  const role = chaine(donnees, "role") as RoleAdmin;

  if (!id || !ROLES.includes(role)) return;

  if (id === session.id) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  await prisma.utilisateurAdmin.update({ where: { id }, data: { role } });

  revalidatePath("/admin/utilisateurs");
}
