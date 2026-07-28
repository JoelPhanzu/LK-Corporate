/**
 * Catalogue des visuels de banque d'images.
 *
 * Photographies réelles sous licence Pexels (usage commercial autorisé, aucune
 * attribution exigée). Aucune image générée par IA. Chaque visuel a été choisi
 * pour deux critères : il montre des professionnels africains, et la scène
 * correspond au message de la page où il est posé.
 *
 * ⚠ Ces personnes ne sont PAS des collaborateurs de LK-CORPORATE et ces
 * chantiers ne sont pas les siens. Les textes alternatifs décrivent donc la
 * scène sans jamais l'attribuer à l'entreprise. Le cahier des charges §8 prévoit
 * que le client fournisse ses propres photos : le jour où elles arrivent, seul
 * ce fichier et `components/ui/photo.tsx` changent.
 *
 * `source` pointe vers la page Pexels d'origine, pour retrouver l'auteur et
 * vérifier la licence à tout moment.
 */

export type Visuel = {
  /** Identifiant Pexels, qui suffit à reconstruire l'URL de l'image. */
  id: number;
  /** Description de la scène, utilisée à défaut d'alternative explicite. */
  alt: string;
  source: string;
};

export const VISUELS = {
  "accueil-hero": {
    id: 37198883,
    alt: "Équipe d'ingénieurs en casque et gilet de sécurité réunie autour de plans de chantier",
    source: "https://www.pexels.com/photo/team-of-engineers-reviewing-blueprint-indoors-37198883/",
  },
  "accueil-domaine-phare": {
    id: 30934425,
    alt: "Ouvrier sur un chantier de construction, devant une structure en ferraillage",
    source: "https://www.pexels.com/photo/young-man-at-construction-site-in-rwanda-30934425/",
  },
  "a-propos": {
    id: 30688593,
    alt: "Réunion d'équipe dans un bureau, collaborateurs en tenue professionnelle",
    source: "https://www.pexels.com/photo/casual-office-meeting-in-lagos-nigeria-30688593/",
  },

  // Un visuel par domaine de services, indexé sur le slug du domaine.
  "commerce-general": {
    id: 30677598,
    alt: "Poignée de main entre partenaires à l'issue d'une réunion de travail",
    source: "https://www.pexels.com/photo/business-team-meeting-with-handshakes-in-lagos-cafe-30677598/",
  },
  "genie-civil": {
    id: 38284507,
    alt: "Ouvrier en casque sur un chantier de construction en milieu urbain",
    source: "https://www.pexels.com/photo/urban-construction-worker-in-progress-38284507/",
  },
  renovation: {
    id: 36153946,
    alt: "Ouvrier appliquant une peinture au rouleau lors de la rénovation d'un intérieur",
    source: "https://www.pexels.com/photo/construction-workers-painting-interior-walls-36153946/",
  },
  terrains: {
    id: 34247810,
    alt: "Géomètres relevant un terrain au théodolite",
    source: "https://www.pexels.com/photo/surveying-team-in-shiselweni-eswatini-34247810/",
  },
  "travaux-publics": {
    id: 35340757,
    alt: "Équipe de voirie au travail sur un chantier routier",
    source: "https://www.pexels.com/photo/road-construction-crew-working-outdoors-35340757/",
  },
  "materiaux-equipements": {
    id: 17842843,
    alt: "Technicien intervenant sur un tableau électrique",
    source: "https://www.pexels.com/photo/a-man-maintaining-an-inverter-17842843/",
  },
  "energie-solaire": {
    id: 30285845,
    alt: "Technicien raccordant des panneaux solaires en toiture",
    source: "https://www.pexels.com/photo/technician-installing-solar-panels-on-rooftop-30285845/",
  },
  "nettoyage-entretien": {
    id: 6195121,
    alt: "Équipe d'agents d'entretien en uniforme",
    source: "https://www.pexels.com/photo/people-looking-at-the-camera-6195121/",
  },
  "logistique-transport": {
    id: 9090940,
    alt: "Magasinière en gilet de sécurité dans un entrepôt de marchandises",
    source: "https://www.pexels.com/photo/woman-and-men-working-in-warehouse-9090940/",
  },
} as const satisfies Record<string, Visuel>;

export type CleVisuel = keyof typeof VISUELS;

/**
 * Construit l'URL de l'image aux dimensions demandées.
 *
 * `fit=crop` fait recadrer côté serveur : le navigateur ne télécharge donc que
 * les pixels réellement affichés, et le cadrage ne dépend pas d'un `object-fit`
 * appliqué après coup.
 */
export function urlVisuel(id: number, largeur: number, hauteur: number): string {
  return (
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg` +
    `?auto=compress&cs=tinysrgb&fit=crop&w=${largeur}&h=${hauteur}`
  );
}
