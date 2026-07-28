import { z } from "zod";

export const MESSAGE_MAX = 2000;

/** Un jeton visiteur est un UUID v4 généré côté serveur. */
export const schemaJeton = z
  .string()
  .uuid("Jeton de conversation invalide.");

export const schemaMessage = z
  .string()
  .trim()
  .min(1, "Écrivez un message.")
  .max(MESSAGE_MAX, `Message trop long, ${MESSAGE_MAX} caractères au maximum.`);

export const schemaIdentite = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z
    .string()
    .trim()
    .max(180)
    .email("Cette adresse email semble incorrecte.")
    .or(z.literal("")),
});
