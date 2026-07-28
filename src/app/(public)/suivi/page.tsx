import type { Metadata } from "next";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { FriseLivraison } from "@/components/public/frise-livraison";
import { Bouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Champ, Input } from "@/components/ui/formulaire";
import { getDomaine } from "@/lib/domaines";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Suivre une commande",
  description:
    "Suivez l'état de votre commande ou de votre livraison LK-CORPORATE à l'aide de votre référence.",
  // Page de consultation personnelle : sans intérêt pour les moteurs.
  robots: { index: false, follow: true },
};

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

type Resultat =
  | { type: "aucune-recherche" }
  | { type: "introuvable" }
  | { type: "indisponible" }
  | {
      type: "trouvee";
      reference: string;
      domaine: string;
      creeLe: Date;
      statut: string;
      etapes: { statut: string; commentaire: string | null; creeLe: Date }[];
    };

async function chercher(reference: string): Promise<Resultat> {
  if (!reference) return { type: "aucune-recherche" };

  try {
    const demande = await prisma.demande.findUnique({
      where: { reference },
      // Sélection volontairement étroite : la référence seule suffit à
      // consulter cette page, on n'y expose donc ni la description du projet
      // ni les coordonnées du demandeur.
      select: {
        reference: true,
        domaineSlug: true,
        creeLe: true,
        livraison: {
          select: {
            statut: true,
            etapes: {
              orderBy: { creeLe: "asc" },
              select: { statut: true, commentaire: true, creeLe: true },
            },
          },
        },
      },
    });

    if (!demande) return { type: "introuvable" };

    return {
      type: "trouvee",
      reference: demande.reference,
      domaine: getDomaine(demande.domaineSlug)?.nom ?? demande.domaineSlug,
      creeLe: demande.creeLe,
      statut: demande.livraison?.statut ?? "RECUE",
      etapes: demande.livraison?.etapes ?? [],
    };
  } catch (erreur) {
    console.error("Consultation du suivi impossible", erreur);
    return { type: "indisponible" };
  }
}

export default async function PageSuivi(props: PageProps<"/suivi">) {
  const { reference } = await props.searchParams;
  const saisie = typeof reference === "string" ? reference.trim().toUpperCase() : "";
  const resultat = await chercher(saisie);

  return (
    <>
      <EnTetePage
        titre="Suivre une commande"
        chapo="Saisissez la référence reçue lors de votre demande. Aucun compte n'est nécessaire."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            {/* Formulaire en GET : la référence reste dans l'URL, donc la page
                est partageable et rechargeable, et fonctionne sans JavaScript. */}
            <form method="get" className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Champ
                  htmlFor="reference"
                  label="Référence de suivi"
                  aide="Format « LK-XXXXXX », communiqué à l'envoi de votre demande."
                  obligatoire
                >
                  <Input
                    id="reference"
                    name="reference"
                    defaultValue={saisie}
                    required
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono uppercase"
                    aria-describedby="reference-aide"
                  />
                </Champ>
              </div>
              <Bouton type="submit" className="sm:mb-0">
                <MagnifyingGlassIcon size={18} weight="bold" aria-hidden />
                Rechercher
              </Bouton>
            </form>

            <div className="mt-10">
              {resultat.type === "introuvable" && (
                <div
                  role="status"
                  className="rounded-brand border border-line bg-surface-sunken p-6"
                >
                  <p className="font-semibold">Aucune demande sous cette référence</p>
                  <p className="mt-2 leading-relaxed text-ink-muted">
                    Vérifiez la saisie, en particulier le tiret. Si le doute
                    persiste, contactez-nous en précisant la date de votre
                    demande.
                  </p>
                </div>
              )}

              {resultat.type === "indisponible" && (
                <div
                  role="alert"
                  className="rounded-brand border border-line bg-surface-sunken p-6"
                >
                  <p className="font-semibold">Suivi momentanément indisponible</p>
                  <p className="mt-2 leading-relaxed text-ink-muted">
                    Le service de suivi ne répond pas pour le moment. Réessayez
                    dans quelques minutes.
                  </p>
                </div>
              )}

              {resultat.type === "trouvee" && (
                <article className="rounded-brand border border-line p-6 md:p-8">
                  <p className="text-sm font-semibold text-ink-muted">
                    Référence
                  </p>
                  <h2 className="mt-1 font-mono text-2xl font-bold">
                    {resultat.reference}
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    {resultat.domaine}, demande du{" "}
                    {dateFr.format(resultat.creeLe)}
                  </p>

                  <div className="mt-8 border-t border-line pt-8">
                    <FriseLivraison statut={resultat.statut} />
                  </div>

                  {resultat.etapes.length > 0 && (
                    <div className="mt-8 border-t border-line pt-6">
                      <h3 className="text-sm font-semibold text-ink-muted">
                        Historique
                      </h3>
                      <ol className="mt-4 space-y-4">
                        {resultat.etapes.map((etape, index) => (
                          <li key={index} className="flex flex-col gap-0.5">
                            <time
                              dateTime={etape.creeLe.toISOString()}
                              className="text-sm text-ink-muted"
                            >
                              {dateFr.format(etape.creeLe)}
                            </time>
                            <span className="leading-relaxed">
                              {etape.commentaire ?? "Mise à jour du statut."}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </article>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
