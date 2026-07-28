import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase côté serveur, adossé aux cookies de la requête.
 * C'est lui qui porte la session admin dans les Server Components,
 * les Server Actions et les Route Handlers.
 */
export async function creerClientServeur() {
  const magasinCookies = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return magasinCookies.getAll();
        },
        setAll(cookiesAEcrire) {
          try {
            for (const { name, value, options } of cookiesAEcrire) {
              magasinCookies.set(name, value, options);
            }
          } catch {
            // Écriture impossible depuis un Server Component : c'est attendu.
            // Le rafraîchissement de session est assuré ailleurs (proxy ou
            // Server Action), il n'y a rien à corriger ici.
          }
        },
      },
    },
  );
}

/**
 * Retourne l'utilisateur authentifié, ou null.
 *
 * Utilise `getUser()` et non `getSession()` : `getUser()` fait revalider le
 * jeton par Supabase, alors que `getSession()` se contente de lire un cookie
 * potentiellement falsifié. Toute décision d'autorisation doit passer par ici.
 */
export async function getUtilisateurAuthentifie() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
