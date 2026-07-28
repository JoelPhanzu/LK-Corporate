"use client";

import { useActionState } from "react";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Select } from "@/components/ui/formulaire";
import { LIBELLE_ROLE } from "@/lib/libelles";
import { creerUtilisateur } from "./actions";
import { ETAT_UTILISATEUR_INITIAL } from "./etats";

export function FormulaireUtilisateur() {
  const [etat, action, enCours] = useActionState(
    creerUtilisateur,
    ETAT_UTILISATEUR_INITIAL,
  );

  return (
    <form action={action} className="space-y-5">
      {etat.statut === "erreur" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-brand border border-red-600 bg-red-50 p-4 text-sm text-red-900 dark:border-red-400 dark:bg-red-950/40 dark:text-red-100"
        >
          <WarningCircleIcon size={20} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
          <p>{etat.message}</p>
        </div>
      )}

      {etat.statut === "succes" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <CheckCircleIcon
            size={20}
            weight="fill"
            aria-hidden
            className="mt-0.5 shrink-0 text-accent-text"
          />
          <p>{etat.message}</p>
        </div>
      )}

      <Champ htmlFor="nom" label="Nom et prénom" obligatoire>
        <Input id="nom" name="nom" required autoComplete="off" />
      </Champ>

      <Champ htmlFor="email" label="Email" obligatoire>
        <Input id="email" name="email" type="email" required autoComplete="off" />
      </Champ>

      <Champ
        htmlFor="motDePasse"
        label="Mot de passe provisoire"
        aide="12 caractères au minimum. À transmettre au collaborateur par un canal sûr."
        obligatoire
      >
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          aria-describedby="motDePasse-aide"
        />
      </Champ>

      <Champ
        htmlFor="role"
        label="Rôle"
        aide="Seuls les propriétaires et administrateurs peuvent gérer les comptes."
      >
        <Select
          id="role"
          name="role"
          defaultValue="AGENT"
          aria-describedby="role-aide"
        >
          {(["AGENT", "ADMIN", "PROPRIETAIRE"] as const).map((role) => (
            <option key={role} value={role}>
              {LIBELLE_ROLE[role]}
            </option>
          ))}
        </Select>
      </Champ>

      <Bouton type="submit" disabled={enCours}>
        {enCours ? "Création..." : "Créer le compte"}
      </Bouton>
    </form>
  );
}
