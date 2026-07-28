"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { creerClientServeur } from "@/lib/supabase/serveur";
import type { EtatConnexion } from "./etats";

/** Message unique en cas d'échec : ne pas révéler si l'email existe. */
const ECHEC = "Identifiants incorrects, ou compte non autorisé.";

export async function seConnecter(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const email = String(donnees.get("email") ?? "").trim();
  const motDePasse = String(donnees.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { statut: "erreur", message: "Renseignez votre email et votre mot de passe." };
  }

  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error || !data.user) {
    return { statut: "erreur", message: ECHEC };
  }

  // S'authentifier ne suffit pas : il faut aussi un profil d'équipe actif.
  // Sans quoi tout compte Supabase du projet pourrait entrer dans l'admin.
  try {
    const profil = await prisma.utilisateurAdmin.findUnique({
      where: { id: data.user.id },
      select: { actif: true },
    });

    if (!profil || !profil.actif) {
      await supabase.auth.signOut();
      return { statut: "erreur", message: ECHEC };
    }
  } catch (erreur) {
    console.error("Vérification du profil admin impossible", erreur);
    await supabase.auth.signOut();
    return {
      statut: "erreur",
      message: "Connexion momentanément indisponible. Réessayez dans un instant.",
    };
  }

  // redirect() lève une exception de contrôle de flux : rien ne s'exécute
  // après, et l'appel doit rester hors du bloc try.
  redirect("/admin");
}

export async function seDeconnecter() {
  const supabase = await creerClientServeur();
  await supabase.auth.signOut();
  redirect("/admin/connexion");
}
