import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SITE } from "@/lib/site";
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
    <html lang="fr" className={`${archivo.variable} h-full`}>
      <body className="min-h-full font-sans flex flex-col">{children}</body>
    </html>
  );
}
