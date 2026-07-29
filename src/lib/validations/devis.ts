import { z } from "zod";
import { DOMAINES } from "@/lib/domaines";
import type { MessagesValidation } from "./messages";

const SLUGS = DOMAINES.map((domaine) => domaine.slug) as [string, ...string[]];

/** Taille et types acceptés pour les pièces jointes d'une demande. */
export const PIECE_JOINTE = {
  tailleMaxOctets: 10 * 1024 * 1024,
  typesAcceptes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ] as const,
  nombreMax: 5,
};

/**
 * Schéma d'une demande de devis, construit avec les messages de la langue.
 *
 * Les slugs de domaines ne sont pas traduits : ils servent d'identifiants et
 * sont communs aux deux langues.
 */
export function schemaDevis(m: MessagesValidation) {
  return z.object({
    nom: z.string().trim().min(2, m.nomRequis).max(120, m.nomLong),
    email: z
      .string()
      .trim()
      .max(180)
      .email(m.emailInvalide)
      .or(z.literal("")),
    telephone: z.string().trim().max(40, m.telephoneLong).or(z.literal("")),
    entreprise: z.string().trim().max(160).or(z.literal("")),
    domaineSlug: z.enum(SLUGS, { message: m.domaineRequis }),
    description: z
      .string()
      .trim()
      .min(20, m.descriptionCourte)
      .max(5000, m.descriptionLongue),
    budget: z.string().trim().max(80).or(z.literal("")),
    delaiSouhaite: z.string().trim().max(120).or(z.literal("")),
    adresseLivraison: z.string().trim().max(300).or(z.literal("")),
  });
}

export type DonneesDevis = z.infer<ReturnType<typeof schemaDevis>>;

/**
 * Une demande sans aucun moyen de recontact ne sert à rien : on exige au moins
 * l'email ou le téléphone, sans imposer les deux.
 */
export function schemaDevisComplet(m: MessagesValidation) {
  return schemaDevis(m).refine(
    (donnees) => donnees.email !== "" || donnees.telephone !== "",
    { message: m.contactRequis, path: ["email"] },
  );
}
