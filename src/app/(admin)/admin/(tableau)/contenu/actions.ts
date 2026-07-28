"use server";

import { revalidatePath } from "next/cache";
import { exigerAdmin } from "@/lib/auth";
import { CLE_COORDONNEES } from "@/lib/contenu";
import { prisma } from "@/lib/prisma";
import type { EtatContenu } from "./etats";

function chaine(donnees: FormData, cle: string): string {
  const valeur = donnees.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/**
 * Enregistre les coordonnées affichées sur le site public.
 *
 * Les réseaux sociaux arrivent sous forme de lignes « Nom | URL », format
 * volontairement simple pour rester saisissable sans interface dédiée. Les
 * lignes mal formées sont ignorées plutôt que de faire échouer tout le
 * formulaire.
 */
export async function enregistrerCoordonnees(
  _precedent: EtatContenu,
  donnees: FormData,
): Promise<EtatContenu> {
  await exigerAdmin();

  const email = chaine(donnees, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statut: "erreur", message: "L'adresse email semble incorrecte." };
  }

  const reseaux = chaine(donnees, "reseaux")
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map((ligne) => {
      const [nom, url] = ligne.split("|").map((part) => part.trim());
      return { nom: nom ?? "", url: url ?? "" };
    })
    .filter(
      (reseau) =>
        reseau.nom !== "" &&
        (reseau.url.startsWith("https://") || reseau.url.startsWith("http://")),
    );

  const valeur = {
    telephone: chaine(donnees, "telephone"),
    email,
    adresse: chaine(donnees, "adresse"),
    ville: chaine(donnees, "ville"),
    pays: chaine(donnees, "pays"),
    reseaux,
  };

  try {
    await prisma.contenuSite.upsert({
      where: { cle: CLE_COORDONNEES },
      create: { cle: CLE_COORDONNEES, valeur },
      update: { valeur },
    });
  } catch (erreur) {
    console.error("Enregistrement des coordonnées impossible", erreur);
    return {
      statut: "erreur",
      message: "Les coordonnées n'ont pas pu être enregistrées.",
    };
  }

  // Le pied de page apparaît sur toutes les pages : on revalide la racine.
  revalidatePath("/", "layout");
  revalidatePath("/admin/contenu");

  return { statut: "succes", message: "Coordonnées mises à jour sur le site." };
}
