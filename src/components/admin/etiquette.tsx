import type { StatutDemande, StatutLivraison } from "@/generated/prisma/enums";
import {
  LIBELLE_STATUT_DEMANDE,
  LIBELLE_STATUT_LIVRAISON,
} from "@/lib/libelles";
import { cn } from "@/lib/utils";

const BASE =
  "inline-flex items-center rounded-brand border px-2.5 py-1 text-xs font-semibold";

/**
 * L'état n'est jamais porté par la seule couleur : le libellé est toujours
 * écrit en toutes lettres, la teinte ne fait que le renforcer.
 */
const TEINTES_DEMANDE: Record<StatutDemande, string> = {
  NOUVELLE: "border-accent bg-accent/15 text-accent-text",
  EN_COURS: "border-line-strong bg-surface-sunken text-ink",
  TRAITEE: "border-green-700 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/40 dark:text-green-100",
  ARCHIVEE: "border-line bg-surface text-ink-muted",
};

const TEINTES_LIVRAISON: Record<StatutLivraison, string> = {
  RECUE: "border-line-strong bg-surface-sunken text-ink",
  EN_PREPARATION: "border-accent bg-accent/15 text-accent-text",
  EN_TRANSIT: "border-accent bg-accent/15 text-accent-text",
  LIVREE: "border-green-700 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/40 dark:text-green-100",
};

export function EtiquetteDemande({ statut }: { statut: StatutDemande }) {
  return (
    <span className={cn(BASE, TEINTES_DEMANDE[statut])}>
      {LIBELLE_STATUT_DEMANDE[statut]}
    </span>
  );
}

export function EtiquetteLivraison({ statut }: { statut: StatutLivraison }) {
  return (
    <span className={cn(BASE, TEINTES_LIVRAISON[statut])}>
      {LIBELLE_STATUT_LIVRAISON[statut]}
    </span>
  );
}
