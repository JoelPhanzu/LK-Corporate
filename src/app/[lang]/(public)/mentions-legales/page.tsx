import type { Metadata } from "next";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: true },
};

/**
 * ⚠ Page à compléter avant mise en ligne.
 *
 * Les mentions légales engagent juridiquement l'entreprise : aucune des
 * informations manquantes n'est inventée ici. Le cahier des charges §8 prévoit
 * que le client fournisse ces textes définitifs. Les rubriques ci-dessous
 * donnent la structure et signalent explicitement ce qui reste à renseigner.
 */
const RUBRIQUES = [
  {
    titre: "Éditeur du site",
    aRenseigner: [
      "Dénomination sociale complète et forme juridique",
      "Adresse du siège social",
      "Numéro RCCM et identifiant national",
      "Nom du représentant légal et du directeur de la publication",
      "Téléphone et adresse email de contact",
    ],
  },
  {
    titre: "Hébergement",
    aRenseigner: [
      "Nom de l'hébergeur retenu",
      "Adresse et coordonnées de l'hébergeur",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    aRenseigner: [
      "Mention de réserve des droits sur les textes, photographies et logo",
    ],
  },
  {
    titre: "Données personnelles",
    aRenseigner: [
      "Finalité des données collectées par les formulaires de devis et de contact",
      "Durée de conservation",
      "Modalités d'exercice des droits d'accès, de rectification et de suppression",
    ],
  },
];

export default function PageMentionsLegales() {
  return (
    <>
      <EnTetePage titre="Mentions légales" />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-[70ch]">
            <div className="rounded-brand border border-dashed border-line-strong p-6">
              <p className="font-semibold">Page à compléter avant mise en ligne</p>
              <p className="mt-2 leading-relaxed text-ink-muted">
                Les informations légales de {SITE.raisonSociale} doivent être
                fournies par l&apos;entreprise. Elles n&apos;ont volontairement
                pas été rédigées à sa place.
              </p>
            </div>

            <div className="mt-10 space-y-10">
              {RUBRIQUES.map((rubrique) => (
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
