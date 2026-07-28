import type { MetadataRoute } from "next";
import { DOMAINES } from "@/lib/domaines";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();

  const entrees: MetadataRoute.Sitemap = [
    ...PAGES_FIXES.map((page) => ({
      url: `${SITE.url}${page.chemin}`,
      lastModified: maintenant,
      priority: page.priorite,
    })),
    ...DOMAINES.map((domaine) => ({
      url: `${SITE.url}/services/${domaine.slug}`,
      lastModified: maintenant,
      priority: 0.8,
    })),
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

    entrees.push(
      ...realisations.map((item) => ({
        url: `${SITE.url}/realisations/${item.slug}`,
        lastModified: item.modifieLe,
        priority: 0.7,
      })),
      ...articles.map((item) => ({
        url: `${SITE.url}/actualites/${item.slug}`,
        lastModified: item.modifieLe,
        priority: 0.6,
      })),
    );
  } catch (erreur) {
    console.error("Contenus dynamiques absents du sitemap", erreur);
  }

  return entrees;
}
