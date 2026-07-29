import { notFound } from "next/navigation";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WidgetChat } from "@/components/public/chat/widget-chat";
import { getDictionnaire } from "@/lib/dictionnaire";
import { estLangue } from "@/lib/i18n";
import { NAV_PUBLIC } from "@/lib/site";

/** Ossature du site vitrine public (lk-corporate.com). */
export default async function LayoutPublic(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-brand focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
      >
        {dico.commun.allerAuContenu}
      </a>

      <Header
        langue={lang}
        entrees={NAV_PUBLIC.map((item) => ({
          href: item.href,
          label: dico.nav[item.cle],
        }))}
        libelles={{
          principale: dico.nav.principale,
          principaleMobile: dico.nav.principaleMobile,
          ouvrirMenu: dico.nav.ouvrirMenu,
          fermerMenu: dico.nav.fermerMenu,
          devis: dico.commun.demanderDevis,
        }}
        preferences={{
          langue: dico.preferences.langue,
          theme: {
            titre: dico.preferences.theme,
            clair: dico.preferences.themeClair,
            sombre: dico.preferences.themeSombre,
            appareil: dico.preferences.themeAppareil,
          },
        }}
      />

      <main id="contenu" className="flex-1">
        {props.children}
      </main>

      <Footer langue={lang} />
      {/* TODO i18n : les libellés du widget de chat restent à externaliser. */}
      <WidgetChat />
    </>
  );
}
