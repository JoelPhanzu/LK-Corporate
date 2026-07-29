import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { domaines } from "@/lib/domaines-en";
import { alternances, chemin, estLangue } from "@/lib/i18n";

export async function generateMetadata(
  props: PageProps<"/[lang]/services">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.services.metaTitre,
    description: dico.services.metaDescription,
    alternates: alternances(lang, "/services"),
  };
}

export default async function PageServices(
  props: PageProps<"/[lang]/services">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);

  return (
    <>
      <EnTetePage titre={dico.services.titre} chapo={dico.services.chapo} />

      <section className="py-16 md:py-24">
        <Container>
          {/* Grille filetée plutôt que cartes : neuf entrées, neuf cellules,
              aucune case vide, et une densité lisible dès le mobile. */}
          <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12">
            {domaines(lang).map((domaine) => (
              <li key={domaine.slug} className="border-b border-line">
                <Link
                  href={chemin(lang, `/services/${domaine.slug}`)}
                  className="group block h-full py-7 transition-colors hover:text-accent-text"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug">
                      {domaine.nom}
                    </h2>
                    <ArrowUpRightIcon
                      size={18}
                      weight="bold"
                      aria-hidden
                      className="mt-1 shrink-0 text-line-strong transition-colors group-hover:text-accent-text"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {domaine.resume}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 className="text-2xl md:text-3xl">{dico.services.ctaTitre}</h2>
              <p className="mt-3 max-w-[54ch] leading-relaxed text-ink-on-brand-muted">
                {dico.services.ctaTexte}
              </p>
            </div>
            <LienBouton href={chemin(lang, "/devis")} className="shrink-0">
              {dico.commun.demanderDevis}
            </LienBouton>
          </div>
        </Container>
      </section>
    </>
  );
}
