"use client";

import { useActionState } from "react";
import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Bouton } from "@/components/ui/button";
import { Champ, Input, Textarea } from "@/components/ui/formulaire";
import { IMAGE } from "@/lib/validations/medias";
import { enregistrerArticle } from "./actions";
import { ETAT_ARTICLE_INITIAL } from "./etats";

export function FormulaireArticle({
  article,
}: {
  article?: {
    id: string;
    titre: string;
    chapo: string;
    contenu: string;
    aUneImage: boolean;
  };
}) {
  const [etat, action, enCours] = useActionState(
    enregistrerArticle,
    ETAT_ARTICLE_INITIAL,
  );

  const erreurs = etat.statut === "erreur" ? (etat.champs ?? {}) : {};

  return (
    <form action={action} className="space-y-6">
      {article && <input type="hidden" name="id" value={article.id} />}

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

      <Champ htmlFor="titre" label="Titre" obligatoire erreur={erreurs.titre}>
        <Input
          id="titre"
          name="titre"
          required
          defaultValue={article?.titre}
          enErreur={Boolean(erreurs.titre)}
          aria-describedby={erreurs.titre ? "titre-erreur" : undefined}
        />
      </Champ>

      <Champ
        htmlFor="chapo"
        label="Chapô"
        aide="Résumé de deux ou trois lignes, affiché dans la liste et sur les réseaux sociaux."
        obligatoire
        erreur={erreurs.chapo}
      >
        <Textarea
          id="chapo"
          name="chapo"
          required
          defaultValue={article?.chapo}
          className="min-h-24"
          enErreur={Boolean(erreurs.chapo)}
          aria-describedby={
            erreurs.chapo ? "chapo-erreur chapo-aide" : "chapo-aide"
          }
        />
      </Champ>

      <Champ
        htmlFor="contenu"
        label="Contenu"
        aide="Les sauts de ligne sont conservés à l'affichage."
        obligatoire
        erreur={erreurs.contenu}
      >
        <Textarea
          id="contenu"
          name="contenu"
          required
          defaultValue={article?.contenu}
          className="min-h-72"
          enErreur={Boolean(erreurs.contenu)}
          aria-describedby={
            erreurs.contenu ? "contenu-erreur contenu-aide" : "contenu-aide"
          }
        />
      </Champ>

      <Champ
        htmlFor="image"
        label="Image d'illustration"
        aide={
          article?.aUneImage
            ? "Une image est déjà associée. En choisir une nouvelle la remplacera ; laisser vide la conserve."
            : "JPG, PNG ou WebP, 5 Mo au maximum."
        }
      >
        <input
          id="image"
          name="image"
          type="file"
          accept={IMAGE.typesAcceptes.join(",")}
          aria-describedby="image-aide"
          className="w-full rounded-brand border border-line-strong bg-surface px-3.5 py-2.5 text-sm file:mr-4 file:rounded-brand file:border-0 file:bg-surface-sunken file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:border-ink-muted"
        />
      </Champ>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Bouton type="submit" disabled={enCours}>
          {enCours ? "Enregistrement..." : "Enregistrer"}
        </Bouton>
        <Link
          href="/admin/actualites"
          className="text-sm font-medium text-ink-muted hover:text-accent-text"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
