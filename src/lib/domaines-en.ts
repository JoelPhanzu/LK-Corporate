import { DOMAINES, type Domaine } from "@/lib/domaines";
import type { Langue } from "@/lib/i18n";

/**
 * Traduction anglaise des neuf domaines d'activité.
 *
 * Surcouche et non copie : `domaines.ts` reste la source unique de la
 * structure (slugs, ordre) et du texte français, qu'utilisent aussi l'espace
 * d'administration et le seed. Seul le texte affichable est redit ici, ce qui
 * évite qu'un domaine ajouté d'un côté manque de l'autre — l'index typé sur
 * les slugs le signalerait à la compilation.
 */

type TexteDomaine = Omit<Domaine, "slug">;

const EN: Record<string, TexteDomaine> = {
  "commerce-general": {
    nom: "General trade",
    titre: "General trade",
    resume:
      "Sourcing and trading of goods for businesses, institutions and individuals.",
    prestations: [
      "Sourcing and purchasing of goods",
      "Wholesale and semi-wholesale trading",
      "Recurring supply contracts for businesses",
      "Import handling and customs clearance",
    ],
  },
  "genie-civil": {
    nom: "Civil engineering and construction",
    titre: "Civil engineering works, buildings and bridges",
    resume:
      "Construction of buildings and structures, from earthworks to handover of the keys.",
    prestations: [
      "Construction of residential and industrial buildings",
      "Structures: bridges, culverts, crossing works",
      "Earthworks and foundations",
      "Structural and finishing works",
      "Site supervision and trade coordination",
    ],
  },
  renovation: {
    nom: "Renovation",
    titre: "Renovation of residential and non-residential buildings",
    resume:
      "Refurbishment, rehabilitation and code compliance for existing buildings.",
    prestations: [
      "Heavy rehabilitation and structural repair",
      "Renovation of offices and commercial premises",
      "Roofing, facade and joinery repair",
      "Electrical and plumbing code compliance",
      "Interior fit-out and finishes",
    ],
  },
  terrains: {
    nom: "Land purchase and sale",
    titre: "Land purchase and sale",
    resume:
      "Land support, from finding a plot to securing the title deeds.",
    prestations: [
      "Plot search against your requirements",
      "Verification of title deeds and land status",
      "Brokerage between sellers and buyers",
      "Administrative support through to transfer",
    ],
  },
  "travaux-publics": {
    nom: "Public works",
    titre: "Public works and outdoor development",
    resume:
      "Outdoor development, street lighting, drainage and green spaces for local authorities and businesses.",
    prestations: [
      "Outdoor development and roadworks",
      "Street lighting and dry networks",
      "Drainage and stormwater management",
      "Landscaping and green space maintenance",
      "Paving, kerbs and drainage works",
    ],
  },
  "materiaux-equipements": {
    nom: "Materials and equipment",
    titre: "Supply of building materials and electrical equipment",
    resume:
      "Supply of building materials and electrical equipment, delivered to site.",
    prestations: [
      "Building materials: cement, steel, aggregates, timber",
      "Site equipment and tooling",
      "Electrical equipment and fittings",
      "Cabling, switchboards and protection devices",
      "Direct delivery to site",
    ],
  },
  "energie-solaire": {
    nom: "Solar energy",
    titre: "Solar panels: supply, installation, maintenance",
    resume:
      "Photovoltaic installations sized for homes, businesses and off-grid sites.",
    prestations: [
      "Needs assessment and system sizing",
      "Supply of panels, inverters and batteries",
      "Installation and commissioning",
      "Preventive and corrective maintenance",
      "Off-grid solutions for remote sites",
    ],
  },
  "nettoyage-entretien": {
    nom: "Cleaning and maintenance",
    titre: "Cleaning and maintenance of offices and buildings",
    resume:
      "Regular or one-off cleaning services for offices, buildings and business premises.",
    prestations: [
      "Regular cleaning of offices and premises",
      "Post-construction cleaning",
      "Building and common area maintenance",
      "Window and specialist surface cleaning",
      "Recurring maintenance contracts",
    ],
  },
  "logistique-transport": {
    nom: "Logistics and transport",
    titre: "Logistics, transport and supply",
    resume:
      "Freight transport organisation and supply management on behalf of third parties.",
    prestations: [
      "Transport of goods and materials",
      "Route organisation and planning",
      "Procurement on behalf of third parties",
      "Handling and loading",
      "Step-by-step delivery tracking",
    ],
  },
};

/** Les neuf domaines dans la langue demandée, dans l'ordre de référence. */
export function domaines(langue: Langue): Domaine[] {
  if (langue === "fr") return DOMAINES;
  return DOMAINES.map((domaine) => ({
    ...domaine,
    ...(EN[domaine.slug] ?? {}),
  }));
}

export function domaine(slug: string, langue: Langue): Domaine | undefined {
  return domaines(langue).find((item) => item.slug === slug);
}
