import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase à privilèges élevés (clé de service).
 *
 * Il contourne les règles RLS : réservé aux opérations serveur qui ne peuvent
 * pas s'appuyer sur la session du visiteur, comme le dépôt d'une pièce jointe
 * dans un bucket privé. L'import "server-only" fait échouer la compilation si
 * ce module se retrouve un jour dans un bundle navigateur.
 */
export function creerClientAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !cle) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.",
    );
  }

  return createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Bucket privé des pièces jointes déposées avec les demandes de devis. */
export const BUCKET_PIECES = "pieces-jointes";
