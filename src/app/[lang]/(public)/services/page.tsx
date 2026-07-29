import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { EnTetePage } from "@/components/public/en-tete-page";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DOMAINES } from "@/lib/domaines";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Les neuf domaines d'intervention de LK-CORPORATE : génie civil, rénovation, travaux publics, matériaux, énergie solaire, nettoyage, logistique, foncier et commerce général.",
};

export default function PageServices() {
  return (
    <>
      <EnTetePage
        titre="Neuf domaines d'intervention"
        chapo="Bâtiment et génie civil, fourniture, énergie, propreté et logistique. Chaque domaine peut être commandé seul ou combiné aux autres au sein d'un même projet."
      />

      <section className="py-16 md:py-24">
        <Container>
          {/* Grille filetée plutôt que cartes : neuf entrées, neuf cellules,
              aucune case vide, et une densité lisible dès le mobile. */}
          <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12">
            {DOMAINES.map((domaine) => (
              <li key={domaine.slug} className="border-b border-line">
                <Link
                  href={`/services/${domaine.slug}`}
                  className="group block h-full py-7 transition-colors hover:text-accent-text"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug">
                      {domaine.nom}
                    </h2>
                    <ArrowUpRightIcon
                      size={18}
                      weight="bold"
                      aria-hidden
                      className="mt-1 shrink-0 text-line-strong transition-colors group-hover:text-accent-text"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {domaine.resume}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-brand text-ink-on-brand">
        <Container>
          <div className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 className="text-2xl md:text-3xl">
                Votre projet couvre plusieurs domaines ?
              </h2>
              <p className="mt-3 max-w-[54ch] leading-relaxed text-ink-on-brand-muted">
                Décrivez l&apos;ensemble de votre besoin dans une seule demande.
                Nous revenons vers vous avec une proposition chiffrée.
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
