import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EnTetePage } from "@/components/public/en-tete-page";
import { EtatVide } from "@/components/public/etat-vide";
import { Container } from "@/components/ui/container";
import { getDomaine } from "@/lib/domaines";
import { urlMedia } from "@/lib/medias";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description:
    "Chantiers, installations et projets livrés par LK-CORPORATE : construction, rénovation, travaux publics et énergie solaire.",
};

// Contenu piloté depuis l'espace admin, sans base de données disponible à la
// compilation. À revoir en Phase 4 pour passer en régénération incrémentale
// une fois Supabase en place.
export const dynamic = "force-dynamic";

async function chargerRealisations() {
  try {
    return await prisma.realisation.findMany({
      where: { publie: true },
      orderBy: [{ ordre: "asc" }, { creeLe: "desc" }],
      select: {
        slug: true,
        titre: true,
        description: true,
        localisation: true,
        domaineSlug: true,
        photoApresChemin: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des réalisations impossible", erreur);
    return null;
  }
}

export default async function PageRealisations() {
  const realisations = await chargerRealisations();

  return (
    <>
      <EnTetePage
        titre="Nos réalisations"
        chapo="Chantiers livrés, installations mises en service et projets menés pour des particuliers, des entreprises et des institutions."
      />

      <section className="py-16 md:py-24">
        <Container>
          {realisations === null && (
            <EtatVide
              titre="Réalisations momentanément indisponibles"
              texte="La liste ne peut pas être chargée pour le moment. Réessayez dans quelques minutes."
            />
          )}

          {realisations !== null && realisations.length === 0 && (
            <EtatVide
              titre="Les premières réalisations seront publiées ici"
              texte="Chaque projet est ajouté depuis l'espace admin, avec ses photos avant et après, sa description et sa localisation."
            />
          )}

          {realisations !== null && realisations.length > 0 && (
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {realisations.map((realisation) => {
                const image = urlMedia(realisation.photoApresChemin);
                const domaine = getDomaine(realisation.domaineSlug);

                return (
                  <li key={realisation.slug}>
                    <Link
                      href={`/realisations/${realisation.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-4/3 overflow-hidden rounded-brand bg-surface-sunken">
                        {image && (
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <h2 className="mt-4 text-lg font-bold leading-snug group-hover:text-accent-text">
                        {realisation.titre}
                      </h2>
                      <p className="mt-1 text-sm text-ink-muted">
                        {[domaine?.nom, realisation.localisation]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
