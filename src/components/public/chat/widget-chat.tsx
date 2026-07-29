"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatCircleIcon,
  PaperPlaneRightIcon,
  XIcon,
} from "@phosphor-icons/react";
import { chargerFil, envoyerMessageVisiteur } from "@/app/[lang]/(public)/chat/actions";
import { CLE_JETON, type MessageChat } from "@/app/[lang]/(public)/chat/etats";
import { MESSAGE_MAX } from "@/lib/validations/chat";
import { cn } from "@/lib/utils";

/** Intervalle de rafraîchissement du fil pendant que le panneau est ouvert. */
const PERIODE_RAFRAICHISSEMENT = 5000;

const heureFr = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });

/**
 * Chat visiteur.
 *
 * Les messages transitent par des Server Actions plutôt que par un accès
 * direct du navigateur à la base : le visiteur n'a donc jamais de droit de
 * lecture sur la table des messages, et la confidentialité des autres
 * conversations ne dépend pas d'une règle RLS bien configurée.
 *
 * La réception se fait par interrogation régulière, suspendue dès que l'onglet
 * passe en arrière-plan. Pour un échange avec une petite équipe, le délai est
 * imperceptible, et cela évite une connexion permanente coûteuse sur les
 * réseaux mobiles instables. Le passage à Supabase Realtime, si le besoin
 * s'en fait sentir, ne toucherait que ce composant.
 */
