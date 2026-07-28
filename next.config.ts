import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Un package-lock.json présent dans un dossier parent fait remonter Next.js
  // trop haut lorsqu'il devine la racine du workspace. On la fixe au projet.
  turbopack: { root: path.resolve() },
  images: {
    remotePatterns: [
      // Photothèque sous licence Pexels, servie via le catalogue
      // src/lib/photos.ts. À retirer le jour où le client fournit ses propres
      // photos de chantiers et d'équipes (cahier des charges §8).
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
      // Supabase Storage : héberge les photos de réalisations, les visuels
      // d'actualités et les pièces jointes des demandes de devis.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
