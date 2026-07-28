import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  PaperclipIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  EtiquetteDemande,
  EtiquetteLivraison,
} from "@/components/admin/etiquette";
import { Bouton } from "@/components/ui/button";
import { Champ, Select, Textarea, Input } from "@/components/ui/formulaire";
import { exigerAdmin } from "@/lib/auth";
import { getDomaine } from "@/lib/domaines";
import {
  LIBELLE_STATUT_DEMANDE,
  LIBELLE_STATUT_LIVRAISON,
  LIBELLE_TYPE_DEMANDE,
  STATUTS_DEMANDE,
  STATUTS_LIVRAISON,
} from "@/lib/libelles";
import { prisma } from "@/lib/prisma";
import { BUCKET_PIECES, creerClientAdmin } from "@/lib/supabase/admin";
import {
  ajouterNote,
  changerStatutDemande,
  changerStatutLivraison,
} from "../actions";

export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Octets en unité lisible, pour l'affichage des pièces jointes. */
function taille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Les pièces jointes vivent dans un bucket privé : on génère des liens signés
 * de courte durée plutôt que d'exposer les fichiers publiquement.
 */
async function liensPieces(
  pieces: { id: string; chemin: string }[],
): Promise<Record<string, string>> {
  if (pieces.length === 0) return {};

  try {
    const supabase = creerClientAdmin();
    const entrees = await Promise.all(
      pieces.map(async (piece) => {
        const { data } = await supabase.storage
          .from(BUCKET_PIECES)
          .createSignedUrl(piece.chemin, 3600);
        return [piece.id, data?.signedUrl ?? ""] as const;
      }),
    );
    return Object.fromEntries(entrees.filter(([, url]) => url !== ""));
  } catch (erreur) {
    console.error("Génération des liens de pièces jointes impossible", erreur);
    return {};
  }
}

