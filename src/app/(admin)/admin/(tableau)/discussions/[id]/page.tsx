import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Bouton } from "@/components/ui/button";
import { Champ, Textarea } from "@/components/ui/formulaire";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { basculerOuverture, marquerLu, repondre } from "../actions";

export const metadata = { title: "Discussion" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function PageDiscussion(
  props: PageProps<"/admin/discussions/[id]">,
) {
  await exigerAdmin();
  const { id } = await props.params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      lead: true,
      messages: { orderBy: { creeLe: "asc" }, include: { auteur: true } },
    },
  });

  if (!conversation) notFound();

  const nom =
    conversation.lead?.nom ?? conversation.visiteurNom ?? "Visiteur anonyme";
  const email = conversation.lead?.email ?? conversation.visiteurEmail;
  const nonLus = conversation.messages.filter(
    (message) => message.expediteur === "VISITEUR" && !message.luParEquipe,
  ).length;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/discussions"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
      >
        <ArrowLeftIcon size={16} weight="bold" aria-hidden />
        Toutes les discussions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl">{nom}</h1>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-block text-sm text-accent-text hover:underline"
            >
              {email}
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {nonLus > 0 && (
            <form action={marquerLu}>
              <input type="hidden" name="conversationId" value={conversation.id} />
              <button
                type="submit"
                className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
              >
                Marquer comme lu
              </button>
            </form>
          )}
          <form action={basculerOuverture}>
            <input type="hidden" name="conversationId" value={conversation.id} />
            <button
              type="submit"
              className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
            >
              {conversation.ouverte ? "Clore la discussion" : "Rouvrir"}
            </button>
          </form>
        </div>
      </div>

      <ol className="mt-8 space-y-4">
        {conversation.messages.map((message) => {
          const deLEquipe = message.expediteur === "EQUIPE";

          return (
            <li
              key={message.id}
              className={cn("flex", deLEquipe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-brand border p-4",
                  deLEquipe
                    ? "border-line bg-surface-sunken"
                    : "border-line-strong bg-surface",
                )}
              >
                <p className="text-xs font-semibold text-ink-muted">
                  {deLEquipe ? (message.auteur?.nom ?? "Équipe") : nom}
                  {", "}
                  <time dateTime={message.creeLe.toISOString()}>
                    {dateFr.format(message.creeLe)}
                  </time>
                </p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed">
                  {message.contenu}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {conversation.messages.length === 0 && (
        <p className="mt-8 text-ink-muted">Aucun message dans ce fil.</p>
      )}

      <form action={repondre} className="mt-8 space-y-3 border-t border-line pt-6">
        <input type="hidden" name="conversationId" value={conversation.id} />
        <Champ htmlFor="contenu" label="Votre réponse" obligatoire>
          <Textarea id="contenu" name="contenu" required className="min-h-28" />
        </Champ>
        <Bouton type="submit">Envoyer</Bouton>
      </form>
    </div>
  );
}
