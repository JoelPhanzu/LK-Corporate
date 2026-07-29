import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { getDictionnaire } from "@/lib/dictionnaire";
import type { Langue } from "@/lib/i18n";
import { ETAPES_LIVRAISON, type EtapeLivraison } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Correspondance entre les valeurs stockées en base et les clés d'affichage. */
const CORRESPONDANCE: Record<string, EtapeLivraison> = {
  RECUE: "recue",
  EN_PREPARATION: "preparation",
  EN_TRANSIT: "transit",
  LIVREE: "livree",
};

/**
 * Frise des quatre étapes de livraison.
 *
 * Les étapes franchies sont marquées, l'étape courante est mise en avant, les
 * suivantes restent en attente. L'information n'est pas portée par la seule
 * couleur : un libellé d'état accompagne chaque étape pour les lecteurs
 * d'écran et les daltoniens.
 */
export function FriseLivraison({
  statut,
  langue,
}: {
  statut: string;
  langue: Langue;
}) {
  const dico = getDictionnaire(langue);
  const courante = CORRESPONDANCE[statut] ?? "recue";
  const indexCourant = ETAPES_LIVRAISON.findIndex(
    (etape) => etape.cle === courante,
  );

  return (
    <ol className="grid gap-4 sm:grid-cols-4 sm:gap-3">
      {ETAPES_LIVRAISON.map((etape, index) => {
        const franchie = index < indexCourant;
        const active = index === indexCourant;
        const etat = franchie
          ? dico.livraison.etapeFranchie
          : active
            ? dico.livraison.etapeEnCours
            : dico.livraison.etapeAVenir;

        return (
          <li key={etape.cle} className="flex items-center gap-3 sm:block">
            <div
              aria-hidden
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold sm:mb-3",
                franchie && "border-accent bg-accent text-accent-ink",
                active && "border-accent text-accent-text",
                !franchie && !active && "border-line-strong text-ink-muted",
              )}
            >
              {franchie ? <CheckIcon size={16} weight="bold" /> : index + 1}
            </div>
            <div
              aria-hidden
              className={cn(
                "hidden h-0.5 sm:mb-3 sm:block",
                index <= indexCourant ? "bg-accent" : "bg-line",
              )}
            />
            <p
              className={cn(
                "text-sm font-semibold",
                active ? "text-ink" : "text-ink-muted",
              )}
            >
              {dico.livraison[etape.cle]}
              <span className="sr-only"> : {etat}</span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}
