-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTRUMENTISTE');

-- CreateEnum
CREATE TYPE "ProthesisType" AS ENUM ('HIP', 'KNEE', 'SHOULDER');

-- CreateEnum
CREATE TYPE "ProthesisSubType" AS ENUM ('PIH_ZIMED', 'PTH_OTIMED', 'PTG_ZIMED', 'PTG_PERMIDCA', 'PTE_INVERSEE', 'PTE_ANATOMIQUE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'VIREMENT', 'CHEQUE', 'CARTE_BANCAIRE');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('VALIDEE', 'AFFECTEE', 'REPORTEE', 'ANNULEE', 'COMPLETEE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commands" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "ProthesisType" NOT NULL,
    "subType" "ProthesisSubType" NOT NULL,
    "dateIntervention" TIMESTAMP(3) NOT NULL,
    "dateLivraison" TIMESTAMP(3) NOT NULL,
    "lienIntervention" TEXT,
    "ville" TEXT NOT NULL,
    "modePaiement" "PaymentMode" NOT NULL,
    "status" "CommandStatus" NOT NULL DEFAULT 'VALIDEE',
    "commentaire" TEXT,
    "completionReport" TEXT,
    "instrumentisteId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_products" (
    "commandId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "command_products_pkey" PRIMARY KEY ("commandId","productId")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandId" INTEGER NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "commands_reference_key" ON "commands"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_instrumentisteId_fkey" FOREIGN KEY ("instrumentisteId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_products" ADD CONSTRAINT "command_products_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "commands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_products" ADD CONSTRAINT "command_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "commands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
