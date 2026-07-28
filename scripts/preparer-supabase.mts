import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

/**
 * Crée les deux buckets de stockage attendus par l'application.
 *
 * Le réglage public/privé n'est pas cosmétique :
 *   - `pieces-jointes` est PRIVÉ. Il contient les plans, devis et photos
 *     envoyés par les visiteurs. L'admin y accède par liens signés temporaires.
 *     Le rendre public exposerait des documents clients à qui devine une URL.
 *   - `medias` est PUBLIC. Il contient les visuels de réalisations et
 *     d'actualités, destinés à être affichés sur le site et mis en cache.
 *
 * Le script est rejouable : un bucket déjà présent est laissé tel quel.
 *
 * Utilisation : node scripts/preparer-supabase.ts
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cleService = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !cleService) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises dans .env.",
  );
  process.exit(1);
}

const supabase = createClient(url, cleService, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKETS = [
  {
    nom: "pieces-jointes",
    public: false,
    tailleMax: 10 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    role: "pièces jointes des demandes de devis (privé)",
  },
  {
    nom: "medias",
    public: true,
    tailleMax: 5 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp"],
    role: "visuels de réalisations et d'actualités (public)",
  },
];

async function principal() {
  const { data: existants, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error("Impossible de lister les buckets :", error.message);
    process.exit(1);
  }

  const deja = new Set((existants ?? []).map((b) => b.name));

  for (const bucket of BUCKETS) {
    if (deja.has(bucket.nom)) {
      console.log(`= ${bucket.nom} existe déjà, laissé tel quel.`);
      continue;
    }

    const { error: erreurCreation } = await supabase.storage.createBucket(
      bucket.nom,
      {
        public: bucket.public,
        fileSizeLimit: bucket.tailleMax,
        allowedMimeTypes: bucket.types,
      },
    );

    if (erreurCreation) {
      console.error(`✗ ${bucket.nom} : ${erreurCreation.message}`);
      process.exit(1);
    }

    console.log(`✓ ${bucket.nom} créé, ${bucket.role}.`);
  }

  console.log("\nStockage prêt.");
}

principal().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
