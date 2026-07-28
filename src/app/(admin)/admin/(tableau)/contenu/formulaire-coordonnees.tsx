"use client";

import { useActionState } from "react";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Textarea } from "@/components/ui/formulaire";
import type { Coordonnees } from "@/lib/contenu";
import { enregistrerCoordonnees } from "./actions";
import { ETAT_CONTENU_INITIAL } from "./etats";

export function FormulaireCoordonnees({
  coordonnees,
}: {
  coordonnees: Coordonnees;
}) {
  const [etat, action, enCours] = useActionState(
    enregistrerCoordonnees,
    ETAT_CONTENU_INITIAL,
  );

  const reseauxTexte = coordonnees.reseaux
    .map((reseau) => `${reseau.nom} | ${reseau.url}`)
    .join("\n");

  return (
    <form action={action} className="space-y-6">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Champ htmlFor="telephone" label="Téléphone">
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={coordonnees.telephone}
          />
        </Champ>

        <Champ htmlFor="email" label="Email de contact">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={coordonnees.email}
          />
        </Champ>
      </div>

      <Champ htmlFor="adresse" label="Adresse">
        <Input id="adresse" name="adresse" defaultValue={coordonnees.adresse} />
      </Champ>

      <div className="grid gap-6 sm:grid-cols-2">
        <Champ htmlFor="ville" label="Ville">
          <Input id="ville" name="ville" defaultValue={coordonnees.ville} />
        </Champ>

        <Champ htmlFor="pays" label="Pays">
          <Input id="pays" name="pays" defaultValue={coordonnees.pays} />
        </Champ>
      </div>

      <Champ
        htmlFor="reseaux"
        label="Réseaux sociaux"
        aide="Une ligne par réseau, au format « Nom | https://adresse ». Les lignes sans adresse valide sont ignorées."
      >
        <Textarea
          id="reseaux"
          name="reseaux"
          defaultValue={reseauxTexte}
          className="min-h-32 font-mono text-sm"
          aria-describedby="reseaux-aide"
          placeholder="Facebook | https://facebook.com/..."
        />
      </Champ>

      <div className="border-t border-line pt-6">
        <Bouton type="submit" disabled={enCours}>
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </Bouton>
      </div>
    </form>
  );
}
