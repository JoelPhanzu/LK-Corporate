import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoquilleHtml } from "@/components/coquille-html";
import { getDictionnaire } from "@/lib/dictionnaire";
import { LANGUES, estLangue } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Layout racine du site vitrine.
 *
 * Il porte `<html>` parce qu'aucun `app/layout.tsx` ne le surplombe : le site
 * a deux racines, celle-ci pour le vitrine et `(admin)/layout.tsx` pour
 * l'espace d'administration. C'est ce qui permet à l'attribut `lang` de suivre
 * la langue de la page sans rendre le document dynamique.
 */

/** Les deux langues sont connues à la compilation : pages statiques. */
export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: LayoutProps<"/[lang]">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.nom} | ${dico.site.accroche}`,
      template: `%s | ${SITE.nom}`,
    },
    description: dico.site.description,
    openGraph: {
      type: "website",
      locale: dico.site.localeOpenGraph,
      siteName: SITE.nom,
      title: `${SITE.nom} | ${dico.site.accroche}`,
      description: dico.site.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LayoutRacinePublic(
  props: LayoutProps<"/[lang]">,
) {
  const { lang } = await props.params;

  // Le proxy n'aiguille que les langues connues, mais une URL forgée à la main
  // arrive ici directement : sans ce contrôle, `/de/services` rendrait une page
  // au dictionnaire vide plutôt qu'un 404.
  if (!estLangue(lang)) notFound();

  return <CoquilleHtml langue={lang}>{props.children}</CoquilleHtml>;
}
