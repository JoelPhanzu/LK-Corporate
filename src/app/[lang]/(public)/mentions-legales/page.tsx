import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { estLangue } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata(
  props: PageProps<"/[lang]/mentions-legales">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  return {
    title: getDictionnaire(lang).mentions.titre,
    // Page de service : utile aux visiteurs, sans intérêt dans l'index.
    robots: { index: false, follow: true },
  };
}

/**
 * ⚠ Page à compléter avant mise en ligne.
 *
 * Les mentions légales engagent juridiquement l'entreprise : aucune des
 * informations manquantes n'est inventée ici. Le cahier des charges §8 prévoit
 * que le client fournisse ces textes définitifs. Les rubriques ci-dessous
 * donnent la structure et signalent explicitement ce qui reste à renseigner.
 */
export default async function PageMentionsLegales(
  props: PageProps<"/[lang]/mentions-legales">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);

  return (
    <>
      <EnTetePage titre={dico.mentions.titre} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-[70ch]">
            <div className="rounded-brand border border-dashed border-line-strong p-6">
              <p className="font-semibold">
                {dico.mentions.avertissementTitre}
              </p>
              <p className="mt-2 leading-relaxed text-ink-muted">
                {dico.mentions.avertissementTexte.replace(
                  "{raisonSociale}",
                  SITE.raisonSociale,
                )}
              </p>
            </div>

            <div className="mt-10 space-y-10">
              {dico.mentions.rubriques.map((rubrique) => (
                <section key={rubrique.titre}>
                  <h2 className="text-xl font-bold">{rubrique.titre}</h2>
                  <ul className="mt-4 space-y-2 border-t border-line pt-4">
                    {rubrique.aRenseigner.map((element) => (
                      <li
                        key={element}
                        className="text-sm leading-relaxed text-ink-muted"
                      >
                        {element}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
