import "dotenv/config";

/**
 * Identification de l'environnement visé par les scripts d'outillage.
 *
 * Développement et production sont deux projets Supabase distincts, donc deux
 * bases, deux stockages et deux annuaires de comptes. Rien dans une URL ne
 * permet de deviner lequel est lequel : les deux se ressemblent trait pour
 * trait. C'est donc une variable explicite, `ENVIRONNEMENT`, qui tranche.
 *
 * Deux usages :
 *   - annoncer la cible avant toute écriture, pour qu'une erreur de `.env` se
 *     voie à l'écran plutôt qu'après coup dans les données ;
 *   - refuser les commandes destructrices hors développement.
 */

export type Environnement = "developpement" | "production";

const VALEURS: Environnement[] = ["developpement", "production"];

export function environnement(): Environnement {
  const brut = process.env.ENVIRONNEMENT?.trim().toLowerCase();

  // L'absence de la variable n'est pas traitée comme « développement » : un
  // `.env` de production incomplet passerait alors les garde-fous sans bruit.
  if (!brut) {
    console.error(
      "ENVIRONNEMENT n'est pas définie dans .env.\n" +
        "Renseigner `ENVIRONNEMENT=developpement` ou `ENVIRONNEMENT=production`.\n" +
        "Voir .env.example.",
    );
    process.exit(1);
  }

  if (!VALEURS.includes(brut as Environnement)) {
    console.error(
      `ENVIRONNEMENT vaut « ${brut} », valeur inattendue.\n` +
        `Valeurs admises : ${VALEURS.join(", ")}.`,
    );
    process.exit(1);
  }

  return brut as Environnement;
}

/** Hôte de la base et référence du projet Supabase, sans aucun identifiant. */
export function cible(): string {
  const morceaux: string[] = [];

  try {
    const base = new URL(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
    morceaux.push(`base ${base.hostname}:${base.port}`);
  } catch {
    morceaux.push("base non configurée");
  }

  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) {
    // La référence du projet suffit à distinguer deux environnements.
    morceaux.push(`projet ${supabase.replace(/^https:\/\//, "").split(".")[0]}`);
  }

  return morceaux.join(", ");
}

/** Affiche la cible avant une écriture. À appeler en tête de chaque script. */
export function annoncerCible(action: string): Environnement {
  const env = environnement();
  const marque = env === "production" ? "⚠ PRODUCTION" : "développement";
  console.log(`${action}\n  environnement : ${marque}\n  cible : ${cible()}\n`);
  return env;
}

/**
 * Interrompt une commande réservée au développement.
 *
 * `prisma migrate dev` en est le cas type : elle est interactive, génère des
 * fichiers de migration et peut proposer de réinitialiser la base. Sur la
 * production, l'erreur ne se rattrape pas.
 */
export function refuserEnProduction(commande: string): void {
  const env = environnement();

  if (env === "production") {
    console.error(
      `Refus d'exécuter « ${commande} » : ENVIRONNEMENT=production.\n` +
        `  cible : ${cible()}\n\n` +
        "Cette commande est réservée au développement ; elle peut réinitialiser\n" +
        "la base. Pour appliquer les migrations en production :\n" +
        "  npm run db:deployer",
    );
    process.exit(1);
  }
}
