-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('NOUVELLE', 'EN_COURS', 'TRAITEE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "StatutLivraison" AS ENUM ('RECUE', 'EN_PREPARATION', 'EN_TRANSIT', 'LIVREE');

-- CreateEnum
CREATE TYPE "TypeDemande" AS ENUM ('DEVIS', 'COMMANDE');

-- CreateEnum
CREATE TYPE "RoleAdmin" AS ENUM ('PROPRIETAIRE', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "Expediteur" AS ENUM ('VISITEUR', 'EQUIPE');

-- CreateTable
CREATE TABLE "utilisateurs_admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "RoleAdmin" NOT NULL DEFAULT 'AGENT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "entreprise" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TypeDemande" NOT NULL DEFAULT 'DEVIS',
    "domaineSlug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" TEXT,
    "delaiSouhaite" TEXT,
    "adresseLivraison" TEXT,
    "statut" "StatutDemande" NOT NULL DEFAULT 'NOUVELLE',
    "leadId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pieces_jointes" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pieces_jointes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes_internes" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "auteurId" TEXT,
    "contenu" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_internes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livraisons" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "statut" "StatutLivraison" NOT NULL DEFAULT 'RECUE',
    "transporteur" TEXT,
    "datePrevue" TIMESTAMP(3),
    "dateLivree" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livraisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapes_livraison" (
    "id" TEXT NOT NULL,
    "livraisonId" TEXT NOT NULL,
    "statut" "StatutLivraison" NOT NULL,
    "commentaire" TEXT,
    "auteurId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapes_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "jetonVisiteur" TEXT NOT NULL,
    "leadId" TEXT,
    "visiteurNom" TEXT,
    "visiteurEmail" TEXT,
    "ouverte" BOOLEAN NOT NULL DEFAULT true,
    "dernierMessageLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "expediteur" "Expediteur" NOT NULL,
    "contenu" TEXT NOT NULL,
    "auteurId" TEXT,
    "luParEquipe" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_contact" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "chapo" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "imageChemin" TEXT,
    "publie" BOOLEAN NOT NULL DEFAULT false,
    "publieLe" TIMESTAMP(3),
    "auteurId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realisations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "localisation" TEXT,
    "domaineSlug" TEXT NOT NULL,
    "photoAvantChemin" TEXT,
    "photoApresChemin" TEXT,
    "photosChemins" TEXT[],
    "publie" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "realisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenus_site" (
    "cle" TEXT NOT NULL,
    "valeur" JSONB NOT NULL,
    "modifieLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenus_site_pkey" PRIMARY KEY ("cle")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_admin_email_key" ON "utilisateurs_admin"("email");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_creeLe_idx" ON "leads"("creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_reference_key" ON "demandes"("reference");

-- CreateIndex
CREATE INDEX "demandes_statut_creeLe_idx" ON "demandes"("statut", "creeLe");

-- CreateIndex
CREATE INDEX "demandes_domaineSlug_idx" ON "demandes"("domaineSlug");

-- CreateIndex
CREATE INDEX "pieces_jointes_demandeId_idx" ON "pieces_jointes"("demandeId");

-- CreateIndex
CREATE INDEX "notes_internes_demandeId_creeLe_idx" ON "notes_internes"("demandeId", "creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "livraisons_demandeId_key" ON "livraisons"("demandeId");

-- CreateIndex
CREATE INDEX "livraisons_statut_idx" ON "livraisons"("statut");

-- CreateIndex
CREATE INDEX "etapes_livraison_livraisonId_creeLe_idx" ON "etapes_livraison"("livraisonId", "creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_jetonVisiteur_key" ON "conversations"("jetonVisiteur");

-- CreateIndex
CREATE INDEX "conversations_ouverte_dernierMessageLe_idx" ON "conversations"("ouverte", "dernierMessageLe");

-- CreateIndex
CREATE INDEX "messages_conversationId_creeLe_idx" ON "messages"("conversationId", "creeLe");

-- CreateIndex
CREATE INDEX "messages_luParEquipe_idx" ON "messages"("luParEquipe");

-- CreateIndex
CREATE INDEX "messages_contact_traite_creeLe_idx" ON "messages_contact"("traite", "creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_publie_publieLe_idx" ON "articles"("publie", "publieLe");

-- CreateIndex
CREATE UNIQUE INDEX "realisations_slug_key" ON "realisations"("slug");

-- CreateIndex
CREATE INDEX "realisations_publie_ordre_idx" ON "realisations"("publie", "ordre");

-- CreateIndex
CREATE INDEX "realisations_domaineSlug_idx" ON "realisations"("domaineSlug");

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes_internes" ADD CONSTRAINT "notes_internes_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes_internes" ADD CONSTRAINT "notes_internes_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livraisons" ADD CONSTRAINT "livraisons_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapes_livraison" ADD CONSTRAINT "etapes_livraison_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "livraisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapes_livraison" ADD CONSTRAINT "etapes_livraison_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
