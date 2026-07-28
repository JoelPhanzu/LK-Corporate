import { z } from "zod";

/** Schéma du formulaire de contact, partagé entre le navigateur et le serveur. */
export const schemaContact = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom.")
    .max(120, "Ce nom est trop long."),
  email: z
    .string()
    .trim()
    .min(1, "Indiquez une adresse email.")
    .max(180)
    .email("Cette adresse email semble incorrecte."),
  telephone: z.string().trim().max(40).or(z.literal("")),
  sujet: z
    .string()
    .trim()
    .min(3, "Précisez l'objet de votre message.")
    .max(160, "Cet objet est trop long."),
  message: z
    .string()
    .trim()
    .min(20, "Détaillez votre message (20 caractères au moins).")
    .max(5000, "Ce message est trop long."),
});

export type DonneesContact = z.infer<typeof schemaContact>;
