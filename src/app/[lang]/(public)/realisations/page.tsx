import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { EtatVide } from "@/components/public/etat-vide";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { domaine as getDomaine } from "@/lib/domaines-en";
import { alternances, chemin, estLangue } from "@/lib/i18n";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(
  props: PageProps<"/[lang]/realisations">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.realisations.metaTitre,
    description: dico.realisations.metaDescription,
    alternates: alternances(lang, "/realisations"),
  };
}

// Contenu piloté depuis l'espace admin, sans base de données disponible à la
// compilation. À revoir en Phase 4 pour passer en régénération incrémentale
// une fois Supabase en place.
export const dynamic = "force-dynamic";

async function chargerRealisations() {
  try {
    return await prisma.realisation.findMany({
      where: { publie: true },
      orderBy: [{ ordre: "asc" }, { creeLe: "desc" }],
      select: {
        slug: true,
        titre: true,
        description: true,
        localisation: true,
        domaineSlug: true,
        photoApresChemin: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des réalisations impossible", erreur);
    return null;
  }
}

export default async function PageRealisations(
  props: PageProps<"/[lang]/realisations">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);
  const realisations = await chargerRealisations();

  return (
    <>
      <EnTetePage
        titre={dico.realisations.titre}
        chapo={dico.realisations.chapo}
      />

      <section className="py-16 md:py-24">
        <Container>
          {realisations === null && (
            <EtatVide
              titre={dico.realisations.erreurTitre}
              texte={dico.realisations.erreurTexte}
            />
          )}

          {realisations !== null && realisations.length === 0 && (
            <EtatVide
              titre={dico.realisations.videTitre}
              texte={dico.realisations.videTexte}
            />
          )}

          {realisations !== null && realisations.length > 0 && (
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {realisations.map((realisation) => {
                const image = urlMedia(realisation.photoApresChemin);
                const domaine = getDomaine(realisation.domaineSlug, lang);

                return (
                  <li key={realisation.slug}>
                    <Link
                      href={chemin(lang, `/realisations/${realisation.slug}`)}
                      className="group block"
                    >
                      <div className="relative aspect-4/3 overflow-hidden rounded-brand bg-surface-sunken">
                        {image && (
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <h2 className="mt-4 text-lg font-bold leading-snug group-hover:text-accent-text">
                        {realisation.titre}
                      </h2>
                      <p className="mt-1 text-sm text-ink-muted">
                        {[domaine?.nom, realisation.localisation]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
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