export function WidgetChat() {
  const [ouvert, setOuvert] = useState(false);
  const [jeton, setJeton] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [chargement, setChargement] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [texte, setTexte] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  const finDuFil = useRef<HTMLDivElement>(null);
  const champTexte = useRef<HTMLTextAreaElement>(null);

  const rafraichir = useCallback(async (jetonCourant: string) => {
    const resultat = await chargerFil(jetonCourant);
    if (resultat.statut === "ok") {
      setMessages(resultat.messages);
    }
  }, []);

  /**
   * Ouvre le panneau et charge la conversation précédente s'il y en a une.
   *
   * Tout se fait ici, dans le gestionnaire de clic, et non dans un effet :
   * lire le stockage local puis déclencher un chargement sont des réactions à
   * une action de l'utilisateur, pas une synchronisation avec un système
   * externe. Les passer par un effet provoquerait des rendus en cascade.
   */
  async function ouvrirPanneau() {
    setOuvert(true);

    let enregistre: string | null = null;
    try {
      enregistre = window.localStorage.getItem(CLE_JETON);
    } catch {
      // Stockage indisponible (navigation privée stricte) : le visiteur
      // ouvrira simplement une nouvelle conversation.
    }

    if (!enregistre) return;

    setJeton(enregistre);
    setChargement(true);
    const resultat = await chargerFil(enregistre);
    if (resultat.statut === "ok") setMessages(resultat.messages);
    setChargement(false);
  }

  // Interrogation périodique, suspendue quand l'onglet n'est pas visible.
  useEffect(() => {
    if (!ouvert || !jeton) return;

    const minuterie = setInterval(() => {
      if (document.visibilityState === "visible") void rafraichir(jeton);
    }, PERIODE_RAFRAICHISSEMENT);

    return () => clearInterval(minuterie);
  }, [ouvert, jeton, rafraichir]);

  // Garde le dernier message en vue.
  useEffect(() => {
    finDuFil.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Échap referme le panneau.
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    const contenu = texte.trim();
    if (!contenu || envoiEnCours) return;

    setEnvoiEnCours(true);
    setErreur(null);

    const resultat = await envoyerMessageVisiteur(
      jeton,
      contenu,
      jeton ? undefined : { nom: nom.trim(), email: email.trim() },
    );

    if (resultat.statut === "ok") {
      setTexte("");
      setMessages(resultat.messages);
      if (resultat.jeton !== jeton) {
        setJeton(resultat.jeton);
        try {
          window.localStorage.setItem(CLE_JETON, resultat.jeton);
        } catch {
          // Sans stockage, la conversation ne survivra pas au rechargement.
        }
      }
      champTexte.current?.focus();
    } else {
      setErreur(resultat.message);
    }

    setEnvoiEnCours(false);
  }

  const premierContact = !jeton;

  return (
    <>
      {!ouvert && (
        <button
          type="button"
          onClick={() => void ouvrirPanneau()}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-brand bg-accent px-5 font-semibold text-accent-ink shadow-lg transition-colors hover:bg-accent-hover"
        >
          <ChatCircleIcon size={22} weight="fill" aria-hidden />
          Discuter
        </button>
      )}

      {ouvert && (
        <div
          role="dialog"
          aria-label="Discussion avec LK-CORPORATE"
          aria-modal="false"
          className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col rounded-t-brand border border-line bg-surface shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[32rem] sm:w-96 sm:rounded-brand"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 rounded-t-brand bg-surface-brand px-4 py-3">
            <div>
              <p className="font-semibold text-ink-on-brand">LK-CORPORATE</p>
              <p className="text-xs text-ink-on-brand-muted">
                Nous répondons pendant les heures ouvrables.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer la discussion"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-brand text-ink-on-brand hover:bg-white/10"
            >
              <XIcon size={20} weight="bold" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {chargement && messages.length === 0 && (
              /* Squelettes reprenant la forme des bulles, plutôt qu'un
                 indicateur circulaire hors sujet. */
              <div className="space-y-3" aria-hidden>
                <div className="h-12 w-3/4 animate-pulse rounded-brand bg-surface-sunken" />
                <div className="ml-auto h-12 w-2/3 animate-pulse rounded-brand bg-surface-sunken" />
                <div className="h-16 w-4/5 animate-pulse rounded-brand bg-surface-sunken" />
              </div>
            )}

            {!chargement && messages.length === 0 && (
              <div className="py-6 text-center">
                <p className="font-semibold">Comment pouvons-nous vous aider ?</p>
                <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-muted">
                  Posez votre question sur un chantier, une fourniture ou une
                  livraison. Nous vous répondons ici même.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.deLEquipe ? "justify-start" : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-brand px-3.5 py-2.5",
                    message.deLEquipe
                      ? "border border-line bg-surface-sunken"
                      : "bg-surface-brand text-ink-on-brand",
                  )}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {message.contenu}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[11px]",
                      message.deLEquipe
                        ? "text-ink-muted"
                        : "text-ink-on-brand-muted",
                    )}
                  >
                    <span className="sr-only">
                      {message.deLEquipe ? "LK-CORPORATE, " : "Vous, "}
                    </span>
                    {heureFr.format(new Date(message.creeLe))}
                  </p>
                </div>
              </div>
            ))}

            <div ref={finDuFil} />
          </div>

          <form
            onSubmit={envoyer}
            className="shrink-0 space-y-2.5 border-t border-line p-3"
          >
            {erreur && (
              <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
                {erreur}
              </p>
            )}

            {premierContact && (
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="chat-nom" className="sr-only">
                    Votre nom
                  </label>
                  <input
                    id="chat-nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    autoComplete="name"
                    className="w-full rounded-brand border border-line-strong bg-surface px-3 py-2 text-sm placeholder:text-ink-muted"
                  />
                </div>
                <div>
                  <label htmlFor="chat-email" className="sr-only">
                    Votre email
                  </label>
                  <input
                    id="chat-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (facultatif)"
                    autoComplete="email"
                    className="w-full rounded-brand border border-line-strong bg-surface px-3 py-2 text-sm placeholder:text-ink-muted"
                  />
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="chat-message" className="sr-only">
                  Votre message
                </label>
                <textarea
                  id="chat-message"
                  ref={champTexte}
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  onKeyDown={(e) => {
                    // Entrée envoie, Maj+Entrée passe à la ligne.
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void envoyer(e);
                    }
                  }}
                  rows={2}
                  maxLength={MESSAGE_MAX}
                  placeholder="Écrivez votre message"
                  className="w-full resize-none rounded-brand border border-line-strong bg-surface px-3 py-2 text-sm placeholder:text-ink-muted"
                />
              </div>
              <button
                type="submit"
                disabled={envoiEnCours || texte.trim() === ""}
                aria-label="Envoyer le message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-accent text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                <PaperPlaneRightIcon size={18} weight="fill" aria-hidden />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
