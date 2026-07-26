/**
 * Les 9 domaines d'activité de LK-CORPORATE (cahier des charges, §3).
 *
 * Source unique : consommée par la page « Nos services », le sélecteur du
 * formulaire de devis et le seed de la base. Le `slug` sert d'URL et de valeur
 * stockée en base : ne jamais le modifier sans migration.
 */

export type Domaine = {
  slug: string;
  /** Libellé court, pour les listes et le sélecteur du formulaire de devis. */
  nom: string;
  /** Titre éditorial, pour l'en-tête de la page dédiée. */
  titre: string;
  /** Résumé d'une phrase, affiché sur les cartes de la page Services. */
  resume: string;
  /** Prestations concrètes, affichées sur la page du domaine. */
  prestations: string[];
};

export const DOMAINES: Domaine[] = [
  {
    slug: "commerce-general",
    nom: "Commerce général",
    titre: "Commerce général",
    resume:
      "Approvisionnement et négoce de biens pour les entreprises, les institutions et les particuliers.",
    prestations: [
      "Sourcing et achat de marchandises",
      "Négoce et revente en gros et demi-gros",
      "Approvisionnement récurrent pour entreprises",
      "Gestion des importations et du dédouanement",
    ],
  },
  {
    slug: "genie-civil",
    nom: "Génie civil et construction",
    titre: "Travaux de génie civil, bâtiments et ponts",
    resume:
      "Construction de bâtiments et d'ouvrages d'art, du terrassement à la livraison des clés.",
    prestations: [
      "Construction de bâtiments résidentiels et industriels",
      "Ouvrages d'art : ponts, dalots, ouvrages de franchissement",
      "Terrassement et fondations",
      "Gros œuvre et second œuvre",
      "Suivi de chantier et coordination des corps de métier",
    ],
  },
  {
    slug: "renovation",
    nom: "Rénovation",
    titre: "Rénovation de bâtiments résidentiels et non résidentiels",
    resume:
      "Remise à neuf, réhabilitation et mise aux normes de bâtiments existants.",
    prestations: [
      "Réhabilitation lourde et reprise de structure",
      "Rénovation de bureaux et de locaux commerciaux",
      "Réfection de toitures, façades et menuiseries",
      "Mise aux normes électriques et sanitaires",
      "Aménagement et finitions intérieures",
    ],
  },
  {
    slug: "terrains",
    nom: "Achat et vente de terrains",
    titre: "Achat et vente de terrains",
    resume:
      "Accompagnement foncier, de la recherche de parcelle à la sécurisation des titres.",
    prestations: [
      "Recherche de parcelles selon cahier des charges",
      "Vérification des titres et de la situation foncière",
      "Intermédiation entre vendeurs et acquéreurs",
      "Accompagnement administratif jusqu'à la cession",
    ],
  },
  {
    slug: "travaux-publics",
    nom: "Travaux publics",
    titre: "Travaux publics et aménagement extérieur",
    resume:
      "Aménagement extérieur, éclairage public, assainissement et espaces verts pour collectivités et entreprises.",
    prestations: [
      "Aménagement extérieur et voirie",
      "Éclairage public et réseaux secs",
      "Assainissement et gestion des eaux pluviales",
      "Jardinage et entretien d'espaces verts",
      "Pavage, bordures et ouvrages de drainage",
    ],
  },
  {
    slug: "materiaux-equipements",
    nom: "Matériaux et équipements",
    titre: "Fourniture de matériaux et d'équipements électriques",
    resume:
      "Fourniture de matériaux de construction et d'équipements électriques, livrés sur chantier.",
    prestations: [
      "Matériaux de construction : ciment, fer, agrégats, bois",
      "Matériel et outillage de chantier",
      "Équipements et appareillages électriques",
      "Câblage, tableaux et protections",
      "Livraison directe sur site",
    ],
  },
  {
    slug: "energie-solaire",
    nom: "Énergie solaire",
    titre: "Panneaux solaires : fourniture, installation, maintenance",
    resume:
      "Installations photovoltaïques dimensionnées pour les foyers, les entreprises et les sites isolés.",
    prestations: [
      "Étude de besoin et dimensionnement",
      "Fourniture de panneaux, onduleurs et batteries",
      "Installation et mise en service",
      "Maintenance préventive et curative",
      "Solutions hors réseau pour sites isolés",
    ],
  },
  {
    slug: "nettoyage-entretien",
    nom: "Nettoyage et entretien",
    titre: "Nettoyage et entretien de bureaux et de bâtiments",
    resume:
      "Prestations de propreté régulières ou ponctuelles pour bureaux, bâtiments et locaux professionnels.",
    prestations: [
      "Nettoyage régulier de bureaux et de locaux",
      "Remise en état après travaux",
      "Entretien de bâtiments et de parties communes",
      "Nettoyage de vitrerie et de surfaces spécifiques",
      "Contrats d'entretien périodiques",
    ],
  },
  {
    slug: "logistique-transport",
    nom: "Logistique et transport",
    titre: "Logistique, transport et approvisionnement",
    resume:
      "Organisation du transport de marchandises et gestion de l'approvisionnement pour le compte de tiers.",
    prestations: [
      "Transport de marchandises et de matériaux",
      "Organisation et planification des tournées",
      "Approvisionnement pour le compte de tiers",
      "Manutention et chargement",
      "Suivi de livraison étape par étape",
    ],
  },
];

/** Recherche un domaine par son slug d'URL. */
export function getDomaine(slug: string): Domaine | undefined {
  return DOMAINES.find((domaine) => domaine.slug === slug);
}

/** Options du sélecteur « type de prestation » du formulaire de devis. */
export const OPTIONS_DEVIS = DOMAINES.map(({ slug, nom }) => ({
  value: slug,
  label: nom,
}));
