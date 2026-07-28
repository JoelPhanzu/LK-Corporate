import type { Metadata } from "next";
import Link from "next/link";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getCoordonnees } from "@/lib/contenu";
import { FormulaireContact } from "./formulaire-contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez LK-CORPORATE S.A.S.U. pour un projet de construction, une fourniture de matériaux, une installation solaire ou une prestation de transport.",
};

export default async function PageContact() {
  const contact = await getCoordonnees();
  const adresse = [contact.adresse, contact.ville, contact.pays].filter(Boolean);
  const aDesCoordonnees =
    Boolean(contact.telephone) || Boolean(contact.email) || adresse.length > 0;

  return (
    <>
      <EnTetePage
        titre="Nous contacter"
        chapo="Une question, une demande de renseignement ou un partenariat. Pour un chiffrage, passez plutôt par le formulaire de devis."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <FormulaireContact />
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-brand border border-line bg-surface-sunken p-6">
                <h2 className="text-lg font-bold">Coordonnées</h2>

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
                    Téléphone, adresse email et localisation seront affichés ici
                    dès leur transmission par LK-CORPORATE.
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
                <h2 className="text-lg font-bold">Besoin d&apos;un chiffrage ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Le formulaire de devis permet de préciser le domaine, les
                  délais et de joindre vos documents.
                </p>
                <Link
                  href="/devis"
                  className="mt-4 inline-flex text-sm font-semibold text-accent-text hover:underline"
                >
                  Aller au formulaire de devis
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
