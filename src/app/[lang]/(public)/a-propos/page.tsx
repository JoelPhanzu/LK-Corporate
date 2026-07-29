import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { EtatVide } from "@/components/public/etat-vide";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { getDictionnaire } from "@/lib/dictionnaire";
import { alternances, chemin, estLangue } from "@/lib/i18n";

export async function generateMetadata(
  props: PageProps<"/[lang]/a-propos">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.aPropos.metaTitre,
    description: dico.aPropos.metaDescription,
    alternates: alternances(lang, "/a-propos"),
  };
}

/**
 * Les engagements présentés ici traduisent en termes concrets les trois
 * valeurs énoncées au cahier des charges §1.2 (excellence, intégrité,
 * satisfaction). Ils sont à faire relire par le client avant mise en ligne.
 */
export default async function PageAPropos(
  props: PageProps<"/[lang]/a-propos">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);

  return (
    <>
      <EnTetePage titre={dico.aPropos.titre} chapo={dico.aPropos.chapo} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-2xl md:text-3xl">{dico.aPropos.quiTitre}</h2>
              <div className="mt-6 space-y-5 leading-relaxed text-ink-muted">
                {dico.aPropos.quiParagraphes.map((paragraphe) => (
                  <p key={paragraphe}>{paragraphe}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <Photo
                visuel="a-propos"
                alt=""
                largeur={800}
                hauteur={900}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full rounded-brand"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface-sunken py-16 md:py-24">
        <Container>
          <h2 className="max-w-[24ch] text-2xl md:text-3xl">
            {dico.aPropos.engagementsTitre}
          </h2>
          <dl className="mt-10 grid gap-x-12 border-t border-line md:grid-cols-2">
            {dico.aPropos.engagements.map((engagement) => (
              <div key={engagement.titre} className="border-b border-line py-6">
                <dt className="text-lg font-bold">{engagement.titre}</dt>
                <dd className="mt-2 max-w-[60ch] leading-relaxed text-ink-muted">
                  {engagement.texte}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Section « équipe » prévue au cahier des charges §4. En attente des
          photos et des fonctions transmises par le client (§8). */}
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-2xl md:text-3xl">{dico.aPropos.equipeTitre}</h2>
          <div className="mt-8">
            <EtatVide
              titre={dico.aPropos.equipeVideTitre}
              texte={dico.aPropos.equipeVideTexte}
            />
          </div>
        </Container>
      </section>

      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <h2 className="max-w-[28ch] text-2xl md:text-3xl">
              {dico.aPropos.ctaTitre}
            </h2>
            <LienBouton href={chemin(lang, "/devis")} className="shrink-0">
              {dico.commun.demanderDevis}
            </LienBouton>
          </div>
        </Container>
      </section>
    </>
  );
}
