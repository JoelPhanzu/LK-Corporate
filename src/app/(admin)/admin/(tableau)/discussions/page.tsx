import Link from "next/link";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Discussions" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

async function chargerConversations() {
  try {
    return await prisma.conversation.findMany({
      // Les fils ouverts d'abord, puis les plus récents : l'équipe voit en
      // haut ce qui appelle une réponse.
      orderBy: [{ ouverte: "desc" }, { dernierMessageLe: "desc" }],
      take: 100,
      select: {
        id: true,
        visiteurNom: true,
        visiteurEmail: true,
        ouverte: true,
        dernierMessageLe: true,
        lead: { select: { nom: true } },
        messages: {
          orderBy: { creeLe: "desc" },
          take: 1,
          select: { contenu: true, expediteur: true },
        },
        _count: {
          select: {
            messages: { where: { expediteur: "VISITEUR", luParEquipe: false } },
          },
        },
      },
    });
  } catch (erreur) {
    console.error("Chargement des discussions impossible", erreur);
    return null;
  }
}

export default async function PageDiscussions() {
  await exigerAdmin();
  const conversations = await chargerConversations();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl md:text-3xl">Discussions</h1>
      <p className="mt-2 text-ink-muted">
        Échanges avec les visiteurs du site, conservés dans leur intégralité.
      </p>

      {conversations === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {conversations !== null && conversations.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucune discussion</p>
          <p className="mt-1 text-sm text-ink-muted">
            Les conversations ouvertes depuis le site apparaîtront ici.
          </p>
        </div>
      )}

      {conversations !== null && conversations.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {conversations.map((conversation) => {
            const nom =
              conversation.lead?.nom ??
              conversation.visiteurNom ??
              "Visiteur anonyme";
            const dernier = conversation.messages[0];
            const nonLus = conversation._count.messages;

            return (
              <li key={conversation.id}>
                <Link
                  href={`/admin/discussions/${conversation.id}`}
                  className="flex flex-wrap items-start justify-between gap-4 py-4 hover:text-accent-text"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      {nom}
                      {nonLus > 0 && (
                        <span className="rounded-brand bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">
                          {nonLus} non lu{nonLus > 1 ? "s" : ""}
                        </span>
                      )}
                      {!conversation.ouverte && (
                        <span className="rounded-brand border border-line px-2 py-0.5 text-xs font-semibold text-ink-muted">
                          Clos
                        </span>
                      )}
                    </p>
                    {dernier && (
                      <p className="mt-1 truncate text-sm text-ink-muted">
                        {dernier.expediteur === "EQUIPE" ? "Vous : " : ""}
                        {dernier.contenu}
                      </p>
                    )}
                  </div>
                  <time
                    dateTime={conversation.dernierMessageLe.toISOString()}
                    className="shrink-0 text-sm text-ink-muted"
                  >
                    {dateFr.format(conversation.dernierMessageLe)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
