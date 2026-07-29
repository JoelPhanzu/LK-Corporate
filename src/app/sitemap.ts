import type { MetadataRoute } from "next";
import { DOMAINES } from "@/lib/domaines";
import { ETIQUETTES_HREFLANG, LANGUES, traduite } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";

/** Pages consultables et indexables. /suivi en est exclu : page personnelle. */
const PAGES_FIXES = [
  { chemin: "", priorite: 1 },
  { chemin: "/a-propos", priorite: 0.7 },
  { chemin: "/services", priorite: 0.9 },
  { chemin: "/realisations", priorite: 0.8 },
  { chemin: "/actualites", priorite: 0.7 },
  { chemin: "/devis", priorite: 0.9 },
  { chemin: "/contact", priorite: 0.6 },
];

/**
 * Une entrée par langue, chacune déclarant ses équivalents.
 *
 * Les chemins sont communs aux deux langues, seul le préfixe change : les
 * slugs de domaines et de contenus servent d'identifiants et ne sont pas
 * traduits. Sans le préfixe, chaque URL du sitemap se ferait rediriger par le
 * proxy, ce qui dilue le budget d'exploration et brouille la canonisation.
 */
function entrees(
  chemin: string,
  priorite: number,
  lastModified: Date,
): MetadataRoute.Sitemap {
  // Seules les langues réellement traduites sont déclarées : annoncer une URL
  // anglaise qui sert du français ferait indexer une traduction inexistante.
  const publiables = LANGUES.filter((langue) => traduite(langue, chemin));

  const languages = Object.fromEntries(
    publiables.map((langue) => [
      ETIQUETTES_HREFLANG[langue],
      `${SITE.url}/${langue}${chemin}`,
    ]),
  );

  return publiables.map((langue) => ({
    url: `${SITE.url}/${langue}${chemin}`,
    lastModified,
    priority: priorite,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();

  const liste: MetadataRoute.Sitemap = [
    ...PAGES_FIXES.flatMap((page) =>
      entrees(page.chemin, page.priorite, maintenant),
    ),
    ...DOMAINES.flatMap((domaine) =>
      entrees(`/services/${domaine.slug}`, 0.8, maintenant),
    ),
  ];

  // Le contenu éditorial n'est ajouté que si la base répond : un sitemap
  // amputé vaut mieux qu'une compilation en échec.
  try {
    const [realisations, articles] = await Promise.all([
      prisma.realisation.findMany({
        where: { publie: true },
        select: { slug: true, modifieLe: true },
      }),
      prisma.article.findMany({
        where: { publie: true },
        select: { slug: true, modifieLe: true },
      }),
    ]);

    liste.push(
      ...realisations.flatMap((item) =>
        entrees(`/realisations/${item.slug}`, 0.7, item.modifieLe),
      ),
      ...articles.flatMap((item) =>
        entrees(`/actualites/${item.slug}`, 0.6, item.modifieLe),
      ),
    );
  } catch (erreur) {
    console.error("Contenus dynamiques absents du sitemap", erreur);
  }

  return liste;
}
