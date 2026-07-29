import Link from "next/link";
import { Logo } from "@/components/logo";
import { SelecteurLangue } from "@/components/preferences/selecteur-langue";
import { SelecteurTheme } from "@/components/theme/selecteur-theme";
import { Container } from "@/components/ui/container";
import { getCoordonnees } from "@/lib/contenu";
import { domaines } from "@/lib/domaines-en";
import { getDictionnaire } from "@/lib/dictionnaire";
import { chemin, type Langue } from "@/lib/i18n";
import { NAV_PUBLIC, SITE } from "@/lib/site";

const ANNEE = new Date().getFullYear();

/**
 * Les coordonnées manquantes ne sont pas remplacées par des valeurs fictives :
 * chaque champ vide est simplement omis, et l'absence reste visible pour le
 * client tant qu'il ne les a pas transmises (cahier des charges §8).
 */
export async function Footer({ langue }: { langue: Langue }) {
  const contact = await getCoordonnees();
  const adresse = [contact.adresse, contact.ville, contact.pays].filter(Boolean);
  const dico = getDictionnaire(langue);
  const listeDomaines = domaines(langue);

  return (
    <footer className="mt-auto bg-surface-brand-deep text-ink-on-brand-muted">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-8">
            <Logo surMarque langue={langue} />
            <p className="mt-4 text-sm leading-relaxed max-w-[45ch]">
              {dico.site.description}
            </p>
          </div>

          <nav aria-label={dico.pied.navigationAria}>
            <h2 className="text-sm font-semibold text-ink-on-brand">
              {dico.pied.navigation}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_PUBLIC.map((item) => (
                <li key={item.href}>
                  <Link
                    href={chemin(langue, item.href)}
                    className="text-sm hover:text-ink-on-brand transition-colors"
                  >
                    {dico.nav[item.cle]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={dico.pied.servicesAria}>
            <h2 className="text-sm font-semibold text-ink-on-brand">
              {dico.pied.services}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {listeDomaines.slice(0, 5).map((item) => (
                <li key={item.slug}>
                  <Link
                    href={chemin(langue, `/services/${item.slug}`)}
                    className="text-sm hover:text-ink-on-brand transition-colors"
                  >
                    {item.nom}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={chemin(langue, "/services")}
                  className="text-sm text-accent-on-brand hover:underline"
                >
                  {dico.pied.voirTousDomaines}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-ink-on-brand">
              {dico.pied.contact}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {contact.telephone && (
                <li>
                  <a
                    href={`tel:${contact.telephone.replace(/\s/g, "")}`}
                    className="hover:text-ink-on-brand transition-colors"
                  >
                    {contact.telephone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-ink-on-brand transition-colors"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {adresse.length > 0 && (
                <li className="not-italic">
                  <address className="not-italic">
                    {adresse.join(", ")}
                  </address>
                </li>
              )}
              <li>
                <Link
                  href={chemin(langue, "/suivi")}
                  className="hover:text-ink-on-brand transition-colors"
                >
                  {dico.commun.suivreCommande}
                </Link>
              </li>
            </ul>

            {contact.reseaux.length > 0 && (
              <ul className="mt-5 flex gap-4">
                {contact.reseaux.map((reseau) => (
                  <li key={reseau.url}>
                    <a
                      href={reseau.url}
                      className="text-sm hover:text-ink-on-brand transition-colors"
                    >
                      {reseau.nom}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Rangée des préférences d'affichage. Le thème vaut pour tout le site,
            espace d'administration compris : il est conservé par le navigateur,
            pas par la page. La langue, elle, ne concerne que le vitrine. */}
        <div className="flex flex-wrap items-start gap-x-12 gap-y-6 border-t border-white/10 py-7">
          <SelecteurLangue langue={langue} titre={dico.preferences.langue} />
          <SelecteurTheme
            libelles={{
              titre: dico.preferences.theme,
              clair: dico.preferences.themeClair,
              sombre: dico.preferences.themeSombre,
              appareil: dico.preferences.themeAppareil,
            }}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            {ANNEE} {SITE.raisonSociale}. {dico.pied.droitsReserves}
          </p>
          <Link
            href={chemin(langue, "/mentions-legales")}
            className="hover:text-ink-on-brand transition-colors"
          >
            {dico.pied.mentionsLegales}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
