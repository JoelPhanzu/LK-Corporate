import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SITE } from "@/lib/site";
import { SCRIPT_THEME } from "@/lib/theme";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nom} | ${SITE.accroche}`,
    template: `%s | ${SITE.nom}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "fr_CD",
    siteName: SITE.nom,
    title: `${SITE.nom} | ${SITE.accroche}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `data-theme` n'est volontairement PAS rendu côté serveur : le laisser
    // absent permet à globals.css de retomber sur la préférence système pour
    // les visiteurs sans JavaScript. Le script ci-dessous le pose aussitôt
    // pour tous les autres, d'où `suppressHydrationWarning` : l'attribut aura
    // déjà changé quand React hydratera.
    <html
      lang="fr"
      className={`${archivo.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-full font-sans flex flex-col">{children}</body>
    </html>
  );
}
