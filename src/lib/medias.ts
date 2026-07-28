/** Bucket public : photos de réalisations et visuels d'actualités. */
export const BUCKET_MEDIAS = "medias";

/**
 * Construit l'URL publique d'un fichier de Supabase Storage.
 *
 * Retourne null si le chemin est vide ou si l'URL Supabase n'est pas
 * configurée, afin que l'appelant affiche un substitut plutôt qu'une image
 * cassée.
 */
export function urlMedia(chemin: string | null | undefined): string | null {
  if (!chemin) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET_MEDIAS}/${chemin}`;
}
