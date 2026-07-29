import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getCoordonnees } from "@/lib/contenu";
import { getDictionnaire } from "@/lib/dictionnaire";
import { alternances, chemin, estLangue } from "@/lib/i18n";
import { FormulaireContact } from "./formulaire-contact";

export async function generateMetadata(
  props: PageProps<"/[lang]/contact">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.contact.metaTitre,
    description: dico.contact.metaDescription,
    alternates: alternances(lang, "/contact"),
  };
}

export default async function PageContact(
  props: PageProps<"/[lang]/contact">,
) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);
  const contact = await getCoordonnees();
  const adresse = [contact.adresse, contact.ville, contact.pays].filter(Boolean);
  const aDesCoordonnees =
    Boolean(contact.telephone) || Boolean(contact.email) || adresse.length > 0;

  return (
    <>
      <EnTetePage titre={dico.contact.titre} chapo={dico.contact.chapo} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <FormulaireContact
              langue={lang}
                libelles={{
                  succesTitre: dico.contact.succesTitre,
                  succesTexte: dico.contact.succesTexte,
                  champNom: dico.contact.champNom,
                  champEmail: dico.contact.champEmail,
                  champTelephone: dico.contact.champTelephone,
                  champSujet: dico.contact.champSujet,
                  champMessage: dico.contact.champMessage,
                  nePasRemplir: dico.contact.nePasRemplir,
                  envoyer: dico.contact.envoyer,
                  envoi: dico.commun.envoi,
                  facultatif: dico.contact.facultatif,
                }}
              />
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-brand border border-line bg-surface-sunken p-6">
                <h2 className="text-lg font-bold">
                  {dico.contact.coordonneesTitre}
                </h2>

                {aDesCoordonnees ? (
                  <ul className="mt-4 space-y-3 text-sm">
                    {contact.telephone && (
                      <li>
                        <a
                          href={`tel:${contact.telephone.replace(/\s/g, "")}`}
                          className="hover:text-accent-text"
                        >
                          {contact.telephone}
                        </a>
                      </li>
                    )}
                    {contact.email && (
                      <li>
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-accent-text"
                        >
                          {contact.email}
                        </a>
                      </li>
                    )}
                    {adresse.length > 0 && (
                      <li>
                        <address className="not-italic">
                          {adresse.join(", ")}
                        </address>
                      </li>
                    )}
                  </ul>
                ) : (
                  /* Aucune coordonnée n'est inventée : le cahier des charges §8
                     les attend du client. La carte demandée au §4 sera ajoutée
                     en même temps que l'adresse. */
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    {dico.contact.coordonneesVide}
                  </p>
                )}

                {contact.reseaux.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-3 text-sm">
                    {contact.reseaux.map((reseau) => (
                      <li key={reseau.url}>
                        <a href={reseau.url} className="hover:text-accent-text">
                          {reseau.nom}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 rounded-brand border border-line p-6">
                <h2 className="text-lg font-bold">
                  {dico.contact.chiffrageTitre}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {dico.contact.chiffrageTexte}
                </p>
                <Link
                  href={chemin(lang, "/devis")}
                  className="mt-4 inline-flex text-sm font-semibold text-accent-text hover:underline"
                >
                  {dico.contact.chiffrageLien}
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
