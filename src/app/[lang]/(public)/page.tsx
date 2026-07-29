import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Photo } from "@/components/ui/photo";
import { DOMAINES, getDomaine } from "@/lib/domaines";

const VALEURS = [
  {
    titre: "Excellence",
    texte:
      "Des ouvrages exécutés dans les règles de l'art, contrôlés à chaque étape du chantier.",
  },
  {
    titre: "Intégrité",
    texte:
      "Des engagements tenus sur les délais, les quantités et les prix annoncés.",
  },
  {
    titre: "Satisfaction client",
    texte:
      "Un interlocuteur unique, joignable, qui rend compte de l'avancement sans qu'on ait à le relancer.",
  },
];

export default function PageAccueil() {
  const domainePhare = getDomaine("genie-civil")!;
  const autresDomaines = DOMAINES.filter(
    (domaine) => domaine.slug !== domainePhare.slug,
  );

  return (
    <>
      {/* ---------- Hero : découpe asymétrique sur aplat de marque ---------- */}
      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h1 className="text-4xl leading-[1.05] md:text-5xl lg:text-6xl">
                Construire, équiper, livrer.
              </h1>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-on-brand-muted">
                Génie civil, travaux publics, énergie solaire et logistique pour
                les particuliers, les entreprises et les institutions.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <LienBouton href="/devis">Demander un devis</LienBouton>
                <LienBouton href="/realisations" variante="surMarque">
                  Voir nos réalisations
                </LienBouton>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Photo
                visuel="accueil-hero"
                largeur={1200}
                hauteur={900}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full rounded-brand"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Services : un domaine mis en avant, huit en liste ---------- */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="max-w-[54ch]">
            <h2 className="text-3xl md:text-4xl">
              Neuf domaines, un seul interlocuteur
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Du gros œuvre à l&apos;approvisionnement, LK-CORPORATE couvre la
              chaîne complète d&apos;un projet sans multiplier les prestataires.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Link
              href={`/services/${domainePhare.slug}`}
              className="group lg:col-span-5"
            >
              <Photo
                visuel="accueil-domaine-phare"
                alt=""
                largeur={900}
                hauteur={640}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full rounded-brand"
              />
              <h3 className="mt-5 text-xl font-bold">{domainePhare.titre}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">
                {domainePhare.resume}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text">
                Découvrir ce domaine
                <ArrowRightIcon
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            <ul className="lg:col-span-7 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {autresDomaines.map((domaine) => (
                <li key={domaine.slug} className="border-b border-line">
                  <Link
                    href={`/services/${domaine.slug}`}
                    className="group flex items-start justify-between gap-4 py-5 transition-colors hover:text-accent-text"
                  >
                    <span>
                      <span className="block font-semibold">{domaine.nom}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                        {domaine.resume}
                      </span>
                    </span>
                    <ArrowUpRightIcon
                      size={18}
                      weight="bold"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-line-strong transition-colors group-hover:text-accent-text"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------- Valeurs : énoncé à gauche, valeurs filetées à droite ---------- */}
      <section className="bg-surface-sunken py-20 md:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-3xl md:text-4xl">
                Ce sur quoi nos clients nous jugent
              </h2>
              <p className="mt-4 leading-relaxed text-ink-muted">
                LK-CORPORATE intervient auprès de particuliers, d&apos;entreprises
                et d&apos;institutions. Trois exigences valent pour tous.
              </p>
              <Link
                href="/a-propos"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
              >
                En savoir plus sur l&apos;entreprise
                <ArrowRightIcon size={16} weight="bold" />
              </Link>
            </div>

            <dl className="lg:col-span-7 divide-y divide-line border-y border-line">
              {VALEURS.map((valeur) => (
                <div key={valeur.titre} className="py-6">
                  <dt className="text-lg font-bold">{valeur.titre}</dt>
                  <dd className="mt-1.5 max-w-[60ch] leading-relaxed text-ink-muted">
                    {valeur.texte}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ---------- Réalisations ----------
          Section alimentée depuis l'espace admin. Tant que le client n'a pas
          transmis ses photos de chantiers (cahier des charges §8), elle affiche
          son état vide plutôt que des projets inventés. */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl md:text-4xl">Réalisations récentes</h2>
            <Link
              href="/realisations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
            >
              Toutes les réalisations
              <ArrowRightIcon size={16} weight="bold" />
            </Link>
          </div>

          <div className="mt-10 rounded-brand border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="text-lg font-semibold">
              Les premières réalisations seront publiées ici
            </p>
            <p className="mx-auto mt-2 max-w-[60ch] leading-relaxed text-ink-muted">
              Chaque projet est ajouté depuis l&apos;espace admin, avec ses
              photos avant et après, sa description et sa localisation.
            </p>
          </div>
        </Container>
      </section>

      {/* ---------- Rappel de l'action principale ---------- */}
      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 className="text-2xl md:text-3xl">
                Un projet, un besoin de matériaux ou de transport ?
              </h2>
              <p className="mt-3 max-w-[54ch] leading-relaxed text-ink-on-brand-muted">
                Décrivez votre besoin en quelques lignes, joignez vos documents
                ou photos, et recevez une proposition chiffrée.
              </p>
            </div>
            <LienBouton href="/devis" className="shrink-0">
              Demander un devis
            </LienBouton>
          </div>
        </Container>
      </section>
    </>
  );
}
