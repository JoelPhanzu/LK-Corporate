import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Instance unique de Prisma, créée paresseusement.
 *
 * Prisma 7 ne résout plus l'URL depuis le schéma : la connexion passe
 * obligatoirement par un driver adapter, construit ici sur DATABASE_URL
 * (l'URL « pooler » de Supabase).
 *
 * L'instanciation est différée au premier accès, et non faite à l'import :
 * sinon une DATABASE_URL absente ferait échouer la compilation de toute page
 * important ce module, y compris celles qui n'interrogent jamais la base.
 * L'erreur doit se produire à la requête, là où elle est compréhensible.
 *
 * Le cache sur `globalThis` évite qu'un rechargement à chaud en développement
 * n'ouvre un pool de connexions supplémentaire à chaque modification.
 */
const globalPourPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function client(): PrismaClient {
  if (globalPourPrisma.prisma) return globalPourPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL est absente. Copier .env.example vers .env et la renseigner.",
    );
  }

  const instance = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  // En production, on ne garde volontairement pas la référence globale :
  // le module reste chargé pour toute la durée de vie du processus.
  if (process.env.NODE_ENV !== "production") {
    globalPourPrisma.prisma = instance;
  }
  return instance;
}

let instanceProduction: PrismaClient | undefined;

/**
 * Proxy transparent : `prisma.demande.findUnique(...)` fonctionne comme avec
 * un client classique, mais rien n'est instancié tant qu'aucune propriété
 * n'est lue.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_cible, propriete, recepteur) {
    instanceProduction ??= client();
    const valeur = Reflect.get(instanceProduction, propriete, recepteur);
    return typeof valeur === "function"
      ? valeur.bind(instanceProduction)
      : valeur;
  },
});
