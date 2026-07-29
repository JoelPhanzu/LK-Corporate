import Link from "next/link";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { LANGUE_PAR_DEFAUT, chemin } from "@/lib/i18n";
import { NAV_PUBLIC } from "@/lib/site";

/**
 * Page 404 du site vitrine.
 *
 * Next.js ne transmet pas `params` à `not-found.tsx` : la langue de l'URL
 * demandée n'est donc pas connue ici, et la page s'affiche dans la langue par
 * défaut. C'est une limite du framework, pas un oubli — la lever supposerait
 * d'en faire un composant client lisant l'URL, au prix d'embarquer les deux
 * dictionnaires dans le navigateur pour trois phrases.
 */
export default function PageIntrouvable() {
  const langue = LANGUE_PAR_DEFAUT;
  const dico = getDictionnaire(langue);

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="max-w-[60ch]">
          <p className="text-sm font-semibold text-accent-text">
            {dico.erreur404.etiquette}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl">{dico.erreur404.titre}</h1>
          <p className="mt-4 leading-relaxed text-ink-muted">
            {dico.erreur404.texte}
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {NAV_PUBLIC.map((item) => (
              <li key={item.href}>
                <Link
                  href={chemin(langue, item.href)}
                  className="inline-flex rounded-brand border border-line-strong px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:text-accent-text"
                >
                  {dico.nav[item.cle]}
                </Link>
              </li>
            ))}
          </ul>

          <LienBouton href={chemin(langue, "/devis")} className="mt-8">
            {dico.commun.demanderDevis}
          </LienBouton>
        </div>
      </Container>
    </section>
  );
}
