"use client";

import { useActionState } from "react";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Textarea } from "@/components/ui/formulaire";
import { envoyerContact } from "./actions";
import { ETAT_CONTACT_INITIAL } from "./etats";

/**
 * Libellés traduits, fournis par la page. Le dictionnaire est `server-only` :
 * l'importer ici embarquerait les deux langues dans le bundle du navigateur.
 */
export type LibellesContact = {
  succesTitre: string;
  succesTexte: string;
  champNom: string;
  champEmail: string;
  champTelephone: string;
  champSujet: string;
  champMessage: string;
  nePasRemplir: string;
  envoyer: string;
  envoi: string;
  facultatif: string;
};

export function FormulaireContact({
  libelles,
  langue,
}: {
  libelles: LibellesContact;
  langue: string;
}) {
  const [etat, action, enCours] = useActionState(
    envoyerContact,
    ETAT_CONTACT_INITIAL,
  );

  if (etat.statut === "succes") {
    return (
      <div className="rounded-brand border border-line bg-surface-sunken p-8">
        <CheckCircleIcon
          size={40}
          weight="fill"
          aria-hidden
          className="text-accent-text"
        />
        <h2 className="mt-4 text-2xl">{libelles.succesTitre}</h2>
        <p className="mt-3 max-w-[55ch] leading-relaxed text-ink-muted">
          {libelles.succesTexte}
        </p>
      </div>
    );
  }

  const erreurs = etat.statut === "erreur" ? (etat.champs ?? {}) : {};

  return (
    <form action={action} className="space-y-6" noValidate>
      {/* La langue accompagne la soumission : la Server Action ne connaît pas
          l'URL d'où elle est appelée et doit répondre dans la bonne langue. */}
      <input type="hidden" name="langue" value={langue} />

      {etat.statut === "erreur" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-brand border border-red-600 bg-red-50 p-4 text-sm text-red-900 dark:border-red-400 dark:bg-red-950/40 dark:text-red-100"
        >
          <WarningCircleIcon
            size={20}
            weight="fill"
            aria-hidden
            className="mt-0.5 shrink-0"
          />
          <p>{etat.message}</p>
        </div>
      )}

      <Champ htmlFor="nom" label={libelles.champNom} obligatoire erreur={erreurs.nom}>
        <Input
          id="nom"
          name="nom"
          autoComplete="name"
          required
          enErreur={Boolean(erreurs.nom)}
          aria-describedby={erreurs.nom ? "nom-erreur" : undefined}
        />
      </Champ>

      <div className="grid gap-6 sm:grid-cols-2">
        <Champ htmlFor="email" label={libelles.champEmail} obligatoire erreur={erreurs.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            enErreur={Boolean(erreurs.email)}
            aria-describedby={erreurs.email ? "email-erreur" : undefined}
          />
        </Champ>

        <Champ
          htmlFor="telephone"
          label={libelles.champTelephone}
          libelleFacultatif={libelles.facultatif}
          erreur={erreurs.telephone}
        >
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            enErreur={Boolean(erreurs.telephone)}
          />
        </Champ>
      </div>

      <Champ htmlFor="sujet" label={libelles.champSujet} obligatoire erreur={erreurs.sujet}>
        <Input
          id="sujet"
          name="sujet"
          required
          enErreur={Boolean(erreurs.sujet)}
          aria-describedby={erreurs.sujet ? "sujet-erreur" : undefined}
        />
      </Champ>

      <Champ
        htmlFor="message"
        label={libelles.champMessage}
        obligatoire
        erreur={erreurs.message}
      >
        <Textarea
          id="message"
          name="message"
          required
          minLength={20}
          enErreur={Boolean(erreurs.message)}
          aria-describedby={erreurs.message ? "message-erreur" : undefined}
        />
      </Champ>

      {/* Piège à robots : masqué visuellement et retiré du parcours clavier. */}
      <div aria-hidden className="hidden">
        <label htmlFor="site_web">{libelles.nePasRemplir}</label>
        <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <Bouton type="submit" disabled={enCours} className="w-full sm:w-auto">
        {enCours ? libelles.envoi : libelles.envoyer}
      </Bouton>
    </form>
  );
}
