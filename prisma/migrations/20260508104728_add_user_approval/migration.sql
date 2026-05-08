-- AlterTable
ALTER TABLE "users" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: mark all pre-existing users as approved so we don't lock them out.
UPDATE "users" SET "approved" = true;
