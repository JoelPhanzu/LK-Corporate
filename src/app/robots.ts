import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace admin et les pages de suivi personnel n'ont rien à faire
      // dans un index de moteur de recherche.
      disallow: ["/admin", "/suivi"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
