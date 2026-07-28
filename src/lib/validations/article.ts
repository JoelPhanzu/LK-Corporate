import { z } from "zod";

export const schemaArticle = z.object({
  titre: z
    .string()
    .trim()
    .min(4, "Le titre doit faire au moins 4 caractères.")
    .max(180, "Ce titre est trop long."),
  chapo: z
    .string()
    .trim()
    .min(20, "Le chapô résume l'article, écrivez au moins 20 caractères.")
    .max(400, "Ce chapô est trop long, 400 caractères au maximum."),
  contenu: z
    .string()
    .trim()
    .min(50, "Le contenu doit faire au moins 50 caractères.")
    .max(50000, "Ce contenu est trop long."),
});

export type DonneesArticle = z.infer<typeof schemaArticle>;
