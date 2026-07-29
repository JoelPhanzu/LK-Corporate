import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { EtatVide } from "@/components/public/etat-vide";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { LOCALES_INTL, alternances, chemin, estLangue } from "@/lib/i18n";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(
  props: PageProps<"/[lang]/actualites">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.actualites.metaTitre,
    description: dico.actualites.metaDescription,
    alternates: alternances(lang, "/actualites"),
  };
}

export const dynamic = "force-dynamic";

async function chargerArticles() {
  try {
    return await prisma.article.findMany({
      where: { publie: true },
      orderBy: { publieLe: "desc" },
      select: {
        slug: true,
        titre: true,
        chapo: true,
        publieLe: true,
        imageChemin: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des actualités impossible", erreur);
    return null;
  }
}

export default async function PageActualites(
  props: PageProps<"/[lang]/actualites">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);
  // Le format suit la langue de la page : « 12 mars 2026 » devient
  // « 12 March 2026 ».
  const dateLocale = new Intl.DateTimeFormat(LOCALES_INTL[lang], {
    dateStyle: "long",
  });
  const articles = await chargerArticles();

  return (
    <>
      <EnTetePage
        titre={dico.actualites.titre}
        chapo={dico.actualites.chapo}
      />

      <section className="py-16 md:py-24">
        <Container>
          {articles === null && (
            <EtatVide
              titre={dico.actualites.erreurTitre}
              texte={dico.actualites.erreurTexte}
            />
          )}

          {articles !== null && articles.length === 0 && (
            <EtatVide
              titre={dico.actualites.videTitre}
              texte={dico.actualites.videTexte}
            />
          )}

          {articles !== null && articles.length > 0 && (
            <ul className="max-w-4xl divide-y divide-line border-y border-line">
              {articles.map((article) => {
                const image = urlMedia(article.imageChemin);

                return (
                  <li key={article.slug}>
                    <Link
                      href={chemin(lang, `/actualites/${article.slug}`)}
                      className="group flex flex-col gap-5 py-8 sm:flex-row sm:items-start"
                    >
                      {image && (
                        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-brand bg-surface-sunken sm:aspect-square sm:w-40">
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 160px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        {article.publieLe && (
                          <time
                            dateTime={article.publieLe.toISOString()}
                            className="text-sm text-ink-muted"
                          >
                            {dateLocale.format(article.publieLe)}
                          </time>
                        )}
                        <h2 className="mt-1 text-xl font-bold leading-snug group-hover:text-accent-text">
                          {article.titre}
                        </h2>
                        <p className="mt-2 max-w-[65ch] leading-relaxed text-ink-muted">
                          {article.chapo}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
