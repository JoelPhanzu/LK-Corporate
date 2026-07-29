import type { Metadata } from "next";
import { CoquilleHtml } from "@/components/coquille-html";
import { SITE } from "@/lib/site";

/**
 * Layout racine de l'espace d'administration.
 *
 * L'admin vit hors du segment `[lang]` : il n'est utilisé que par l'équipe
 * interne, et le traduire doublerait la surface à maintenir sans bénéfice. Il
 * lui faut donc sa propre racine, le site vitrine ayant la sienne sous
 * `[lang]`.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Administration", template: "%s | Administration" },
  // Aucune page de l'espace d'administration n'a vocation à être indexée.
  robots: { index: false, follow: false },
};

export default function LayoutRacineAdmin({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CoquilleHtml langue="fr">{children}</CoquilleHtml>;
}
