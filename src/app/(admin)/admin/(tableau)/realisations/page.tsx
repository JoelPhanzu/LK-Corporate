import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { BoutonSuppression } from "@/components/admin/bouton-suppression";
import { LienBouton } from "@/components/ui/button";
import { exigerAdmin } from "@/lib/auth";
import { getDomaine } from "@/lib/domaines";
import { prisma } from "@/lib/prisma";
import {
  basculerPublicationRealisation,
  supprimerRealisation,
} from "./actions";

export const metadata = { title: "Réalisations" };
export const dynamic = "force-dynamic";

async function chargerRealisations() {
  try {
    return await prisma.realisation.findMany({
      orderBy: [{ ordre: "asc" }, { creeLe: "desc" }],
      select: {
        id: true,
        slug: true,
        titre: true,
        localisation: true,
        domaineSlug: true,
        publie: true,
        ordre: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des réalisations impossible", erreur);
    return null;
  }
}

export default async function PageAdminRealisations() {
  await exigerAdmin();
  const realisations = await chargerRealisations();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl">Réalisations</h1>
        <LienBouton href="/admin/realisations/nouveau">
          <PlusIcon size={18} weight="bold" aria-hidden />
          Nouvelle réalisation
        </LienBouton>
      </div>

      {realisations === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {realisations !== null && realisations.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucune réalisation</p>
          <p className="mt-1 text-sm text-ink-muted">
            Ajoutez un projet avec ses photos avant et après, il apparaîtra dans
            la galerie dès sa publication.
          </p>
        </div>
      )}

      {realisations !== null && realisations.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {realisations.map((realisation) => (
            <li
              key={realisation.id}
              className="flex flex-wrap items-start justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/realisations/${realisation.id}`}
                  className="font-medium hover:text-accent-text"
                >
                  {realisation.titre}
                </Link>
                <p className="mt-1 text-sm text-ink-muted">
                  {[
                    getDomaine(realisation.domaineSlug)?.nom,
                    realisation.localisation,
                    realisation.publie ? "Publiée" : "Brouillon",
                    `Ordre ${realisation.ordre}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {realisation.publie && (
                  <Link
                    href={`/realisations/${realisation.slug}`}
                    className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                  >
                    Voir
                  </Link>
                )}

                <form action={basculerPublicationRealisation}>
                  <input type="hidden" name="id" value={realisation.id} />
                  <button
                    type="submit"
                    className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                  >
                    {realisation.publie ? "Dépublier" : "Publier"}
                  </button>
                </form>

                <BoutonSuppression
                  action={supprimerRealisation}
                  id={realisation.id}
                  message={`Supprimer définitivement « ${realisation.titre} » ? Cette action est irréversible.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
