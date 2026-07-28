import type { StatutDemande, StatutLivraison, TypeDemande, RoleAdmin } from "@/generated/prisma/enums";

/** Libellés français des valeurs stockées en base, pour l'affichage. */

export const LIBELLE_STATUT_DEMANDE: Record<StatutDemande, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours de traitement",
  TRAITEE: "Traitée",
  ARCHIVEE: "Archivée",
};

export const LIBELLE_STATUT_LIVRAISON: Record<StatutLivraison, string> = {
  RECUE: "Reçue",
  EN_PREPARATION: "En préparation",
  EN_TRANSIT: "En transit",
  LIVREE: "Livrée",
};

export const LIBELLE_TYPE_DEMANDE: Record<TypeDemande, string> = {
  DEVIS: "Devis",
  COMMANDE: "Commande",
};

export const LIBELLE_ROLE: Record<RoleAdmin, string> = {
  PROPRIETAIRE: "Propriétaire",
  ADMIN: "Administrateur",
  AGENT: "Agent",
};

/** Ordre d'affichage des statuts dans les sélecteurs et les filtres. */
export const STATUTS_DEMANDE: StatutDemande[] = [
  "NOUVELLE",
  "EN_COURS",
  "TRAITEE",
  "ARCHIVEE",
];

export const STATUTS_LIVRAISON: StatutLivraison[] = [
  "RECUE",
  "EN_PREPARATION",
  "EN_TRANSIT",
  "LIVREE",
];
