"use client";

import { useActionState } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input } from "@/components/ui/formulaire";
import { seConnecter } from "./actions";
import { ETAT_CONNEXION_INITIAL } from "./etats";

export function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(
    seConnecter,
    ETAT_CONNEXION_INITIAL,
  );

  return (
    <form action={action} className="space-y-6">
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

      <Champ htmlFor="email" label="Email" obligatoire>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
        />
      </Champ>

      <Champ htmlFor="motDePasse" label="Mot de passe" obligatoire>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
        />
      </Champ>

      <Bouton type="submit" disabled={enCours} className="w-full">
        {enCours ? "Connexion..." : "Se connecter"}
      </Bouton>
    </form>
  );
}
