import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { LOCALES_INTL, alternances, chemin, estLangue } from "@/lib/i18n";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function chargerArticle(slug: string) {
  try {
    return await prisma.article.findFirst({ where: { slug, publie: true } });
  } catch (erreur) {
    console.error("Chargement de l'article impossible", erreur);
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/[lang]/actualites/[slug]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const article = await chargerArticle(slug);
  if (!article || !estLangue(lang)) return {};

  return {
    title: article.titre,
    description: article.chapo,
    alternates: alternances(lang, `/actualites/${article.slug}`),
    openGraph: {
      type: "article",
      title: article.titre,
      description: article.chapo,
      publishedTime: article.publieLe?.toISOString(),
    },
  };
}

export default async function PageArticle(
  props: PageProps<"/[lang]/actualites/[slug]">,
) {
  const { lang, slug } = await props.params;
  if (!estLangue(lang)) notFound();

  const article = await chargerArticle(slug);
  if (!article) notFound();

  const dico = getDictionnaire(lang);
  const dateLocale = new Intl.DateTimeFormat(LOCALES_INTL[lang], {
    dateStyle: "long",
  });
  const image = urlMedia(article.imageChemin);

  return (
    <>
      <EnTetePage titre={article.titre} chapo={article.chapo} />

      <section className="py-16 md:py-24">
        <Container>
          <article className="max-w-[70ch]">
            <Link
              href={chemin(lang, "/actualites")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
            >
              <ArrowLeftIcon size={16} weight="bold" aria-hidden />
              {dico.actualites.retour}
            </Link>

            {article.publieLe && (
              <p className="mt-6">
                <time
                  dateTime={article.publieLe.toISOString()}
                  className="text-sm text-ink-muted"
                >
                  {dico.actualites.publieLe.replace(
                    "{date}",
                    dateLocale.format(article.publieLe),
                  )}
                </time>
              </p>
            )}

            {image && (
              <div className="relative mt-6 aspect-16/9 overflow-hidden rounded-brand bg-surface-sunken">
                <Image
                  src={image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 70ch"
                  className="object-cover"
                />
              </div>
            )}

            <div className="mt-8 whitespace-pre-line leading-relaxed text-ink-muted">
              {article.contenu}
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
