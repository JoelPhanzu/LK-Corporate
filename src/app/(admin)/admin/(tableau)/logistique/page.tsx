import Link from "next/link";
import type { StatutLivraison } from "@/generated/prisma/enums";
import { EtiquetteLivraison } from "@/components/admin/etiquette";
import { exigerAdmin } from "@/lib/auth";
import { getDomaine } from "@/lib/domaines";
import { LIBELLE_STATUT_LIVRAISON, STATUTS_LIVRAISON } from "@/lib/libelles";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata = { title: "Logistique" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

async function chargerLivraisons(statut?: StatutLivraison) {
  try {
    return await prisma.livraison.findMany({
      where: statut ? { statut } : undefined,
      // Les livraisons non terminées remontent en premier : c'est ce que
      // l'équipe doit traiter, une livraison close n'appelle plus d'action.
      orderBy: [{ statut: "asc" }, { modifieLe: "desc" }],
      take: 100,
      select: {
        id: true,
        statut: true,
        modifieLe: true,
        demande: {
          select: {
            id: true,
            reference: true,
            domaineSlug: true,
            adresseLivraison: true,
            lead: { select: { nom: true } },
          },
        },
      },
    });
  } catch (erreur) {
    console.error("Chargement des livraisons impossible", erreur);
    return null;
  }
}

export default async function PageLogistique(
  props: PageProps<"/admin/logistique">,
) {
  await exigerAdmin();

  const { statut } = await props.searchParams;
  const filtre =
    typeof statut === "string" &&
    STATUTS_LIVRAISON.includes(statut as StatutLivraison)
      ? (statut as StatutLivraison)
      : undefined;

  const livraisons = await chargerLivraisons(filtre);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl md:text-3xl">Logistique</h1>
      <p className="mt-2 text-ink-muted">
        Les statuts modifiés ici sont ceux que le client voit sur sa page de
        suivi. Ils se mettent à jour depuis la fiche de chaque demande.
      </p>

      <nav aria-label="Filtrer par statut de livraison" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/admin/logistique"
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
          {STATUTS_LIVRAISON.map((valeur) => (
            <li key={valeur}>
              <Link
                href={`/admin/logistique?statut=${valeur}`}
                aria-current={filtre === valeur ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-brand border px-3.5 py-2 text-sm font-medium transition-colors",
                  filtre === valeur
                    ? "border-ink bg-ink text-surface"
                    : "border-line-strong hover:border-ink",
                )}
              >
                {LIBELLE_STATUT_LIVRAISON[valeur]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {livraisons === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {livraisons !== null && livraisons.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucune livraison dans cette vue</p>
          <p className="mt-1 text-sm text-ink-muted">
            Une livraison est créée automatiquement avec chaque demande.
          </p>
        </div>
      )}

      {livraisons !== null && livraisons.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {livraisons.map((livraison) => (
            <li key={livraison.id}>
              <Link
                href={`/admin/demandes/${livraison.demande.id}`}
                className="flex flex-wrap items-start justify-between gap-4 py-4 hover:text-accent-text"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">
                    {livraison.demande.reference}
                  </p>
                  <p className="mt-1 truncate font-medium">
                    {livraison.demande.lead.nom}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {getDomaine(livraison.demande.domaineSlug)?.nom ??
                      livraison.demande.domaineSlug}
                    {livraison.demande.adresseLivraison
                      ? `, ${livraison.demande.adresseLivraison}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <time
                    dateTime={livraison.modifieLe.toISOString()}
                    className="text-sm text-ink-muted"
                  >
                    {dateFr.format(livraison.modifieLe)}
                  </time>
                  <EtiquetteLivraison statut={livraison.statut} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
