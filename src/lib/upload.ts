import "server-only";
import { BUCKET_MEDIAS } from "@/lib/medias";
import { slugifier } from "@/lib/slug";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { IMAGE } from "@/lib/validations/medias";

/**
 * Dépose une image dans le bucket public et retourne son chemin.
 *
 * Retourne null quand aucun fichier n'est fourni : côté appelant, cela signifie
 * « ne rien changer », et non « supprimer le visuel existant ». Lève une erreur
 * explicite en cas de format ou de taille non conforme, afin que le message
 * remonte tel quel à l'utilisateur.
 */
export async function deposerImage(
  fichier: File | null,
  dossier: string,
): Promise<string | null> {
  if (!fichier || fichier.size === 0) return null;

  if (fichier.size > IMAGE.tailleMaxOctets) {
    throw new Error(`« ${fichier.name} » dépasse 5 Mo.`);
  }
  if (
    !IMAGE.typesAcceptes.includes(
      fichier.type as (typeof IMAGE.typesAcceptes)[number],
    )
  ) {
    throw new Error(`« ${fichier.name} » doit être au format JPG, PNG ou WebP.`);
  }

  const supabase = creerClientAdmin();
  const chemin = `${dossier}/${Date.now()}-${slugifier(fichier.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET_MEDIAS)
    .upload(chemin, fichier, { contentType: fichier.type, upsert: false });

  if (error) throw error;
  return chemin;
}

/** Variante multi-fichiers, pour les galeries. */
export async function deposerImages(
  fichiers: File[],
  dossier: string,
): Promise<string[]> {
  const chemins: string[] = [];
  for (const fichier of fichiers) {
    const chemin = await deposerImage(fichier, dossier);
    if (chemin) chemins.push(chemin);
  }
  return chemins;
}
