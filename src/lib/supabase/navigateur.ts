import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur.
 * Utilisé pour le chat temps réel et les écrans admin interactifs.
 * N'utilise que la clé anonyme : les accès sont bornés par les règles RLS.
 */
export function creerClientNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
