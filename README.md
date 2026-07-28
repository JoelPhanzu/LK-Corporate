# LK-Corporate

Site vitrine et back-office de **LK-CORPORATE S.A.S.U.**, entreprise de génie
civil, travaux publics et logistique (Moise Lwamba).

Le site présente les neuf domaines d'activité, publie les réalisations et les
actualités, et collecte les demandes de devis. Un espace d'administration permet
de gérer ces contenus et de suivre les demandes jusqu'à la livraison.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript |
| Styles | Tailwind CSS v4, tokens sémantiques |
| Base de données | PostgreSQL via Prisma |
| Stockage et authentification | Supabase |

## Démarrer en développement

```bash
npm install
cp .env.example .env    # puis renseigner les variables
npm run db:migrer       # crée et applique les migrations (développement)
npm run setup:stockage  # crée les buckets Supabase
npm run setup:admin     # crée le premier compte administrateur
npm run dev
```

Pour une mise en ligne, voir [Déploiement](#déploiement) : la séquence diffère,
et la commande de migration n'est pas la même.

`npm run verifier` contrôle l'installation de bout en bout : variables
d'environnement, connexion à la base, migrations, buckets, compte
administrateur. Chaque échec indique la commande qui le corrige.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Sert le build (port 3000, surchargeable via `PORT`) |
| `npm run lint` | ESLint |
| `npm run db:migrer` | Crée et applique une migration — **développement uniquement**, refusé si `ENVIRONNEMENT=production` |
| `npm run db:deployer` | Applique les migrations en attente — **production** |
| `npm run db:etat` | Affiche l'état des migrations (lecture seule) |
| `npm run db:studio` | Prisma Studio |
| `npm run verifier` | Contrôle de l'installation |
| `npm run marque:assets` | Régénère les déclinaisons du logo |

`postinstall` régénère le client Prisma à chaque installation : le dossier
`src/generated/prisma` n'est pas versionné, et huit fichiers sources en
dépendent.

## Environnements

Développement et production sont **deux projets Supabase distincts**. La
séparation ne porte pas que sur la base : un projet Supabase fournit aussi le
stockage et l'annuaire des comptes. Partager le projet reviendrait à ce qu'un
essai en local crée un compte administrateur réel, écrase un média publié ou
laisse des demandes de test dans la boîte du client.

Un `.env` ne décrit qu'un seul environnement, celui de la machine où il est
déposé. `ENVIRONNEMENT` (`developpement` ou `production`) désigne lequel : rien
dans les URL Supabase ne permet de deviner à quel projet on parle, les deux se
ressemblent trait pour trait.

Cette variable n'est pas décorative. Elle fait **refuser** `npm run db:migrer`
en production :

```
$ npm run db:migrer
Refus d'exécuter « prisma migrate dev » : ENVIRONNEMENT=production.
  cible : base aws-1-....pooler.supabase.com:5432, projet xxxx
Pour appliquer les migrations en production :
  npm run db:deployer
```

Les scripts qui écrivent (`setup:stockage`, `setup:admin`) et `verifier`
annoncent leur cible avant d'agir : une erreur de `.env` se voit à l'écran,
plutôt qu'après coup dans les données.

### Créer le projet de production

À faire une fois, depuis le tableau de bord Supabase :

1. Créer un second projet, dans la région la plus proche des utilisateurs.
2. Reporter ses identifiants dans le `.env` du serveur, avec
   `ENVIRONNEMENT="production"` et `NEXT_PUBLIC_SITE_URL` sur le domaine réel.
3. `npm run db:deployer` puis `npm run setup:stockage` pour créer le schéma et
   les buckets.
4. `npm run setup:admin` pour le premier compte, avec un mot de passe **différent
   de celui de développement**.
5. `npm run verifier` doit afficher `environnement : ⚠ PRODUCTION` et six
   contrôles au vert.

## Déploiement

L'application n'est pas exportable en statique. Elle comporte des routes rendues
à la demande, un middleware et des Server Actions : il lui faut un **processus
Node.js persistant**, donc un VPS ou une offre avec support Node, jamais un
hébergement mutualisé PHP.

```bash
npm ci                  # installe et régénère le client Prisma
# renseigner .env AVANT de construire, voir l'avertissement ci-dessous
npm run db:deployer     # applique les migrations en attente
npm run build
npm start
```

> **Renseigner `.env` avant `npm run build`.** Les variables préfixées
> `NEXT_PUBLIC_` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
> `NEXT_PUBLIC_SUPABASE_ANON_KEY`) sont figées dans le bundle au moment de la
> compilation. Construire sans elles produit un site qui démarre sans erreur
> mais dont le chat et l'authentification côté navigateur sont inertes, avec des
> URL absolues fausses dans les métadonnées. Les trois autres variables ne sont
> lues qu'à l'exécution.

`db:deployer` (`prisma migrate deploy`) est la seule commande de migration
admise en production : elle applique les migrations en attente, sans rien
générer ni proposer, et ne fait rien si la base est déjà à jour. **Ne jamais
lancer `db:migrer` (`prisma migrate dev`) sur une base de production** : cette
commande est interactive et peut proposer de réinitialiser la base.

Les migrations passent par `DIRECT_URL` (port 5432) et non par le pooler de
transactions (port 6543), qui refuse les commandes DDL. `prisma.config.ts` s'en
charge déjà.

Prévoir enfin un reverse proxy vers le port Node, et l'accès sortant HTTPS vers
`images.pexels.com` et `*.supabase.co`.

## Organisation

```
src/app/(public)     pages publiques
src/app/(admin)      espace d'administration
src/components       composants partagés (ui, public, admin)
src/lib              domaines métier, accès aux données, validations
prisma               schéma et migrations
scripts              outillage d'installation et de marque
Images et logos      fichiers source du logo, livrés par le client
```

## Charte graphique

Les couleurs sont prélevées sur le logo définitif : marine `#1b2a4a`, rouge
`#bf3324`, rose `#dda197`. Elles sont déclarées une seule fois dans
`src/app/globals.css`, sous forme de tokens sémantiques (`surface`, `ink`,
`accent`, `line`) que les composants sont seuls à consommer. Aucune couleur
brute ne doit apparaître dans un composant : c'est ce qui permet de rebrander le
site en ne touchant qu'un fichier, et de basculer en mode sombre sans disséminer
des variantes `dark:`.

Le rouge n'est jamais posé en texte sur un aplat marine, où il ne contraste qu'à
2,5:1. Le token `accent-on-brand` (le rose du logo, 6,5:1) est prévu pour cet
usage.

Les déclinaisons du logo sont dérivées des fichiers du client par
`npm run marque:assets`, jamais redessinées à la main.

## Visuels

Les photographies actuelles proviennent de la banque d'images Pexels (licence
commerciale, aucune image générée par IA) et sont référencées dans
`src/lib/photos.ts`. **Les personnes qui y figurent ne sont pas des
collaborateurs de LK-CORPORATE et les chantiers ne sont pas les siens** : les
textes alternatifs décrivent donc la scène sans l'attribuer à l'entreprise.
Elles ont vocation à être remplacées par les photos du client.
