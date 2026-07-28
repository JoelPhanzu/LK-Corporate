import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnTetePage } from "@/components/public/en-tete-page";
import { EtatVide } from "@/components/public/etat-vide";
import { Container } from "@/components/ui/container";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Annonces, avancement de chantiers et événements de LK-CORPORATE S.A.S.U.",
};

export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

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

export default async function PageActualites() {
  const articles = await chargerArticles();

  return (
    <>
      <EnTetePage
        titre="Actualités"
        chapo="Avancement des chantiers, nouvelles prestations et vie de l'entreprise."
      />

      <section className="py-16 md:py-24">
        <Container>
          {articles === null && (
            <EtatVide
              titre="Actualités momentanément indisponibles"
              texte="Le fil ne peut pas être chargé pour le moment. Réessayez dans quelques minutes."
            />
          )}

          {articles !== null && articles.length === 0 && (
            <EtatVide
              titre="Aucune actualité publiée pour l'instant"
              texte="Les articles rédigés depuis l'espace admin apparaîtront ici dès leur publication."
            />
          )}

          {articles !== null && articles.length > 0 && (
            <ul className="max-w-4xl divide-y divide-line border-y border-line">
              {articles.map((article) => {
                const image = urlMedia(article.imageChemin);

                return (
                  <li key={article.slug}>
                    <Link
                      href={`/actualites/${article.slug}`}
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
                            {dateFr.format(article.publieLe)}
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
