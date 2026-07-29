import { Archivo } from "next/font/google";
import { SCRIPT_THEME } from "@/lib/theme";
import "@/app/globals.css";

/**
 * Coquille `<html>` / `<body>` partagée par les deux layouts racines.
 *
 * Le site a deux racines : le vitrine sous `[lang]`, dont l'attribut `lang`
 * varie, et l'espace d'administration, qui reste en français. Next.js autorise
 * cette configuration dès lors qu'aucun `app/layout.tsx` ne les surplombe. Ce
 * composant évite d'en dupliquer la coquille, police et script de thème
 * compris.
 */

/**
 * Archivo : grotesque à caractère industriel, lisible en petit corps et doté
 * du latin étendu nécessaire aux accents français. Une seule famille variable
 * sur tout le site, pour limiter le poids téléchargé — le public visé navigue
 * majoritairement en mobile sur des connexions inégales.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-archivo",
  display: "swap",
});

export function CoquilleHtml({
  langue,
  children,
}: {
  langue: string;
  children: React.ReactNode;
}) {
  return (
    // `data-theme` n'est volontairement PAS rendu côté serveur : le laisser
    // absent permet à globals.css de retomber sur la préférence système pour
    // les visiteurs sans JavaScript. Le script ci-dessous le pose aussitôt
    // pour tous les autres, d'où `suppressHydrationWarning` : l'attribut aura
    // déjà changé quand React hydratera.
    <html
      lang={langue}
      className={`${archivo.variable} h-full`}
      suppressHydrationWarning
    >
      {/* `no-head-element` vise `next/head`, propre au Pages Router. Dans
          l'App Router, c'est bien un <head> littéral qu'attend le guide
          « Preventing Flash Before Hydration », qui décrit ce script. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-full font-sans flex flex-col">{children}</body>
    </html>
  );
}
