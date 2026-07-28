import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { DOMAINES, getDomaine } from "@/lib/domaines";
import type { CleVisuel } from "@/lib/photos";

/** Les neuf domaines sont connus à la compilation : pages entièrement statiques. */
export function generateStaticParams() {
  return DOMAINES.map((domaine) => ({ slug: domaine.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const domaine = getDomaine(slug);
  if (!domaine) return {};

  return {
    title: domaine.titre,
    description: domaine.resume,
    alternates: { canonical: `/services/${domaine.slug}` },
  };
}

export default async function PageDomaine(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const domaine = getDomaine(slug);
  if (!domaine) notFound();

  const autres = DOMAINES.filter((item) => item.slug !== domaine.slug);

  return (
    <>
      <EnTetePage titre={domaine.titre} chapo={domaine.resume} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-2xl md:text-3xl">Ce que nous prenons en charge</h2>
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
                <h2 className="text-lg font-bold">Un besoin sur ce domaine ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Le formulaire arrive avec ce domaine déjà sélectionné. Vous
                  pouvez y joindre vos plans, photos ou documents.
                </p>
                <LienBouton
                  href={`/devis?domaine=${domaine.slug}`}
                  className="mt-5 w-full"
                >
                  Demander un devis
                </LienBouton>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-surface-sunken py-16 md:py-20">
        <Container>
          <h2 className="text-2xl md:text-3xl">Autres domaines</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {autres.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/services/${item.slug}`}
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
