import Link from "next/link";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Visiteurs" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

async function chargerLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { creeLe: "desc" },
      take: 200,
      select: {
        id: true,
        nom: true,
        email: true,
        telephone: true,
        entreprise: true,
        creeLe: true,
        demandes: {
          orderBy: { creeLe: "desc" },
          select: { id: true, reference: true, statut: true },
        },
      },
    });
  } catch (erreur) {
    console.error("Chargement des visiteurs impossible", erreur);
    return null;
  }
}

export default async function PageLeads() {
  await exigerAdmin();
  const leads = await chargerLeads();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl md:text-3xl">Visiteurs</h1>
      <p className="mt-2 text-ink-muted">
        Personnes ayant laissé leurs coordonnées via un formulaire du site.
      </p>

      {leads === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {leads !== null && leads.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucun visiteur enregistré</p>
          <p className="mt-1 text-sm text-ink-muted">
            Chaque demande de devis crée automatiquement une fiche visiteur.
          </p>
        </div>
      )}

      {leads !== null && leads.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {leads.map((lead) => (
            <li key={lead.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {lead.nom}
                    {lead.entreprise ? `, ${lead.entreprise}` : ""}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-ink-muted">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:text-accent-text"
                      >
                        {lead.email}
                      </a>
                    )}
                    {lead.telephone && (
                      <a
                        href={`tel:${lead.telephone.replace(/\s/g, "")}`}
                        className="hover:text-accent-text"
                      >
                        {lead.telephone}
                      </a>
                    )}
                  </p>
                </div>
                <time
                  dateTime={lead.creeLe.toISOString()}
                  className="text-sm text-ink-muted"
                >
                  {dateFr.format(lead.creeLe)}
                </time>
              </div>

              {lead.demandes.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {lead.demandes.map((demande) => (
                    <li key={demande.id}>
                      <Link
                        href={`/admin/demandes/${demande.id}`}
                        className="inline-flex rounded-brand border border-line-strong px-2.5 py-1 font-mono text-xs font-semibold transition-colors hover:border-ink hover:text-accent-text"
                      >
                        {demande.reference}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
