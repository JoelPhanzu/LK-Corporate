import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (anciennement « middleware », renommé dans Next.js 16).
 *
 * Deux responsabilités :
 *  1. router le sous-domaine admin vers le segment /admin ;
 *  2. rafraîchir la session Supabase, faute de quoi les jetons expirés
 *     déconnecteraient l'équipe en pleine saisie.
 *
 * Ce fichier ne porte PAS l'autorisation. La documentation Next.js est
 * explicite : le proxy convient aux vérifications optimistes, pas à la gestion
 * de session. Le contrôle d'accès réel est fait dans le layout de l'espace
 * admin et rejoué dans chaque Server Action.
 */

/** Hôtes servant l'espace admin. À ajuster après le choix d'hébergement. */
const HOTES_ADMIN = new Set(["admin.lk-corporate.com", "admin.localhost"]);

export async function proxy(request: NextRequest) {
  const hote = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Sur le domaine principal, /admin reste accessible : c'est le repli prévu
  // au cahier des charges §2.1 si le sous-domaine n'est pas mis en place.
  const reecrire = HOTES_ADMIN.has(hote) && !pathname.startsWith("/admin");

  // Calculée une seule fois : `setAll` reconstruit la réponse plus bas et doit
  // viser la même URL, sans quoi la réécriture serait perdue.
  let urlCible: URL | null = null;
  if (reecrire) {
    urlCible = request.nextUrl.clone();
    urlCible.pathname = `/admin${pathname === "/" ? "" : pathname}`;
  }

  const construireReponse = () =>
    urlCible
      ? NextResponse.rewrite(urlCible, { request })
      : NextResponse.next({ request });

  let reponse = construireReponse();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) return reponse;

  const supabase = createServerClient(url, cle, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEcrire) {
        for (const { name, value } of cookiesAEcrire) {
          request.cookies.set(name, value);
        }
        // La réponse est reconstruite pour repartir de la requête mise à jour,
        // puis les cookies rafraîchis y sont réappliqués.
        reponse = construireReponse();
        for (const { name, value, options } of cookiesAEcrire) {
          reponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Cet appel déclenche le rafraîchissement du jeton s'il a expiré.
  await supabase.auth.getUser();

  return reponse;
}

export const config = {
  // Exclut les assets et les routes internes : inutile de faire tourner le
  // proxy sur chaque image ou fichier statique.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
