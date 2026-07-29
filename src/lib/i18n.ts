/**
 * Langues du site vitrine.
 *
 * Le français est la langue par défaut : l'entreprise et sa clientèle sont
 * congolaises. L'anglais sert les bailleurs, ONG et partenaires régionaux.
 *
 * L'espace d'administration reste hors du segment de langue : il n'est utilisé
 * que par l'équipe interne, et le traduire doublerait la surface à maintenir
 * sans bénéfice.
 */

export const LANGUES = ["fr", "en"] as const;

export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = "fr";

/** Libellés dans leur propre langue, comme le veut l'usage. */
export const NOMS_LANGUES: Record<Langue, string> = {
  fr: "Français",
  en: "English",
};

/** Codes courts, pour le raccourci de l'en-tête où la place manque. */
export const CODES_LANGUES: Record<Langue, string> = {
  fr: "FR",
  en: "EN",
};

/** Code complet pour l'attribut `lang` et les balises hreflang. */
export const ETIQUETTES_HREFLANG: Record<Langue, string> = {
  fr: "fr",
  en: "en",
};

export function estLangue(valeur: unknown): valeur is Langue {
  return LANGUES.includes(valeur as Langue);
}

/**
 * Préfixe un chemin interne de la langue courante.
 *
 * Tous les liens du site vitrine passent par ici : un `href` écrit en dur
 * renverrait le visiteur anglophone sur la version française.
 */
export function chemin(langue: Langue, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${langue}` : `/${langue}${href}`;
}

/**
 * Retire le préfixe de langue d'un chemin, pour retrouver la route « nue ».
 * Sert au sélecteur de langue, qui doit rester sur la page courante.
 */
export function cheminSansLangue(pathname: string): string {
  for (const langue of LANGUES) {
    if (pathname === `/${langue}`) return "/";
    if (pathname.startsWith(`/${langue}/`)) return pathname.slice(langue.length + 1);
  }
  return pathname;
}

/**
 * Chemins dont la version anglaise est réellement traduite.
 *
 * Garde-fou temporaire. Les pages restantes existent sous /en mais servent
 * encore du français : les laisser indexer ferait référencer des URL anglaises
 * qui n'en sont pas, ce qui est long à corriger une fois installé. Elles sont
 * donc marquées `noindex`, retirées du sitemap, et ne sont pas déclarées en
 * `hreflang` — Google déconseille de pointer une alternative non indexable.
 *
 * Ajouter chaque chemin ici au fur et à mesure, puis supprimer ce mécanisme
 * quand la traduction sera complète.
 */
const CHEMINS_TRADUITS = ["/", "/services"];

export function traduite(langue: Langue, cheminNu: string): boolean {
  if (langue === LANGUE_PAR_DEFAUT) return true;
  // Le sitemap désigne l'accueil par une chaîne vide, le reste du code par
  // « / » : sans cette normalisation, l'accueil anglais serait tenu pour non
  // traduit et disparaîtrait du sitemap.
  const normalise = cheminNu === "" ? "/" : cheminNu;
  return (
    CHEMINS_TRADUITS.includes(normalise) || normalise.startsWith("/services/")
  );
}

/**
 * Bloc `alternates` des métadonnées d'une page.
 *
 * Déclare la canonique de la page ET ses équivalents dans l'autre langue.
 * Sans ces réciproques, Google traite les deux versions comme des doublons
 * plutôt que comme des traductions, et n'en indexe qu'une.
 */
export function alternances(langue: Langue, cheminNu: string) {
  return {
    canonical: chemin(langue, cheminNu),
    languages: Object.fromEntries(
      LANGUES.filter((autre) => traduite(autre, cheminNu)).map((autre) => [
        ETIQUETTES_HREFLANG[autre],
        chemin(autre, cheminNu),
      ]),
    ),
  };
}

/**
 * Choisit la langue la mieux adaptée à l'en-tête `Accept-Language`.
 *
 * Implémentation volontairement courte plutôt qu'une dépendance de
 * négociation : deux langues, sans variantes régionales, ne justifient pas
 * d'embarquer un analyseur complet dans le proxy, qui s'exécute à chaque
 * requête.
 */
export function langueDepuisEntete(entete: string | null): Langue {
  if (!entete) return LANGUE_PAR_DEFAUT;

  const preferences = entete
    .split(",")
    .map((morceau) => {
      const [etiquette, ...parametres] = morceau.trim().split(";");
      const q = parametres
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return {
        // `fr-CD` comme `fr` doivent tous deux désigner le français.
        base: etiquette.trim().toLowerCase().split("-")[0],
        poids: q ? Number.parseFloat(q.slice(2)) : 1,
      };
    })
    .filter((p) => Number.isFinite(p.poids))
    .sort((a, b) => b.poids - a.poids);

  for (const { base } of preferences) {
    if (estLangue(base)) return base;
  }

  return LANGUE_PAR_DEFAUT;
}
