import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

/**
 * Crée le premier compte de l'espace admin.
 *
 * L'accès repose sur DEUX enregistrements distincts qu'il faut créer ensemble :
 *   1. un utilisateur Supabase Auth, qui porte l'email et le mot de passe ;
 *   2. une ligne `utilisateurs_admin` portant le MÊME identifiant, qui porte le
 *      rôle applicatif.
 * Créer l'un sans l'autre donne un compte qui s'authentifie mais reste refusé
 * à l'entrée. Ce script fait les deux.
 *
 * Utilisation :
 *   node scripts/creer-admin.ts <email> <motDePasse> "<nom complet>"
 *
 * Node 24 exécute les fichiers TypeScript directement, sans compilation.
 */

const [email, motDePasse, nom] = process.argv.slice(2);

if (!email || !motDePasse || !nom) {
  console.error(
    'Utilisation : node scripts/creer-admin.ts <email> <motDePasse> "<nom complet>"',
  );
  process.exit(1);
}

if (motDePasse.length < 12) {
  console.error(
    "Le mot de passe doit faire au moins 12 caractères : ce compte donne accès à toutes les données clients.",
  );
  process.exit(1);
}

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cleService = process.env.SUPABASE_SERVICE_ROLE_KEY;
const urlBase = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!urlSupabase || !cleService || !urlBase) {
  console.error(
    "Variables manquantes. NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et DATABASE_URL sont requises dans .env.",
  );
  process.exit(1);
}

const supabase = createClient(urlSupabase, cleService, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlBase }),
});

async function principal() {
  // `email_confirm` évite d'exiger une validation par email pour un compte
  // interne créé volontairement par l'administrateur.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
  });

  let identifiant = data?.user?.id;

  if (error) {
    // Cas courant : le compte Auth existe déjà d'une tentative précédente.
    // On le retrouve plutôt que d'échouer, pour que le script soit rejouable.
    const { data: liste } = await supabase.auth.admin.listUsers();
    const existant = liste?.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!existant) {
      console.error("Création du compte Supabase Auth impossible :", error.message);
      process.exit(1);
    }

    identifiant = existant.id;

    // Le mot de passe fourni fait foi : relancer le script sur un compte
    // existant sert précisément à le réinitialiser quand il a été perdu ou
    // mal saisi. Sans cette mise à jour, le script serait rejouable mais
    // incapable de débloquer un accès.
    const { error: erreurMaj } = await supabase.auth.admin.updateUserById(
      existant.id,
      { password: motDePasse, email_confirm: true },
    );

    if (erreurMaj) {
      console.error("Mise à jour du mot de passe impossible :", erreurMaj.message);
      process.exit(1);
    }

    console.warn("Compte Supabase Auth existant : mot de passe réinitialisé.");
  }

  if (!identifiant) {
    console.error("Aucun identifiant utilisateur obtenu.");
    process.exit(1);
  }

  await prisma.utilisateurAdmin.upsert({
    where: { id: identifiant },
    create: { id: identifiant, email, nom, role: "PROPRIETAIRE", actif: true },
    update: { email, nom, role: "PROPRIETAIRE", actif: true },
  });

  console.log(`Compte administrateur prêt : ${email}`);
  console.log("Connexion sur /admin/connexion");
}

principal()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
