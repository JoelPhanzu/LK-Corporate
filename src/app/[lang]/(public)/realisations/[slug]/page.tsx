import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { domaine as getDomaine } from "@/lib/domaines-en";
import { alternances, chemin, estLangue } from "@/lib/i18n";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function chargerRealisation(slug: string) {
  try {
    return await prisma.realisation.findFirst({
      where: { slug, publie: true },
    });
  } catch (erreur) {
    console.error("Chargement de la réalisation impossible", erreur);
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/[lang]/realisations/[slug]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const realisation = await chargerRealisation(slug);
  if (!realisation || !estLangue(lang)) return {};

  return {
    title: realisation.titre,
    description: realisation.description.slice(0, 160),
    alternates: alternances(lang, `/realisations/${realisation.slug}`),
  };
}

/**
 * Le titre, la description et les photos viennent de la base : ils restent
 * dans la langue de rédaction, conformément au périmètre retenu. Seule
 * l'interface qui les entoure est traduite.
 */
export default async function PageRealisation(
  props: PageProps<"/[lang]/realisations/[slug]">,
) {
  const { lang, slug } = await props.params;
  if (!estLangue(lang)) notFound();

  const realisation = await chargerRealisation(slug);
  if (!realisation) notFound();

  const dico = getDictionnaire(lang);
  const domaine = getDomaine(realisation.domaineSlug, lang);
  const avant = urlMedia(realisation.photoAvantChemin);
  const apres = urlMedia(realisation.photoApresChemin);

  return (
    <>
      <EnTetePage
        titre={realisation.titre}
        chapo={[domaine?.nom, realisation.localisation]
          .filter(Boolean)
          .join(", ")}
      />

      <section className="py-16 md:py-24">
        <Container>
          <Link
            href={chemin(lang, "/realisations")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
          >
            <ArrowLeftIcon size={16} weight="bold" aria-hidden />
            {dico.realisations.retour}
          </Link>

          {/* Comparaison avant / après : deux images légendées côte à côte,
              sans curseur interactif, pour rester lisible au clavier et léger
              en mobile. */}
          {(avant || apres) && (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {avant && (
                <figure>
                  <div className="relative aspect-4/3 overflow-hidden rounded-brand bg-surface-sunken">
                    <Image
                      src={avant}
                      alt={dico.realisations.altAvant.replace(
                        "{titre}",
                        realisation.titre,
                      )}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm font-semibold text-ink-muted">
                    {dico.realisations.avant}
                  </figcaption>
                </figure>
              )}
              {apres && (
                <figure>
                  <div className="relative aspect-4/3 overflow-hidden rounded-brand bg-surface-sunken">
                    <Image
                      src={apres}
                      alt={dico.realisations.altApres.replace(
                        "{titre}",
                        realisation.titre,
                      )}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm font-semibold text-ink-muted">
                    {dico.realisations.apres}
                  </figcaption>
                </figure>
              )}
            </div>
          )}

          <div className="mt-10 max-w-[70ch] whitespace-pre-line leading-relaxed text-ink-muted">
            {realisation.description}
          </div>

          {realisation.photosChemins.length > 0 && (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {realisation.photosChemins.map((cheminMedia) => {
                const url = urlMedia(cheminMedia);
                if (!url) return null;
                return (
                  <li
                    key={cheminMedia}
                    className="relative aspect-4/3 overflow-hidden rounded-brand bg-surface-sunken"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {domaine && (
            <div className="mt-12 border-t border-line pt-8">
              {/* La phrase est coupée de part et d'autre du lien : l'ordre des
                  mots diffère d'une langue à l'autre, et une chaîne unique
                  avec un gabarit interdirait de placer le lien correctement. */}
              <p className="leading-relaxed text-ink-muted">
                {dico.realisations.releveAvant}
                <Link
                  href={chemin(lang, `/services/${domaine.slug}`)}
                  className="font-semibold text-accent-text hover:underline"
                >
                  {domaine.nom}
                </Link>
                {dico.realisations.releveApres}
              </p>
              <LienBouton
                href={chemin(lang, `/devis?domaine=${domaine.slug}`)}
                className="mt-5"
              >
                {dico.commun.demanderDevis}
              </LienBouton>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
