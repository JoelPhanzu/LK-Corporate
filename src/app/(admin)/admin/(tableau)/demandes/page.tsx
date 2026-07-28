import Link from "next/link";
import type { StatutDemande } from "@/generated/prisma/enums";
import { EtiquetteDemande } from "@/components/admin/etiquette";
import { exigerAdmin } from "@/lib/auth";
import { getDomaine } from "@/lib/domaines";
import { LIBELLE_STATUT_DEMANDE, STATUTS_DEMANDE } from "@/lib/libelles";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata = { title: "Devis et commandes" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

async function chargerDemandes(statut?: StatutDemande) {
  try {
    return await prisma.demande.findMany({
      where: statut ? { statut } : undefined,
      orderBy: { creeLe: "desc" },
      take: 100,
      select: {
        id: true,
        reference: true,
        domaineSlug: true,
        statut: true,
        creeLe: true,
        lead: { select: { nom: true, entreprise: true } },
        livraison: { select: { statut: true } },
      },
    });
  } catch (erreur) {
    console.error("Chargement des demandes impossible", erreur);
    return null;
  }
}

export default async function PageDemandes(props: PageProps<"/admin/demandes">) {
  await exigerAdmin();

  const { statut } = await props.searchParams;
  const filtre =
    typeof statut === "string" && STATUTS_DEMANDE.includes(statut as StatutDemande)
      ? (statut as StatutDemande)
      : undefined;

  const demandes = await chargerDemandes(filtre);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl md:text-3xl">Devis et commandes</h1>

      {/* Filtres en liens : l'état de filtrage vit dans l'URL, donc il survit
          au rechargement et reste partageable entre collaborateurs. */}
      <nav aria-label="Filtrer par statut" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/admin/demandes"
              aria-current={!filtre ? "page" : undefined}
              className={cn(
                "inline-flex rounded-brand border px-3.5 py-2 text-sm font-medium transition-colors",
                !filtre
                  ? "border-ink bg-ink text-surface"
                  : "border-line-strong hover:border-ink",
              )}
            >
              Toutes
            </Link>
          </li>
          {STATUTS_DEMANDE.map((valeur) => (
            <li key={valeur}>
              <Link
                href={`/admin/demandes?statut=${valeur}`}
                aria-current={filtre === valeur ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-brand border px-3.5 py-2 text-sm font-medium transition-colors",
                  filtre === valeur
                    ? "border-ink bg-ink text-surface"
                    : "border-line-strong hover:border-ink",
                )}
              >
                {LIBELLE_STATUT_DEMANDE[valeur]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {demandes === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">
            La base ne répond pas. Réessayez dans quelques instants.
          </p>
        </div>
      )}

      {demandes !== null && demandes.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucune demande dans cette vue</p>
          <p className="mt-1 text-sm text-ink-muted">
            {filtre
              ? "Aucune demande ne porte ce statut pour le moment."
              : "Les demandes déposées depuis le site apparaîtront ici."}
          </p>
        </div>
      )}

      {demandes !== null && demandes.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {demandes.map((demande) => (
            <li key={demande.id}>
              <Link
                href={`/admin/demandes/${demande.id}`}
                className="flex flex-wrap items-start justify-between gap-4 py-4 hover:text-accent-text"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">
                    {demande.reference}
                  </p>
                  <p className="mt-1 truncate font-medium">
                    {demande.lead.nom}
                    {demande.lead.entreprise ? `, ${demande.lead.entreprise}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {getDomaine(demande.domaineSlug)?.nom ?? demande.domaineSlug}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <time
                    dateTime={demande.creeLe.toISOString()}
                    className="text-sm text-ink-muted"
                  >
                    {dateFr.format(demande.creeLe)}
                  </time>
                  <EtiquetteDemande statut={demande.statut} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
