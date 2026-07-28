import Link from "next/link";
import {
  ChatCircleIcon,
  FileTextIcon,
  TruckIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CarteStatistique } from "@/components/admin/carte-statistique";
import { EtiquetteDemande } from "@/components/admin/etiquette";
import { exigerAdmin } from "@/lib/auth";
import { getDomaine } from "@/lib/domaines";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

type Indicateurs = {
  visiteurs: number | null;
  nouvellesDemandes: number | null;
  demandesEnCours: number | null;
  livraisonsEnTransit: number | null;
  messagesNonLus: number | null;
};

const INDISPONIBLES: Indicateurs = {
  visiteurs: null,
  nouvellesDemandes: null,
  demandesEnCours: null,
  livraisonsEnTransit: null,
  messagesNonLus: null,
};

async function chargerTableauDeBord() {
  try {
    const [
      visiteurs,
      nouvellesDemandes,
      demandesEnCours,
      livraisonsEnTransit,
      messagesNonLus,
      dernieresDemandes,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.demande.count({ where: { statut: "NOUVELLE" } }),
      prisma.demande.count({ where: { statut: "EN_COURS" } }),
      prisma.livraison.count({ where: { statut: "EN_TRANSIT" } }),
      prisma.message.count({
        where: { expediteur: "VISITEUR", luParEquipe: false },
      }),
      prisma.demande.findMany({
        orderBy: { creeLe: "desc" },
        take: 8,
        select: {
          id: true,
          reference: true,
          domaineSlug: true,
          statut: true,
          creeLe: true,
          lead: { select: { nom: true } },
        },
      }),
    ]);

    return {
      indicateurs: {
        visiteurs,
        nouvellesDemandes,
        demandesEnCours,
        livraisonsEnTransit,
        messagesNonLus,
      },
      dernieresDemandes,
      erreur: false as const,
    };
  } catch (erreur) {
    console.error("Chargement du tableau de bord impossible", erreur);
    return {
      indicateurs: INDISPONIBLES,
      dernieresDemandes: [],
      erreur: true as const,
    };
  }
}

export default async function PageTableauDeBord() {
  await exigerAdmin();
  const { indicateurs, dernieresDemandes, erreur } = await chargerTableauDeBord();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl md:text-3xl">Tableau de bord</h1>

      {erreur && (
        <div
          role="alert"
          className="mt-6 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Données momentanément indisponibles</p>
          <p className="mt-1 text-ink-muted">
            La base ne répond pas. Les chiffres ci-dessous ne reflètent pas la
            situation réelle.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStatistique
          libelle="Nouvelles demandes"
          valeur={indicateurs.nouvellesDemandes}
          href="/admin/demandes?statut=NOUVELLE"
          Icone={FileTextIcon}
        />
        <CarteStatistique
          libelle="Demandes en cours"
          valeur={indicateurs.demandesEnCours}
          href="/admin/demandes?statut=EN_COURS"
          Icone={FileTextIcon}
        />
        <CarteStatistique
          libelle="Livraisons en transit"
          valeur={indicateurs.livraisonsEnTransit}
          href="/admin/logistique"
          Icone={TruckIcon}
        />
        <CarteStatistique
          libelle="Messages non lus"
          valeur={indicateurs.messagesNonLus}
          href="/admin/discussions"
          Icone={ChatCircleIcon}
        />
        <CarteStatistique
          libelle="Visiteurs enregistrés"
          valeur={indicateurs.visiteurs}
          href="/admin/leads"
          Icone={UsersIcon}
        />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Dernières demandes</h2>
          <Link
            href="/admin/demandes"
            className="text-sm font-semibold text-accent-text hover:underline"
          >
            Tout voir
          </Link>
        </div>

        {dernieresDemandes.length === 0 ? (
          <div className="mt-5 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="font-semibold">Aucune demande pour le moment</p>
            <p className="mt-1 text-sm text-ink-muted">
              Les demandes déposées depuis le site apparaîtront ici.
            </p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {dernieresDemandes.map((demande) => (
              <li key={demande.id}>
                <Link
                  href={`/admin/demandes/${demande.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hover:text-accent-text"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">
                      {demande.reference}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">
                      {demande.lead.nom}
                      {", "}
                      {getDomaine(demande.domaineSlug)?.nom ??
                        demande.domaineSlug}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <time
                      dateTime={demande.creeLe.toISOString()}
                      className="hidden text-sm text-ink-muted sm:inline"
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
      </section>
    </div>
  );
}
