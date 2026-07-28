"use client";

import { useActionState } from "react";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Textarea } from "@/components/ui/formulaire";
import { envoyerContact } from "./actions";
import { ETAT_CONTACT_INITIAL } from "./etats";

export function FormulaireContact() {
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
        <h2 className="mt-4 text-2xl">Message envoyé</h2>
        <p className="mt-3 max-w-[55ch] leading-relaxed text-ink-muted">
          Nous avons bien reçu votre message et vous répondrons à
          l&apos;adresse indiquée.
        </p>
      </div>
    );
  }

  const erreurs = etat.statut === "erreur" ? (etat.champs ?? {}) : {};

  return (
    <form action={action} className="space-y-6" noValidate>
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

      <Champ htmlFor="nom" label="Nom et prénom" obligatoire erreur={erreurs.nom}>
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
        <Champ htmlFor="email" label="Email" obligatoire erreur={erreurs.email}>
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

        <Champ htmlFor="telephone" label="Téléphone" erreur={erreurs.telephone}>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            enErreur={Boolean(erreurs.telephone)}
          />
        </Champ>
      </div>

      <Champ htmlFor="sujet" label="Objet" obligatoire erreur={erreurs.sujet}>
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
        label="Votre message"
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
        <label htmlFor="site_web">Ne pas remplir</label>
        <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <Bouton type="submit" disabled={enCours} className="w-full sm:w-auto">
        {enCours ? "Envoi en cours..." : "Envoyer le message"}
      </Bouton>
    </form>
  );
}
