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

## Démarrer

```bash
npm install
cp .env.example .env    # puis renseigner les variables
npm run db:migrer       # applique les migrations Prisma
npm run setup:stockage  # crée les buckets Supabase
npm run setup:admin     # crée le premier compte administrateur
npm run dev
```

`npm run verifier` contrôle l'installation de bout en bout : variables
d'environnement, connexion à la base, migrations, buckets, compte
administrateur. Chaque échec indique la commande qui le corrige.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | ESLint |
| `npm run db:migrer` | Migrations Prisma |
| `npm run db:studio` | Prisma Studio |
| `npm run verifier` | Contrôle de l'installation |
| `npm run marque:assets` | Régénère les déclinaisons du logo |

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
