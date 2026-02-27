/*
  Warnings:

  - The values [CARTE_BANCAIRE] on the enum `PaymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('COMMAND_CREATE', 'COMMAND_UPDATE', 'COMMAND_DELETE', 'COMMAND_STATUS_UPDATE', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMode_new" AS ENUM ('CASH', 'VIREMENT', 'CHEQUE', 'CAHIER_DE_CHARGE');
ALTER TABLE "commands" ALTER COLUMN "modePaiement" TYPE "PaymentMode_new" USING ("modePaiement"::text::"PaymentMode_new");
ALTER TYPE "PaymentMode" RENAME TO "PaymentMode_old";
ALTER TYPE "PaymentMode_new" RENAME TO "PaymentMode";
DROP TYPE "public"."PaymentMode_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[];
