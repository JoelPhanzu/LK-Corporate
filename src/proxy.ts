import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LANGUES,
  cheminSansLangue,
  langueDepuisEntete,
  traduite,
} from "@/lib/i18n";

/**
 * Proxy (anciennement « middleware », renommé dans Next.js 16).
 *
 * Trois responsabilités :
 *  1. aiguiller le visiteur vers la langue de son navigateur quand l'URL n'en
 *     porte pas ;
 *  2. router le sous-domaine admin vers le segment /admin ;
 *  3. rafraîchir la session Supabase, faute de quoi les jetons expirés
 *     déconnecteraient l'équipe en pleine saisie.
 *
 * Ce fichier ne porte PAS l'autorisation. La documentation Next.js est
 * explicite : le proxy convient aux vérifications optimistes, pas à la gestion
 * de session. Le contrôle d'accès réel est fait dans le layout de l'espace
 * admin et rejoué dans chaque Server Action.
 */

/** Hôtes servant l'espace admin. À ajuster après le choix d'hébergement. */
const HOTES_ADMIN = new Set(["admin.lk-corporate.com", "admin.localhost"]);

/**
 * En-têtes dont dépend le corps d'une réponse Next.js.
 *
 * Une même URL sert deux contenus : le document HTML pour une navigation, et
 * le payload React Server Components quand le routeur préfetche, ce qu'il
 * signale par `RSC`. Sans ce `Vary`, une redirection émise ici est mise en
 * cache par le navigateur sans distinguer les deux, et la navigation suivante
 * rejoue le payload : la page s'affiche alors en texte brut.
 *
 * Next.js pose déjà ces en-têtes sur ses propres réponses ; les redirections
 * fabriquées par le proxy doivent faire de même.
 */
const VARY_RSC = [
  "RSC",
  "Next-Router-State-Tree",
  "Next-Router-Prefetch",
  "Next-Router-Segment-Prefetch",
].join(", ");

/**
 * Interdit aux caches partagés de conserver les réponses de navigation.
 *
 * Next.js sert ses pages prérendues avec un `s-maxage` d'un an, en comptant sur
 * le `Vary` ci-dessus pour séparer le document HTML du payload RSC. Or le CDN
 * de l'hébergeur réécrit ce `Vary` en `Accept-Encoding` : les deux variantes
 * se retrouvent alors sous la même clé, et la première servie est rejouée pour
 * tout le monde — un visiteur reçoit le payload en texte brut à la place du
 * site.
 *
 * Tant que le `Vary` n'est pas respecté de bout en bout, la seule protection
 * fiable est d'empêcher la mise en cache partagée de ces réponses. Les fichiers
 * de `_next/static`, exclus du matcher, gardent leur cache immuable : c'est eux
 * qui pèsent, pas le HTML.
 */
const SANS_CACHE_PARTAGE = "private, no-store";

export async function proxy(request: NextRequest) {
  const hote = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  const surHoteAdmin = HOTES_ADMIN.has(hote);

  // Le site vitrine vit sous un préfixe de langue, pas l'administration : elle
  // n'est utilisée que par l'équipe interne et reste en français. Une URL sans
  // préfixe est donc redirigée vers la langue la mieux adaptée à l'en-tête du
  // navigateur, avant tout autre traitement.
  if (!surHoteAdmin && !pathname.startsWith("/admin")) {
    const prefixee = LANGUES.some(
      (langue) => pathname === `/${langue}` || pathname.startsWith(`/${langue}/`),
    );

    if (!prefixee) {
      const langue = langueDepuisEntete(request.headers.get("accept-language"));
      const cible = request.nextUrl.clone();
      cible.pathname = `/${langue}${pathname === "/" ? "" : pathname}`;
      // Redirection et non réécriture : la langue doit apparaître dans l'URL
      // pour être partageable et indexable séparément.
      const redirection = NextResponse.redirect(cible);
      redirection.headers.set("Vary", VARY_RSC);
      redirection.headers.set("Cache-Control", SANS_CACHE_PARTAGE);
      return redirection;
    }
  }

  // Sur le domaine principal, /admin reste accessible : c'est le repli prévu
  // au cahier des charges §2.1 si le sous-domaine n'est pas mis en place.
  const reecrire = surHoteAdmin && !pathname.startsWith("/admin");

  // Calculée une seule fois : `setAll` reconstruit la réponse plus bas et doit
  // viser la même URL, sans quoi la réécriture serait perdue.
  let urlCible: URL | null = null;
  if (reecrire) {
    urlCible = request.nextUrl.clone();
    urlCible.pathname = `/admin${pathname === "/" ? "" : pathname}`;
  }

  // Les pages anglaises encore non traduites servent du français : les faire
  // indexer référencerait des URL anglaises qui n'en sont pas. L'en-tête HTTP
  // vaut la balise `robots` et s'applique en un seul point, sans toucher
  // chacune des pages concernées. `follow` est conservé pour que les liens
  // qu'elles portent restent explorés.
  const langueUrl = LANGUES.find(
    (langue) => pathname === `/${langue}` || pathname.startsWith(`/${langue}/`),
  );
  const aMasquer =
    langueUrl !== undefined &&
    !traduite(langueUrl, cheminSansLangue(pathname));

  // Les en-têtes de cache sont posés ici, et non sur le retour final : la
  // réponse est reconstruite à chaque rafraîchissement de cookie, et un
  // chemin de sortie anticipé existe quand Supabase n'est pas configuré.
  const construireReponse = () => {
    const nouvelle = urlCible
      ? NextResponse.rewrite(urlCible, { request })
      : NextResponse.next({ request });
    nouvelle.headers.set("Vary", VARY_RSC);
    nouvelle.headers.set("Cache-Control", SANS_CACHE_PARTAGE);
    if (aMasquer) nouvelle.headers.set("X-Robots-Tag", "noindex, follow");
    return nouvelle;
  };

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
