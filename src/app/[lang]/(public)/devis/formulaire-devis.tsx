"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Select, Textarea } from "@/components/ui/formulaire";
import { DOMAINES } from "@/lib/domaines";
import { PIECE_JOINTE } from "@/lib/validations/devis";
import { envoyerDevis } from "./actions";
import { ETAT_DEVIS_INITIAL } from "./etats";

export function FormulaireDevis({
  domaineInitial,
}: {
  domaineInitial?: string;
}) {
  const [etat, action, enCours] = useActionState(
    envoyerDevis,
    ETAT_DEVIS_INITIAL,
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
        <h2 className="mt-4 text-2xl">Votre demande est enregistrée</h2>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-muted">
          Conservez cette référence : elle vous permet de suivre l&apos;état de
          votre demande et de votre livraison à tout moment.
        </p>
        <p className="mt-6 text-sm font-semibold text-ink-muted">
          Référence de suivi
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight">
          {etat.reference}
        </p>
        <Link
          href={`/suivi?reference=${etat.reference}`}
          className="mt-6 inline-flex items-center text-sm font-semibold text-accent-text hover:underline"
        >
          Suivre cette demande
        </Link>
      </div>
    );
  }

  const erreurs = etat.statut === "erreur" ? (etat.champs ?? {}) : {};

  return (
    <form action={action} className="space-y-7" noValidate>
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

      <fieldset className="space-y-6">
        <legend className="text-lg font-bold">Vos coordonnées</legend>

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
          <Champ
            htmlFor="email"
            label="Email"
            aide="Email ou téléphone, au moins l'un des deux."
            erreur={erreurs.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              enErreur={Boolean(erreurs.email)}
              aria-describedby={
                erreurs.email ? "email-erreur email-aide" : "email-aide"
              }
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

        <Champ htmlFor="entreprise" label="Entreprise ou institution">
          <Input
            id="entreprise"
            name="entreprise"
            autoComplete="organization"
          />
        </Champ>
      </fieldset>

      <fieldset className="space-y-6 border-t border-line pt-7">
        <legend className="text-lg font-bold">Votre besoin</legend>

        <Champ
          htmlFor="domaineSlug"
          label="Domaine d'activité"
          obligatoire
          erreur={erreurs.domaineSlug}
        >
          <Select
            id="domaineSlug"
            name="domaineSlug"
            required
            defaultValue={domaineInitial ?? ""}
            enErreur={Boolean(erreurs.domaineSlug)}
          >
            <option value="" disabled>
              Choisissez un domaine
            </option>
            {DOMAINES.map((domaine) => (
              <option key={domaine.slug} value={domaine.slug}>
                {domaine.nom}
              </option>
            ))}
          </Select>
        </Champ>

        <Champ
          htmlFor="description"
          label="Description de votre projet"
          aide="Nature des travaux, quantités, localisation, contraintes particulières."
          obligatoire
          erreur={erreurs.description}
        >
          <Textarea
            id="description"
            name="description"
            required
            minLength={20}
            enErreur={Boolean(erreurs.description)}
            aria-describedby={
              erreurs.description
                ? "description-erreur description-aide"
                : "description-aide"
            }
          />
        </Champ>

        <div className="grid gap-6 sm:grid-cols-2">
          <Champ htmlFor="budget" label="Budget envisagé">
            <Input id="budget" name="budget" />
          </Champ>
          <Champ htmlFor="delaiSouhaite" label="Délai souhaité">
            <Input id="delaiSouhaite" name="delaiSouhaite" />
          </Champ>
        </div>

        <Champ
          htmlFor="adresseLivraison"
          label="Adresse de livraison"
          aide="À renseigner pour une commande de matériaux ou une prestation de transport."
        >
          <Input
            id="adresseLivraison"
            name="adresseLivraison"
            autoComplete="street-address"
            aria-describedby="adresseLivraison-aide"
          />
        </Champ>

        <Champ
          htmlFor="pieces"
          label="Documents ou photos"
          aide={`JPG, PNG, WebP ou PDF. ${PIECE_JOINTE.nombreMax} fichiers au maximum, 10 Mo chacun.`}
        >
          <input
            id="pieces"
            name="pieces"
            type="file"
            multiple
            accept={PIECE_JOINTE.typesAcceptes.join(",")}
            aria-describedby="pieces-aide"
            className="w-full rounded-brand border border-line-strong bg-surface px-3.5 py-2.5 text-sm file:mr-4 file:rounded-brand file:border-0 file:bg-surface-sunken file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:border-ink-muted"
          />
        </Champ>
      </fieldset>

      {/* Piège à robots : masqué visuellement et retiré du parcours clavier. */}
      <div aria-hidden className="hidden">
        <label htmlFor="site_web">Ne pas remplir</label>
        <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <Bouton type="submit" disabled={enCours} className="w-full sm:w-auto">
        {enCours ? "Envoi en cours..." : "Envoyer ma demande"}
      </Bouton>
    </form>
  );
}
