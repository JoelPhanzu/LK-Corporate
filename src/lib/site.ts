/**
 * Coordonnées et constantes du site.
 *
 * TODO client : les valeurs marquées « à confirmer » viennent du cahier des
 * charges §8 (« Éléments attendus du client ») et n'ont pas encore été
 * transmises. Elles sont volontairement neutres pour ne rien inventer.
 */

export const SITE = {
  nom: "LK-CORPORATE",
  raisonSociale: "LK-CORPORATE S.A.S.U.",
  accroche: "Construction, travaux publics et logistique",
  description:
    "LK-CORPORATE S.A.S.U. accompagne particuliers, entreprises et institutions en construction, génie civil, travaux publics, énergie solaire et logistique.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lk-corporate.com",
} as const;

type Contact = {
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  pays: string;
};

// Typé explicitement, sans `as const` : les champs encore vides doivent rester
// de type `string`, sinon TypeScript les réduit au littéral "" puis à `never`
// dès qu'on les teste avant affichage.
export const CONTACT: Contact = {
  // À confirmer par le client. Laisser vide plutôt qu'inventer : le cahier des
  // charges indique seulement « société congolaise », sans ville ni adresse.
  telephone: "",
  email: "",
  adresse: "",
  ville: "",
  pays: "République démocratique du Congo",
};

export const RESEAUX: { nom: string; url: string }[] = [
  // À confirmer par le client
];

/** Navigation principale du site vitrine. */
export const NAV_PUBLIC = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
] as const;

/** Étapes de suivi d'une commande ou d'une livraison (cahier des charges §4). */
export const ETAPES_LIVRAISON = [
  { cle: "recue", label: "Reçue" },
  { cle: "preparation", label: "En préparation" },
  { cle: "transit", label: "En transit" },
  { cle: "livree", label: "Livrée" },
] as const;

export type EtapeLivraison = (typeof ETAPES_LIVRAISON)[number]["cle"];
