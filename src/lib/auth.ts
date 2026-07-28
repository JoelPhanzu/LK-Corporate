import "server-only";
import { redirect } from "next/navigation";
import type { RoleAdmin } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getUtilisateurAuthentifie } from "@/lib/supabase/serveur";

export type SessionAdmin = {
  id: string;
  email: string;
  nom: string;
  role: RoleAdmin;
};

/**
 * Retourne le membre de l'équipe connecté, ou null.
 *
 * Deux conditions cumulatives : une session Supabase valide (le jeton est
 * revalidé côté Supabase, pas simplement lu dans un cookie) ET une ligne
 * `UtilisateurAdmin` active. Désactiver un collaborateur suffit donc à lui
 * couper l'accès, sans toucher à son compte d'authentification.
 */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const utilisateur = await getUtilisateurAuthentifie();
  if (!utilisateur) return null;

  try {
    const profil = await prisma.utilisateurAdmin.findUnique({
      where: { id: utilisateur.id },
      select: { id: true, email: true, nom: true, role: true, actif: true },
    });

    if (!profil || !profil.actif) return null;

    return {
      id: profil.id,
      email: profil.email,
      nom: profil.nom,
      role: profil.role,
    };
  } catch (erreur) {
    console.error("Vérification du profil admin impossible", erreur);
    return null;
  }
}

/**
 * Exige une session admin, sinon redirige vers la connexion.
 *
 * À appeler au début de CHAQUE page admin et de CHAQUE Server Action de
 * l'admin : une Server Action est joignable par POST direct, en dehors de
 * toute interface, donc la garde du layout ne la protège pas.
 */
export async function exigerAdmin(): Promise<SessionAdmin> {
  const session = await getSessionAdmin();
  if (!session) redirect("/admin/connexion");
  return session;
}

/** Rôles autorisés à gérer les comptes de l'équipe. */
export const ROLES_GESTION: RoleAdmin[] = ["PROPRIETAIRE", "ADMIN"];

export function peutGererUtilisateurs(session: SessionAdmin): boolean {
  return ROLES_GESTION.includes(session.role);
}