export default async function PageDemande(
  props: PageProps<"/admin/demandes/[id]">,
) {
  await exigerAdmin();
  const { id } = await props.params;

  const demande = await prisma.demande.findUnique({
    where: { id },
    include: {
      lead: true,
      pieces: true,
      notes: { orderBy: { creeLe: "desc" }, include: { auteur: true } },
      livraison: { include: { etapes: { orderBy: { creeLe: "desc" } } } },
    },
  });

  if (!demande) notFound();

  const liens = await liensPieces(demande.pieces);
  const domaine = getDomaine(demande.domaineSlug);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/demandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
      >
        <ArrowLeftIcon size={16} weight="bold" aria-hidden />
        Toutes les demandes
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl">{demande.reference}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {LIBELLE_TYPE_DEMANDE[demande.type]}, déposée le{" "}
            {dateFr.format(demande.creeLe)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EtiquetteDemande statut={demande.statut} />
          {demande.livraison && (
            <EtiquetteLivraison statut={demande.livraison.statut} />
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-8">
        {/* ---------------------------------------------------- contenu */}
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="text-lg font-bold">Demandeur</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
              <div className="flex gap-4 py-3">
                <dt className="w-40 shrink-0 text-ink-muted">Nom</dt>
                <dd className="font-medium">{demande.lead.nom}</dd>
              </div>
              {demande.lead.entreprise && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Entreprise</dt>
                  <dd>{demande.lead.entreprise}</dd>
                </div>
              )}
              {demande.lead.email && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${demande.lead.email}`}
                      className="text-accent-text hover:underline"
                    >
                      {demande.lead.email}
                    </a>
                  </dd>
                </div>
              )}
              {demande.lead.telephone && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Téléphone</dt>
                  <dd>
                    <a
                      href={`tel:${demande.lead.telephone.replace(/\s/g, "")}`}
                      className="text-accent-text hover:underline"
                    >
                      {demande.lead.telephone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-bold">Besoin exprimé</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
              <div className="flex gap-4 py-3">
                <dt className="w-40 shrink-0 text-ink-muted">Domaine</dt>
                <dd className="font-medium">
                  {domaine?.nom ?? demande.domaineSlug}
                </dd>
              </div>
              {demande.budget && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Budget</dt>
                  <dd>{demande.budget}</dd>
                </div>
              )}
              {demande.delaiSouhaite && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Délai souhaité</dt>
                  <dd>{demande.delaiSouhaite}</dd>
                </div>
              )}
              {demande.adresseLivraison && (
                <div className="flex gap-4 py-3">
                  <dt className="w-40 shrink-0 text-ink-muted">Livraison</dt>
                  <dd>{demande.adresseLivraison}</dd>
                </div>
              )}
            </dl>
            <p className="mt-5 whitespace-pre-line leading-relaxed">
              {demande.description}
            </p>
          </section>

          {demande.pieces.length > 0 && (
            <section>
              <h2 className="text-lg font-bold">Pièces jointes</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {demande.pieces.map((piece) => {
                  const lien = liens[piece.id];
                  return (
                    <li
                      key={piece.id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <PaperclipIcon size={16} aria-hidden className="shrink-0" />
                        <span className="truncate">{piece.nomFichier}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-4">
                        <span className="text-ink-muted">
                          {taille(piece.tailleOctets)}
                        </span>
                        {lien ? (
                          <a
                            href={lien}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-accent-text hover:underline"
                          >
                            Ouvrir
                          </a>
                        ) : (
                          <span className="text-ink-muted">Indisponible</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold">Notes internes</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Visibles uniquement par l&apos;équipe, jamais par le demandeur.
            </p>

            <form action={ajouterNote} className="mt-4 space-y-3">
              <input type="hidden" name="demandeId" value={demande.id} />
              <Champ htmlFor="contenu" label="Ajouter une note" obligatoire>
                <Textarea
                  id="contenu"
                  name="contenu"
                  required
                  className="min-h-24"
                />
              </Champ>
              <Bouton type="submit" variante="secondaire">
                Enregistrer la note
              </Bouton>
            </form>

            {demande.notes.length > 0 && (
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {demande.notes.map((note) => (
                  <li key={note.id} className="py-4">
                    <p className="text-sm text-ink-muted">
                      {note.auteur?.nom ?? "Compte supprimé"}
                      {", "}
                      <time dateTime={note.creeLe.toISOString()}>
                        {dateFr.format(note.creeLe)}
                      </time>
                    </p>
                    <p className="mt-1 whitespace-pre-line leading-relaxed">
                      {note.contenu}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ---------------------------------------------------- pilotage */}
        <aside className="space-y-8">
          <section className="rounded-brand border border-line p-5">
            <h2 className="text-lg font-bold">Traitement</h2>
            <form action={changerStatutDemande} className="mt-4 space-y-3">
              <input type="hidden" name="demandeId" value={demande.id} />
              <Champ htmlFor="statut" label="Statut de la demande">
                <Select
                  id="statut"
                  name="statut"
                  defaultValue={demande.statut}
                >
                  {STATUTS_DEMANDE.map((valeur) => (
                    <option key={valeur} value={valeur}>
                      {LIBELLE_STATUT_DEMANDE[valeur]}
                    </option>
                  ))}
                </Select>
              </Champ>
              <Bouton type="submit" className="w-full">
                Mettre à jour
              </Bouton>
            </form>
          </section>

          <section className="rounded-brand border border-line p-5">
            <h2 className="text-lg font-bold">Livraison</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Le statut choisi ici est celui que voit le client sur sa page de
              suivi.
            </p>

            <form action={changerStatutLivraison} className="mt-4 space-y-3">
              <input type="hidden" name="demandeId" value={demande.id} />
              <Champ htmlFor="statutLivraison" label="Statut de livraison">
                <Select
                  id="statutLivraison"
                  name="statut"
                  defaultValue={demande.livraison?.statut ?? "RECUE"}
                >
                  {STATUTS_LIVRAISON.map((valeur) => (
                    <option key={valeur} value={valeur}>
                      {LIBELLE_STATUT_LIVRAISON[valeur]}
                    </option>
                  ))}
                </Select>
              </Champ>
              <Champ
                htmlFor="commentaire"
                label="Commentaire"
                aide="Affiché au client dans l'historique."
              >
                <Input
                  id="commentaire"
                  name="commentaire"
                  aria-describedby="commentaire-aide"
                />
              </Champ>
              <Bouton type="submit" className="w-full">
                Enregistrer l&apos;étape
              </Bouton>
            </form>

            {demande.livraison && demande.livraison.etapes.length > 0 && (
              <ol className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
                {demande.livraison.etapes.map((etape) => (
                  <li key={etape.id}>
                    <time
                      dateTime={etape.creeLe.toISOString()}
                      className="text-ink-muted"
                    >
                      {dateFr.format(etape.creeLe)}
                    </time>
                    <p className="font-medium">
                      {LIBELLE_STATUT_LIVRAISON[etape.statut]}
                    </p>
                    {etape.commentaire && (
                      <p className="text-ink-muted">{etape.commentaire}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
