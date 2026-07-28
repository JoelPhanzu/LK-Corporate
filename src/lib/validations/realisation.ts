import { z } from "zod";
import { DOMAINES } from "@/lib/domaines";

const SLUGS = DOMAINES.map((domaine) => domaine.slug) as [string, ...string[]];

export const schemaRealisation = z.object({
  titre: z
    .string()
    .trim()
    .min(4, "Le titre doit faire au moins 4 caractères.")
    .max(180, "Ce titre est trop long."),
  description: z
    .string()
    .trim()
    .min(30, "Décrivez le projet en quelques phrases (30 caractères au moins).")
    .max(20000, "Cette description est trop longue."),
  localisation: z.string().trim().max(160).or(z.literal("")),
  domaineSlug: z.enum(SLUGS, { message: "Choisissez un domaine d'activité." }),
  // Sert à ordonner la galerie : le plus petit nombre passe en premier.
  ordre: z.coerce.number().int().min(0).max(9999),
});

export type DonneesRealisation = z.infer<typeof schemaRealisation>;
