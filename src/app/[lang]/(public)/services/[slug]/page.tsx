import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { getDictionnaire } from "@/lib/dictionnaire";
import { DOMAINES } from "@/lib/domaines";
import { domaine as getDomaine, domaines } from "@/lib/domaines-en";
import { LANGUES, alternances, chemin, estLangue } from "@/lib/i18n";
import type { CleVisuel } from "@/lib/photos";

/**
 * Neuf domaines dans deux langues : les dix-huit pages sont connues à la
 * compilation et entièrement statiques.
 */
export function generateStaticParams() {
  return LANGUES.flatMap((lang) =>
    DOMAINES.map((domaine) => ({ lang, slug: domaine.slug })),
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/services/[slug]">,
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!estLangue(lang)) return {};

  const domaine = getDomaine(slug, lang);
  if (!domaine) return {};

  return {
    title: domaine.titre,
    description: domaine.resume,
    alternates: alternances(lang, `/services/${domaine.slug}`),
  };
}

export default async function PageDomaine(
  props: PageProps<"/[lang]/services/[slug]">,
) {
  const { lang, slug } = await props.params;
  if (!estLangue(lang)) notFound();

  const domaine = getDomaine(slug, lang);
  if (!domaine) notFound();

  const dico = getDictionnaire(lang);
  const autres = domaines(lang).filter((item) => item.slug !== domaine.slug);

  return (
    <>
      <EnTetePage titre={domaine.titre} chapo={domaine.resume} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-2xl md:text-3xl">
                {dico.services.priseEnCharge}
              </h2>
              <ul className="mt-8 divide-y divide-line border-y border-line">
                {domaine.prestations.map((prestation) => (
                  <li key={prestation} className="flex items-start gap-3 py-4">
                    <CheckIcon
                      size={20}
                      weight="bold"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent-text"
                    />
                    <span className="leading-relaxed">{prestation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lg:col-span-5">
              <Photo
                // `Domaine.slug` est typé `string`, mais la page a déjà rendu
                // un 404 pour tout slug inconnu : la valeur est forcément l'un
                // des neuf domaines, tous présents au catalogue.
                visuel={domaine.slug as CleVisuel}
                alt=""
                largeur={800}
                hauteur={600}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full rounded-brand"
              />
              <div className="mt-6 rounded-brand border border-line bg-surface-sunken p-6">
                <h2 className="text-lg font-bold">
                  {dico.services.besoinTitre}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {dico.services.besoinTexte}
                </p>
                <LienBouton
                  href={chemin(lang, `/devis?domaine=${domaine.slug}`)}
                  className="mt-5 w-full"
                >
                  {dico.commun.demanderDevis}
                </LienBouton>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-surface-sunken py-16 md:py-20">
        <Container>
          <h2 className="text-2xl md:text-3xl">
            {dico.services.autresDomaines}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {autres.map((item) => (
              <li key={item.slug}>
                <Link
                  href={chemin(lang, `/services/${item.slug}`)}
                  className="inline-flex items-center gap-1.5 rounded-brand border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:text-accent-text"
                >
                  {item.nom}
                  <ArrowRightIcon size={14} weight="bold" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
