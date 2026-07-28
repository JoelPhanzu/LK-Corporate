import { refuserEnProduction } from "./environnement.mts";

/**
 * Garde-fou placé devant les commandes réservées au développement.
 *
 * Enchaîné à la commande protégée dans package.json : si ce script sort en
 * erreur, npm interrompt la suite et la commande n'atteint jamais la base.
 *
 * Utilisation : node scripts/garde-developpement.mts "<nom de la commande>"
 */

refuserEnProduction(process.argv[2] ?? "cette commande");
