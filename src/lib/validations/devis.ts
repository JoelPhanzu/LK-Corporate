import { z } from "zod";
import { DOMAINES } from "@/lib/domaines";

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
 * Schéma partagé entre le navigateur et le serveur.
 *
 * La validation côté client sert le confort ; celle côté serveur fait foi.
 * Les deux s'appuient volontairement sur ce même schéma pour ne pas diverger.
 */
export const schemaDevis = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom.")
    .max(120, "Ce nom est trop long."),
  email: z
    .string()
    .trim()
    .max(180)
    .email("Cette adresse email semble incorrecte.")
    .or(z.literal("")),
  telephone: z
    .string()
    .trim()
    .max(40, "Ce numéro est trop long.")
    .or(z.literal("")),
  entreprise: z.string().trim().max(160).or(z.literal("")),
  domaineSlug: z.enum(SLUGS, {
    message: "Choisissez un domaine d'activité.",
  }),
  description: z
    .string()
    .trim()
    .min(20, "Décrivez votre besoin en quelques phrases (20 caractères au moins).")
    .max(5000, "Cette description est trop longue."),
  budget: z.string().trim().max(80).or(z.literal("")),
  delaiSouhaite: z.string().trim().max(120).or(z.literal("")),
  adresseLivraison: z.string().trim().max(300).or(z.literal("")),
});

export type DonneesDevis = z.infer<typeof schemaDevis>;

/**
 * Une demande sans aucun moyen de recontact ne sert à rien : on exige au moins
 * l'email ou le téléphone, sans imposer les deux.
 */
export const schemaDevisComplet = schemaDevis.refine(
  (donnees) => donnees.email !== "" || donnees.telephone !== "",
  {
    message: "Renseignez au moins un email ou un numéro de téléphone.",
    path: ["email"],
  },
);
