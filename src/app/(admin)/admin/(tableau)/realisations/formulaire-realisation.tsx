"use client";

import { useActionState } from "react";
import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Select, Textarea } from "@/components/ui/formulaire";
import { DOMAINES } from "@/lib/domaines";
import { IMAGE } from "@/lib/validations/medias";
import { enregistrerRealisation } from "./actions";
import { ETAT_REALISATION_INITIAL } from "./etats";

const CLASSE_FICHIER =
  "w-full rounded-brand border border-line-strong bg-surface px-3.5 py-2.5 text-sm file:mr-4 file:rounded-brand file:border-0 file:bg-surface-sunken file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:border-ink-muted";

export function FormulaireRealisation({
  realisation,
}: {
  realisation?: {
    id: string;
    titre: string;
    description: string;
    localisation: string;
    domaineSlug: string;
    ordre: number;
    aPhotoAvant: boolean;
    aPhotoApres: boolean;
    nombrePhotos: number;
  };
}) {
  const [etat, action, enCours] = useActionState(
    enregistrerRealisation,
    ETAT_REALISATION_INITIAL,
  );

  const erreurs = etat.statut === "erreur" ? (etat.champs ?? {}) : {};

  return (
    <form action={action} className="space-y-6">
      {realisation && <input type="hidden" name="id" value={realisation.id} />}

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

      <Champ htmlFor="titre" label="Titre du projet" obligatoire erreur={erreurs.titre}>
        <Input
          id="titre"
          name="titre"
          required
          defaultValue={realisation?.titre}
          enErreur={Boolean(erreurs.titre)}
          aria-describedby={erreurs.titre ? "titre-erreur" : undefined}
        />
      </Champ>

      <div className="grid gap-6 sm:grid-cols-2">
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
            defaultValue={realisation?.domaineSlug ?? ""}
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

        <Champ htmlFor="localisation" label="Localisation">
          <Input
            id="localisation"
            name="localisation"
            defaultValue={realisation?.localisation}
          />
        </Champ>
      </div>

      <Champ
        htmlFor="description"
        label="Description"
        aide="Nature des travaux, contraintes, résultat obtenu. Les sauts de ligne sont conservés."
        obligatoire
        erreur={erreurs.description}
      >
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={realisation?.description}
          className="min-h-56"
          enErreur={Boolean(erreurs.description)}
          aria-describedby={
            erreurs.description
              ? "description-erreur description-aide"
              : "description-aide"
          }
        />
      </Champ>

      <Champ
        htmlFor="ordre"
        label="Ordre d'affichage"
        aide="Le plus petit nombre apparaît en premier dans la galerie."
        erreur={erreurs.ordre}
      >
        <Input
          id="ordre"
          name="ordre"
          type="number"
          min={0}
          max={9999}
          defaultValue={realisation?.ordre ?? 0}
          className="max-w-32"
          enErreur={Boolean(erreurs.ordre)}
          aria-describedby={erreurs.ordre ? "ordre-erreur ordre-aide" : "ordre-aide"}
        />
      </Champ>

      <fieldset className="space-y-6 border-t border-line pt-6">
        <legend className="text-lg font-bold">Visuels</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <Champ
            htmlFor="photoAvant"
            label="Photo avant travaux"
            aide={
              realisation?.aPhotoAvant
                ? "Une photo est déjà associée, en choisir une nouvelle la remplacera."
                : "JPG, PNG ou WebP, 5 Mo au maximum."
            }
          >
            <input
              id="photoAvant"
              name="photoAvant"
              type="file"
              accept={IMAGE.typesAcceptes.join(",")}
              aria-describedby="photoAvant-aide"
              className={CLASSE_FICHIER}
            />
          </Champ>

          <Champ
            htmlFor="photoApres"
            label="Photo après travaux"
            aide={
              realisation?.aPhotoApres
                ? "Une photo est déjà associée, en choisir une nouvelle la remplacera."
                : "Sert aussi de vignette dans la galerie."
            }
          >
            <input
              id="photoApres"
              name="photoApres"
              type="file"
              accept={IMAGE.typesAcceptes.join(",")}
              aria-describedby="photoApres-aide"
              className={CLASSE_FICHIER}
            />
          </Champ>
        </div>

        <Champ
          htmlFor="photos"
          label="Photos complémentaires"
          aide={
            realisation
              ? `${realisation.nombrePhotos} photo(s) déjà en ligne. Les nouvelles s'ajoutent aux précédentes.`
              : "Plusieurs fichiers possibles."
          }
        >
          <input
            id="photos"
            name="photos"
            type="file"
            multiple
            accept={IMAGE.typesAcceptes.join(",")}
            aria-describedby="photos-aide"
            className={CLASSE_FICHIER}
          />
        </Champ>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Bouton type="submit" disabled={enCours}>
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </Bouton>
        <Link
          href="/admin/realisations"
          className="text-sm font-medium text-ink-muted hover:text-accent-text"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
