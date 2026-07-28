import Link from "next/link";
import { Logo } from "@/components/logo";
import { SelecteurTheme } from "@/components/theme/selecteur-theme";
import { Container } from "@/components/ui/container";
import { DOMAINES } from "@/lib/domaines";
import { getCoordonnees } from "@/lib/contenu";
import { NAV_PUBLIC, SITE } from "@/lib/site";

const ANNEE = new Date().getFullYear();

/**
 * Les coordonnées manquantes ne sont pas remplacées par des valeurs fictives :
 * chaque champ vide est simplement omis, et l'absence reste visible pour le
 * client tant qu'il ne les a pas transmises (cahier des charges §8).
 */
export async function Footer() {
  const contact = await getCoordonnees();
  const adresse = [contact.adresse, contact.ville, contact.pays].filter(Boolean);

  return (
    <footer className="mt-auto bg-surface-brand-deep text-ink-on-brand-muted">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-8">
            <Logo surMarque />
            <p className="mt-4 text-sm leading-relaxed max-w-[45ch]">
              {SITE.description}
            </p>
          </div>

          <nav aria-label="Pied de page, navigation">
            <h2 className="text-sm font-semibold text-ink-on-brand">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_PUBLIC.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-ink-on-brand transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Pied de page, services">
            <h2 className="text-sm font-semibold text-ink-on-brand">Services</h2>
            <ul className="mt-4 space-y-2.5">
              {DOMAINES.slice(0, 5).map((domaine) => (
                <li key={domaine.slug}>
                  <Link
                    href={`/services/${domaine.slug}`}
                    className="text-sm hover:text-ink-on-brand transition-colors"
                  >
                    {domaine.nom}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-sm text-accent-text hover:underline"
                >
                  Voir les 9 domaines
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-ink-on-brand">Contact</h2>
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
                  href="/suivi"
                  className="hover:text-ink-on-brand transition-colors"
                >
                  Suivre une commande
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

        {/* Rangée des préférences d'affichage. Le choix vaut pour tout le
            site, espace d'administration compris : il est conservé par le
            navigateur, pas par la page. */}
        <div className="flex flex-wrap items-start gap-x-12 gap-y-6 border-t border-white/10 py-7">
          <SelecteurTheme />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            {ANNEE} {SITE.raisonSociale}. Tous droits réservés.
          </p>
          <Link
            href="/mentions-legales"
            className="hover:text-ink-on-brand transition-colors"
          >
            Mentions légales
          </Link>
        </div>
      </Container>
    </footer>
  );
}
