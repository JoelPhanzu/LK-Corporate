import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { annoncerCible } from "./environnement.mts";

/**
 * Contrôle de bout en bout de l'installation.
 *
 * Vérifie dans l'ordre les dépendances : variables d'environnement, connexion
 * à la base, migration appliquée, buckets de stockage, compte administrateur.
 * Chaque échec indique la commande ou l'action qui le corrige, plutôt que de
 * se contenter d'un message d'erreur brut.
 *
 * Utilisation : node scripts/verifier-installation.ts
 */

const controles: { intitule: string; ok: boolean; detail: string }[] = [];

function noter(intitule: string, ok: boolean, detail: string) {
  controles.push({ intitule, ok, detail });
}

async function principal() {
  // La cible est annoncée d'emblée : sans elle, un rapport « tout est en
  // place » ne dit pas de quelle installation il parle.
  annoncerCible("Vérification de l'installation.");

  // ---------------------------------------------------- variables d'environnement
  const requises = [
    "ENVIRONNEMENT",
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const manquantes = requises.filter((cle) => !process.env[cle]);

  noter(
    "Variables d'environnement",
    manquantes.length === 0,
    manquantes.length === 0
      ? "Toutes présentes."
      : `Manquantes : ${manquantes.join(", ")}. Copier .env.example vers .env et renseigner.`,
  );

  if (!process.env.DATABASE_URL) {
    rendre();
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes("johndoe")) {
    noter(
      "DATABASE_URL",
      false,
      "C'est encore l'URL d'exemple générée par prisma init. La remplacer par celle du projet Supabase.",
    );
    rendre();
    process.exit(1);
  }

  // ---------------------------------------------------------------- base de données
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  let baseJoignable = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    baseJoignable = true;
    noter("Connexion à la base", true, "Postgres répond.");
  } catch (erreur) {
    noter(
      "Connexion à la base",
      false,
      `Injoignable : ${erreur instanceof Error ? erreur.message : String(erreur)}`,
    );
  }

  let comptes: { nom: string; email: string; role: string; actif: boolean }[] =
    [];

  if (baseJoignable) {
    try {
      comptes = await prisma.utilisateurAdmin.findMany({
        orderBy: { creeLe: "asc" },
        select: { nom: true, email: true, role: true, actif: true },
      });
      noter("Migration appliquée", true, "Les tables existent.");
    } catch {
      noter(
        "Migration appliquée",
        false,
        "Tables absentes. En développement : npm run db:migrer. " +
          "En production : npm run db:deployer (ne jamais lancer `migrate dev` " +
          "sur une base de production, il peut proposer de la réinitialiser).",
      );
    }
  }

  // ------------------------------------------------------------------- stockage
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cleService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && cleService) {
    try {
      const supabase = createClient(url, cleService, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.storage.listBuckets();

      if (error) throw error;

      const parNom = new Map((data ?? []).map((b) => [b.name, b]));
      const pieces = parNom.get("pieces-jointes");
      const medias = parNom.get("medias");

      noter(
        "Bucket pieces-jointes",
        Boolean(pieces) && pieces?.public === false,
        !pieces
          ? "Absent. Lancer : node scripts/preparer-supabase.ts"
          : pieces.public
            ? "PUBLIC alors qu'il doit être PRIVÉ : les documents clients seraient exposés."
            : "Présent et privé.",
      );

      noter(
        "Bucket medias",
        Boolean(medias) && medias?.public === true,
        !medias
          ? "Absent. Lancer : node scripts/preparer-supabase.ts"
          : medias.public
            ? "Présent et public."
            : "Privé alors qu'il doit être public : les visuels du site ne s'afficheraient pas.",
      );
    } catch (erreur) {
      noter(
        "Stockage Supabase",
        false,
        `Inaccessible : ${erreur instanceof Error ? erreur.message : String(erreur)}`,
      );
    }
  }

  // ------------------------------------------------------- compte administrateur
  if (baseJoignable) {
    const actifs = comptes.filter((compte) => compte.actif);
    noter(
      "Compte administrateur",
      actifs.length > 0,
      actifs.length > 0
        ? comptes
            .map(
              (compte) =>
                `${compte.nom} <${compte.email}>, ${compte.role}${compte.actif ? "" : ", DÉSACTIVÉ"}`,
            )
            .join("\n  ")
        : 'Aucun compte actif. Lancer : node scripts/creer-admin.mts <email> <motDePasse> "<nom>"',
    );
  }

  await prisma.$disconnect();
  const tousVerts = rendre();
  // `process.exitCode` plutôt que `process.exit()` : ce dernier coupe le
  // processus pendant que la connexion Postgres se referme encore, ce qui
  // provoque une assertion libuv en fin de sortie sous Windows.
  process.exitCode = tousVerts ? 0 : 1;
}

function rendre(): boolean {
  console.log("\nVérification de l'installation LK-CORPORATE\n");
  for (const controle of controles) {
    console.log(`${controle.ok ? "✓" : "✗"} ${controle.intitule}`);
    console.log(`  ${controle.detail}`);
  }

  const echecs = controles.filter((c) => !c.ok).length;
  console.log(
    echecs === 0
      ? "\nTout est en place. L'application peut démarrer : npm run dev"
      : `\n${echecs} point(s) à corriger avant de démarrer.`,
  );
  return echecs === 0;
}

principal().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
