import type { Metadata } from "next";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "LK-CORPORATE S.A.S.U., société congolaise de construction, de travaux publics, d'énergie et de logistique, au service des particuliers, des entreprises et des institutions.",
};

/**
 * Les engagements ci-dessous traduisent en termes concrets les trois valeurs
 * énoncées au cahier des charges §1.2 (excellence, intégrité, satisfaction).
 * Ils sont à faire relire par le client avant mise en ligne.
 */
const ENGAGEMENTS = [
  {
    titre: "Un devis qui tient",
    texte:
      "Le montant annoncé est le montant facturé. Toute évolution du périmètre est validée avec vous avant d'être engagée.",
  },
  {
    titre: "Des délais annoncés à l'avance",
    texte:
      "Chaque chantier démarre avec un calendrier écrit. Vous êtes prévenu dès qu'un aléa le décale, sans avoir à le demander.",
  },
  {
    titre: "Un interlocuteur unique",
    texte:
      "Une seule personne suit votre dossier du premier échange à la réception, quel que soit le nombre de corps de métier mobilisés.",
  },
  {
    titre: "Un suivi consultable en ligne",
    texte:
      "Vos commandes et vos livraisons sont suivies depuis le site, à toute heure, avec leur état d'avancement à jour.",
  },
];

export default function PageAPropos() {
  return (
    <>
      <EnTetePage
        titre="Une entreprise congolaise, un engagement de résultat"
        chapo="LK-CORPORATE S.A.S.U. accompagne particuliers, entreprises et institutions dans la réalisation de leurs projets de construction, d'équipement et de transport."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-2xl md:text-3xl">Qui nous sommes</h2>
              <div className="mt-6 space-y-5 leading-relaxed text-ink-muted">
                <p>
                  LK-CORPORATE S.A.S.U. est une société congolaise engagée à
                  fournir des solutions fiables, innovantes et durables dans les
                  domaines du commerce, de la construction, de l&apos;immobilier,
                  des travaux publics, de la logistique et du transport, des
                  énergies renouvelables et des services aux entreprises.
                </p>
                <p>
                  Grâce à une équipe compétente et à une approche axée sur la
                  qualité, l&apos;entreprise accompagne les particuliers, les
                  entreprises et les institutions dans la réalisation de leurs
                  projets, en garantissant professionnalisme, efficacité et
                  respect des délais.
                </p>
                <p>
                  L&apos;excellence, l&apos;intégrité et la satisfaction des
                  clients sont au cœur de chacune de ses réalisations.
                </p>
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
            Ce que vous pouvez attendre de nous
          </h2>
          <dl className="mt-10 grid gap-x-12 border-t border-line md:grid-cols-2">
            {ENGAGEMENTS.map((engagement) => (
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
          <h2 className="text-2xl md:text-3xl">L&apos;équipe</h2>
          <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="text-lg font-semibold">
              Les membres de l&apos;équipe seront présentés ici
            </p>
            <p className="mx-auto mt-2 max-w-[60ch] leading-relaxed text-ink-muted">
              Photo, nom et fonction de chaque interlocuteur, mis à jour depuis
              l&apos;espace admin.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <h2 className="max-w-[28ch] text-2xl md:text-3xl">
              Parlons de votre projet
            </h2>
            <LienBouton href="/devis" className="shrink-0">
              Demander un devis
            </LienBouton>
          </div>
        </Container>
      </section>
    </>
  );
}
